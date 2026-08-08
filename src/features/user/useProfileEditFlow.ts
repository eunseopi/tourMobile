import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { authApi } from "src/api/auth";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useProfileEditor } from "src/features/user/useProfileEditor";
import type { UploadableImage } from "src/types/SpotTypes";

type UseProfileEditFlowOptions = {
  onComplete: () => void;
};

function validateNickname(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "닉네임을 입력해주세요.";
  if (trimmed.length < 2) return "닉네임은 2자 이상이어야 해요.";
  if (trimmed.length > 20) return "닉네임은 20자 이하여야 해요.";
  return "";
}

function toUploadableImage(asset: ImagePicker.ImagePickerAsset): UploadableImage {
  return {
    uri: asset.uri,
    name: asset.fileName ?? `profile-${Date.now()}.jpg`,
    type: asset.mimeType ?? "image/jpeg",
  };
}

export function useProfileEditFlow({ onComplete }: UseProfileEditFlowOptions) {
  const { data: me, isLoading, isError, refetch } = useSessionMe();
  const { editSave, deleteProfileImage, isSaving, isDeletingImage } = useProfileEditor();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<UploadableImage | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  useEffect(() => {
    if (me?.nickname) setNickname(me.nickname);
  }, [me?.nickname]);

  const nicknameChanged = useMemo(() => (me?.nickname ?? "") !== nickname, [me?.nickname, nickname]);
  const profileUri = selectedImage?.uri ?? me?.profile ?? undefined;
  const fallbackInitial = (me?.nickname || me?.name || "제").slice(0, 1);
  const hasImageChange = !!selectedImage;
  const isSubmitDisabled = isSaving || (!nicknameChanged && !hasImageChange);

  const handleChangeNickname = (value: string) => {
    setNickname(value);
    if (error) setError("");
  };

  const handleValidateNickname = async () => {
    const nextError = validateNickname(nickname);
    setError(nextError);
    if (nextError) return;

    const trimmed = nickname.trim();
    if (trimmed === (me?.nickname ?? "").trim()) {
      Alert.alert("확인", "현재 사용 중인 닉네임이에요.");
      return;
    }

    try {
      setIsCheckingNickname(true);
      const response = await authApi.checkNicknameDuplicate(trimmed);
      const body = response.data as { success: boolean; message?: string };

      if (body.success) {
        setError("");
        Alert.alert("사용 가능", "이 닉네임은 사용할 수 있어요.");
      } else {
        const message = body.message || "이미 사용 중인 닉네임입니다.";
        setError(message);
        Alert.alert("중복된 닉네임", message);
      }
    } catch (e: any) {
      Alert.alert(
        "확인 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleSave = async () => {
    const nextError = validateNickname(nickname);
    setError(nextError);
    if (nextError || !me) return;

    try {
      await editSave({
        newNickname: nickname,
        originalNickname: me.nickname,
        file: selectedImage,
      });
      Alert.alert("저장 완료", "프로필 정보가 업데이트되었어요.");
      onComplete();
    } catch (e: any) {
      Alert.alert(
        "저장 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "프로필 이미지를 선택하려면 사진 보관함 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;

      setSelectedImage(toUploadableImage(asset));
    } catch {
      Alert.alert("선택 실패", "이미지를 가져오지 못했어요.");
    }
  };

  const handleTakeImage = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "프로필 이미지를 촬영하려면 카메라 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;

      setSelectedImage(toUploadableImage(asset));
    } catch {
      Alert.alert("촬영 실패", "이미지를 촬영하지 못했어요.");
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!me?.profile && !selectedImage) return;

    if (selectedImage) {
      setSelectedImage(null);
      return;
    }

    try {
      await deleteProfileImage();
      Alert.alert("삭제 완료", "프로필 이미지가 삭제되었어요.");
    } catch (e: any) {
      Alert.alert(
        "삭제 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요.",
      );
    }
  };

  return {
    me,
    nickname,
    error,
    profileUri,
    fallbackInitial,
    selectedImage,
    isLoading,
    isError,
    isSaving,
    isDeletingImage,
    isCheckingNickname,
    isSubmitDisabled,
    refetch,
    handleChangeNickname,
    handleValidateNickname,
    handleSave,
    handlePickImage,
    handleTakeImage,
    handleDeleteProfileImage,
  };
}

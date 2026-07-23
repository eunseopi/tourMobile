import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useProfileEditor } from "src/features/user/useProfileEditor";
import type { UploadableImage } from "src/types/SpotTypes";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileEdit">;

export default function ProfileEditScreen({ navigation }: Props) {
  const { data: me, isLoading, isError, refetch } = useSessionMe();
  const { editSave, deleteProfileImage, isSaving, isDeletingImage } = useProfileEditor();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<UploadableImage | null>(null);

  useEffect(() => {
    if (me?.nickname) setNickname(me.nickname);
  }, [me?.nickname]);

  const validate = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "닉네임을 입력해주세요.";
    if (trimmed.length < 2) return "닉네임은 2자 이상이어야 해요.";
    if (trimmed.length > 20) return "닉네임은 20자 이하여야 해요.";
    return "";
  };

  const handleSave = async () => {
    const nextError = validate(nickname);
    setError(nextError);
    if (nextError || !me) return;

    try {
      await editSave({
        newNickname: nickname,
        originalNickname: me.nickname,
        file: selectedImage,
      });
      Alert.alert("저장 완료", "프로필 정보가 업데이트되었어요.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        "저장 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName ?? `profile-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName ?? `profile-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });
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
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>프로필 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !me) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>프로필 정보를 불러오지 못했어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          <Text style={styles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>이메일</Text>
      <View style={styles.readonlyField}>
        <Text style={styles.readonlyText}>{me.email}</Text>
      </View>

      <Text style={[styles.label, styles.spacingTop]}>닉네임</Text>
      <TextInput
        value={nickname}
        onChangeText={(value) => {
          setNickname(value);
          if (error) setError("");
        }}
        placeholder="닉네임을 입력하세요"
        placeholderTextColor="#aaa"
        maxLength={20}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={[styles.label, styles.spacingTop]}>프로필 이미지</Text>
      <View style={styles.imageSection}>
        {selectedImage?.uri || me.profile ? (
          <Image
            source={{ uri: selectedImage?.uri ?? me.profile ?? undefined }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileFallback}>
            <Text style={styles.profileFallbackText}>
              {(me.nickname || me.name || "제").slice(0, 1)}
            </Text>
          </View>
        )}

        <View style={styles.imageButtons}>
          <Pressable style={styles.secondaryButton} onPress={handlePickImage}>
            <Text style={styles.secondaryButtonText}>이미지 선택</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleTakeImage}>
            <Text style={styles.secondaryButtonText}>지금 촬영</Text>
          </Pressable>
          {selectedImage || me.profile ? (
            <Pressable
              style={styles.secondaryGhostButton}
              onPress={handleDeleteProfileImage}
              disabled={isDeletingImage}
            >
              <Text style={styles.secondaryGhostButtonText}>
                {selectedImage ? "선택 취소" : isDeletingImage ? "삭제 중..." : "이미지 삭제"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Pressable
        style={[styles.primaryButton, isSaving && styles.disabledButton]}
        disabled={isSaving}
        onPress={handleSave}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "저장 중..." : "저장하기"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#444",
  },
  spacingTop: {
    marginTop: 18,
  },
  readonlyField: {
    marginTop: 8,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
  },
  readonlyText: {
    fontSize: 15,
    color: "#555",
  },
  input: {
    marginTop: 8,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#f9f9f9",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    fontSize: 15,
    color: "#222",
  },
  inputError: {
    borderColor: "#d33",
  },
  helpBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#fff4ec",
  },
  helpText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#855234",
  },
  imageSection: {
    marginTop: 10,
    gap: 14,
  },
  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#eee",
  },
  profileFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffccaa",
  },
  profileFallbackText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
  },
  imageButtons: {
    gap: 10,
  },
  secondaryButton: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4ec",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b532f",
  },
  secondaryGhostButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
  },
  secondaryGhostButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },
  primaryButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
  errorText: {
    marginTop: 8,
    color: "#d33",
  },
});

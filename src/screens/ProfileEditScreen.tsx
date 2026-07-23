import { useEffect, useMemo, useState } from "react";
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
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
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

  const nicknameChanged = useMemo(
    () => (me?.nickname ?? "") !== nickname,
    [me?.nickname, nickname]
  );

  const hasImageChange = !!selectedImage;
  const disabled = isSaving || (!nicknameChanged && !hasImageChange);

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
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>프로필 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !me) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>프로필 정보를 불러오지 못했어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  const profileUri = selectedImage?.uri ?? me.profile ?? undefined;

  return (
    <View style={commonStyles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.profileUploadBox}>
          <Pressable style={styles.profileUploadWrapper} onPress={handlePickImage}>
            {profileUri ? (
              <Image source={{ uri: profileUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileFallback}>
                <Text style={styles.profileFallbackText}>
                  {(me.nickname || me.name || "제").slice(0, 1)}
                </Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraText}>+</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.caption}>닉네임을 입력해주세요.</Text>
        <View style={styles.nicknameRow}>
          <TextInput
            value={nickname}
            onChangeText={(value) => {
              setNickname(value);
              if (error) setError("");
            }}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor={colors.gray[400]}
            maxLength={20}
            style={[styles.input, error ? styles.inputError : null]}
          />
          <Pressable style={styles.checkButton} onPress={() => setError(validate(nickname))}>
            <Text style={styles.checkButtonText}>확인</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.messageError}>{error}</Text> : null}

        <View style={styles.imageButtons}>
          <Pressable style={commonStyles.secondaryButton} onPress={handlePickImage}>
            <Text style={commonStyles.secondaryButtonText}>이미지 선택</Text>
          </Pressable>
          <Pressable style={commonStyles.secondaryButton} onPress={handleTakeImage}>
            <Text style={commonStyles.secondaryButtonText}>지금 촬영</Text>
          </Pressable>
          {selectedImage || me.profile ? (
            <Pressable
              style={styles.clearButton}
              onPress={handleDeleteProfileImage}
              disabled={isDeletingImage}
            >
              <Text style={styles.clearButtonText}>
                {selectedImage ? "선택 취소" : isDeletingImage ? "삭제 중..." : "이미지 삭제"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
            disabled && commonStyles.primaryButtonDisabled,
          ]}
          disabled={disabled}
          onPress={handleSave}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.base[0]} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>수정하기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 20,
    paddingBottom: 148,
  },
  profileUploadBox: {
    paddingVertical: 20,
  },
  profileUploadWrapper: {
    width: 90,
    height: 90,
    alignSelf: "center",
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.gray[200],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  profileFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[200],
  },
  profileFallbackText: {
    ...typography.head2,
    color: colors.gray[500],
  },
  cameraIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.base[0],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[200],
  },
  cameraText: {
    ...typography.head4,
    color: colors.gray[600],
    marginTop: -2,
  },
  caption: {
    ...typography.body3,
    color: colors.gray[700],
    marginTop: 20,
    marginBottom: 8,
  },
  nicknameRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    ...commonStyles.input,
    flex: 1,
  },
  inputError: {
    borderColor: colors.error[100],
  },
  checkButton: {
    width: 84,
    minHeight: 48,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  checkButtonText: {
    ...typography.body1,
    color: colors.gray[500],
  },
  imageButtons: {
    gap: 10,
    marginTop: 28,
  },
  clearButton: {
    minHeight: layout.buttonHeight,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  clearButtonText: {
    ...typography.body1,
    color: colors.gray[500],
  },
  messageError: {
    ...typography.caption1,
    color: colors.error[100],
    marginTop: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[0],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});

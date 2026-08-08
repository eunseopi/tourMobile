import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import CameraIcon from "src/assets/Camera_2.svg";
import DefaultProfile from "src/assets/default_profile.svg";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";

type Props = {
  profileUri?: string;
  fallbackInitial: string;
  hasProfileImage: boolean;
  hasSelectedImage: boolean;
  isDeletingImage: boolean;
  onPickImage: () => void;
  onTakeImage: () => void;
  onDeleteImage: () => void;
};

export function ProfileEditImagePicker({
  profileUri,
  fallbackInitial,
  hasProfileImage,
  hasSelectedImage,
  isDeletingImage,
  onPickImage,
  onTakeImage,
  onDeleteImage,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profileUri]);

  return (
    <>
      <View style={styles.profileUploadBox}>
        <Pressable style={styles.profileUploadWrapper} onPress={onPickImage}>
          {profileUri && !imageFailed ? (
            <Image
              source={{ uri: profileUri }}
              style={styles.profileImage}
              onError={(e) => {
                console.warn("[ProfileEditImagePicker] 프로필 이미지 로드 실패:", profileUri, e.nativeEvent.error);
                setImageFailed(true);
              }}
            />
          ) : (
            <View style={styles.profileFallback}>
              <DefaultProfile width={66} height={66} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <CameraIcon width={18} height={14} />
          </View>
        </Pressable>
      </View>

      <View style={styles.imageButtons}>
        <Pressable style={commonStyles.secondaryButton} onPress={onPickImage}>
          <Text style={commonStyles.secondaryButtonText}>이미지 선택</Text>
        </Pressable>
        <Pressable style={commonStyles.secondaryButton} onPress={onTakeImage}>
          <Text style={commonStyles.secondaryButtonText}>지금 촬영</Text>
        </Pressable>
        {hasSelectedImage || hasProfileImage ? (
          <Pressable style={styles.clearButton} onPress={onDeleteImage} disabled={isDeletingImage}>
            <Text style={styles.clearButtonText}>
              {hasSelectedImage ? "선택 취소" : isDeletingImage ? "삭제 중..." : "이미지 삭제"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  profileUploadBox: {
    paddingVertical: 20,
  },
  profileUploadWrapper: {
    width: 90,
    height: 90,
    alignSelf: "center",
    overflow: "hidden",
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
    overflow: "hidden",
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
});

import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CameraIcon from "src/assets/Camera_2.svg";
import DefaultProfile from "src/assets/default_profile.svg";
import { PressableScale } from "src/components/ui/PressableScale";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";

type Props = {
  imageUri?: string | null;
  onPickImage: () => void;
  onTakeImage: () => void;
  onDeleteImage?: () => void;
  hasSelectedImage?: boolean;
  hasProfileImage?: boolean;
  isDeletingImage?: boolean;
};

export function ProfileImagePicker({
  imageUri,
  onPickImage,
  onTakeImage,
  onDeleteImage,
  hasSelectedImage = false,
  hasProfileImage = false,
  isDeletingImage = false,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  const showDelete = !!onDeleteImage && (hasSelectedImage || hasProfileImage);

  return (
    <View style={styles.wrapper}>
      <View style={styles.avatarWrapper}>
        <Pressable style={styles.avatarCircle} onPress={onPickImage}>
          {imageUri && !imageFailed ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.profileImage}
              cachePolicy="memory-disk"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <DefaultProfile width={68} height={72} />
          )}
        </Pressable>
        <Pressable style={styles.cameraBadge} onPress={onPickImage} hitSlop={8}>
          <CameraIcon width={20} height={16} />
        </Pressable>
      </View>

      <View style={styles.buttonColumn}>
        <PressableScale style={commonStyles.secondaryButton} onPress={onPickImage}>
          <Text style={commonStyles.secondaryButtonText}>이미지 선택</Text>
        </PressableScale>
        <PressableScale style={commonStyles.secondaryButton} onPress={onTakeImage}>
          <Text style={commonStyles.secondaryButtonText}>지금 촬영</Text>
        </PressableScale>
        {showDelete ? (
          <PressableScale style={styles.clearButton} onPress={onDeleteImage} disabled={isDeletingImage}>
            <Text style={styles.clearButtonText}>
              {hasSelectedImage ? "선택 취소" : isDeletingImage ? "삭제 중..." : "이미지 삭제"}
            </Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    position: "relative",
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.gray[200],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  profileImage: {
    width: 90,
    height: 90,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[200],
    borderWidth: 1,
    borderColor: colors.base[0],
  },
  buttonColumn: {
    width: "100%",
    gap: 10,
  },
  clearButton: {
    minHeight: layout.buttonHeight,
    borderRadius: layout.buttonRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  clearButtonText: {
    ...typography.body1,
    color: colors.gray[600],
  },
});

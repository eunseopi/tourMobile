import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import CameraIcon from "src/assets/Camera_2.svg";
import GalleryIcon from "src/assets/Gallery.svg";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";

type Props = {
  selectedPhoto: string | null;
  onPickPhoto: () => void;
  onTakePhoto: () => void;
};

export function ChallengeProofPhotoSection({
  selectedPhoto,
  onPickPhoto,
  onTakePhoto,
}: Props) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoTitle}>인증 사진</Text>
      <Text style={styles.infoText}>챌린지를 완료했다는 걸 보여줄 사진을 업로드해주세요.</Text>

      <Pressable style={styles.secondaryButton} onPress={onPickPhoto}>
        <GalleryIcon width={20} height={20} />
        <Text style={styles.secondaryButtonText}>사진 선택하기</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onTakePhoto}>
        <CameraIcon width={20} height={20} />
        <Text style={styles.secondaryButtonText}>지금 촬영하기</Text>
      </Pressable>

      {selectedPhoto ? (
        <Image source={{ uri: selectedPhoto }} style={styles.proofImage} />
      ) : (
        <View style={styles.proofPlaceholder}>
          <Text style={styles.proofPlaceholderText}>선택한 사진이 여기에 보여요.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
  },
  infoTitle: {
    ...typography.head4,
    color: colors.gray[800],
  },
  infoText: {
    ...typography.body4,
    color: colors.gray[600],
    marginTop: 8,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
  proofImage: {
    width: "100%",
    aspectRatio: 1.1,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  proofPlaceholder: {
    width: "100%",
    aspectRatio: 1.1,
    marginTop: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[200],
  },
  proofPlaceholderText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
});

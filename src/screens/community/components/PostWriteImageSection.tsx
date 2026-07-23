import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import type { UploadableImage } from "src/types/SpotTypes";

type Props = {
  images: UploadableImage[];
  onPickImages: () => void;
  onTakeImages: () => void;
  onRemoveImage: (index: number) => void;
};

export function PostWriteImageSection({
  images,
  onPickImages,
  onTakeImages,
  onRemoveImage,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>사진 업로드</Text>
      <Text style={styles.helperText}>최대 5장까지 선택할 수 있어요.</Text>
      <Pressable style={styles.secondaryButton} onPress={onPickImages}>
        <Text style={styles.secondaryButtonText}>사진 선택하기</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onTakeImages}>
        <Text style={styles.secondaryButtonText}>지금 촬영하기</Text>
      </Pressable>

      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
          {images.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.imageCard}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <Pressable style={styles.imageRemoveButton} onPress={() => onRemoveImage(index)}>
                <Text style={styles.imageRemoveButtonText}>×</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
  },
  sectionTitle: {
    ...typography.head4,
    color: colors.gray[800],
    marginBottom: 10,
  },
  helperText: {
    ...typography.caption2,
    color: colors.gray[500],
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
  imageRow: {
    gap: 10,
    marginTop: 12,
  },
  imageCard: {
    position: "relative",
  },
  imagePreview: {
    width: 112,
    height: 112,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  imageRemoveButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,31,31,0.65)",
  },
  imageRemoveButtonText: {
    color: colors.base[0],
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "700",
  },
});

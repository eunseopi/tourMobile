import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { PressableScale } from "src/components/ui/PressableScale";
import type { UploadableImage } from "src/types/SpotTypes";
import ClearIcon from "src/assets/Clear.svg";

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
    <View>
      <Text style={styles.sectionTitle}>사진 업로드</Text>

      <View style={styles.actionsRow}>
        <PressableScale style={styles.secondaryButton} onPress={onPickImages}>
          <Text style={styles.secondaryButtonText}>사진 선택하기</Text>
        </PressableScale>
        <PressableScale style={styles.secondaryButton} onPress={onTakeImages}>
          <Text style={styles.secondaryButtonText}>지금 촬영하기</Text>
        </PressableScale>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.slideWrapper}
      >
        {images.map((image, index) => (
          <View key={`${image.uri}-${index}`} style={styles.thumb}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <Pressable style={styles.imageRemoveButton} onPress={() => onRemoveImage(index)}>
              <ClearIcon width={18} height={18} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 17,
    paddingLeft: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    flex: 1,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
  slideWrapper: {
    gap: 8,
    paddingLeft: 20,
    paddingRight: 20,
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[100],
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
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
    backgroundColor: colors.bg[0],
  },
});

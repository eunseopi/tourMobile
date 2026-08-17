import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, layout } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import ClearIcon from "src/assets/Clear.svg";

type Props = {
  tagInput: string;
  tags: string[];
  onChangeTagInput: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (index: number) => void;
};

export function PostWriteTagSection({
  tagInput,
  tags,
  onChangeTagInput,
  onAddTag,
  onRemoveTag,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>해시태그를 입력해주세요.</Text>
      <View style={styles.tagInputRow}>
        <TextInput
          value={tagInput}
          onChangeText={onChangeTagInput}
          placeholder="최대 3개까지 가능해요."
          placeholderTextColor={colors.gray[400]}
          style={styles.tagInput}
          onSubmitEditing={onAddTag}
        />
        <Pressable style={styles.tagAddButton} onPress={onAddTag}>
          <Text style={styles.tagAddButtonText}>추가</Text>
        </Pressable>
      </View>

      {tags.length > 0 ? (
        <View style={styles.tagList}>
          {tags.map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tagChip}>
              <Text style={styles.tagChipText}>#{tag}</Text>
              <Pressable
                style={styles.tagRemoveButton}
                onPress={() => onRemoveTag(index)}
                hitSlop={6}
              >
                <ClearIcon width={12} height={12} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 10,
  },
  tagInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  tagInput: {
    ...commonStyles.input,
    flex: 1,
  },
  tagAddButton: {
    minWidth: 72,
    minHeight: layout.buttonHeight,
    paddingHorizontal: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  tagAddButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[600],
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 36,
    maxWidth: 140,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.gray[200],
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
  },
  tagRemoveButton: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

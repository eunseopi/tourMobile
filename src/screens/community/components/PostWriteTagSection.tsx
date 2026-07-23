import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, layout, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

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

      <View style={styles.tagList}>
        {tags.map((tag, index) => (
          <Pressable key={`${tag}-${index}`} style={styles.tagChip} onPress={() => onRemoveTag(index)}>
            <Text style={styles.tagChipText}>#{tag}</Text>
          </Pressable>
        ))}
      </View>
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
    ...typography.body3,
    color: colors.gray[500],
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[50],
  },
  tagChipText: {
    ...typography.caption1,
    color: colors.primary[500],
  },
});

import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Props = {
  description: string;
  error?: string;
  onChangeDescription: (value: string) => void;
};

export function PostWriteContentSection({ description, error, onChangeDescription }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>내용</Text>
      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        placeholder="메시지를 입력해 주세요."
        placeholderTextColor={colors.gray[400]}
        multiline
        textAlignVertical="top"
        maxLength={200}
        style={styles.textarea}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
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
  textarea: {
    minHeight: 136,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
    ...typography.body2,
    color: colors.gray[800],
  },
  errorText: {
    ...typography.caption2,
    color: colors.error[100],
    marginTop: 6,
  },
});

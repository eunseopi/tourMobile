import { StyleSheet, Text, View } from "react-native";
import { FormTextField } from "src/components/form/FormTextField";
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
      <FormTextField
        value={description}
        onChangeText={onChangeDescription}
        placeholder="메시지를 입력해 주세요."
        multiline
        textAlignVertical="top"
        maxLength={200}
        inputStyle={styles.textarea}
        error={error}
      />
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
    paddingTop: 14,
  },
});

import { StyleSheet, Text, View } from "react-native";
import { FormTextField } from "src/components/form/FormTextField";
import { colors } from "src/design/theme";

type Props = {
  description: string;
  error?: string;
  onChangeDescription: (value: string) => void;
};

export function PostWriteContentSection({ description, error, onChangeDescription }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>내용을 입력해주세요.<Text style={styles.required}>*</Text></Text>
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
  required: {
    color: colors.primary[400],
  },
  textarea: {
    minHeight: 136,
    paddingTop: 14,
  },
});

import { StyleSheet, Text, View } from "react-native";
import { FormTextField } from "src/components/form/FormTextField";
import { colors } from "src/design/theme";

type Props = {
  title: string;
  error?: string;
  onChangeTitle: (value: string) => void;
};

export function PostWriteTitleSection({ title, error, onChangeTitle }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        제목을 입력해주세요.
        <Text style={styles.required}>*</Text>
      </Text>
      <FormTextField
        value={title}
        onChangeText={onChangeTitle}
        placeholder="제목을 입력해주세요"
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
});

import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

type Props = {
  password: string;
  passwordConfirm: string;
  onChangePassword: (value: string) => void;
  onChangePasswordConfirm: (value: string) => void;
};

export function PasswordStep({
  password,
  passwordConfirm,
  onChangePassword,
  onChangePasswordConfirm,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>비밀번호를 입력해주세요.</Text>
      <TextInput
        value={password}
        onChangeText={onChangePassword}
        placeholder="특수문자 포함 8-12자로 입력해주세요."
        placeholderTextColor="#a0a0a0"
        secureTextEntry
        style={styles.input}
      />

      <Text style={[styles.label, styles.inlineTop]}>비밀번호를 한번 더 확인해주세요.</Text>
      <TextInput
        value={passwordConfirm}
        onChangeText={onChangePasswordConfirm}
        placeholderTextColor="#a0a0a0"
        secureTextEntry
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    minHeight: 360,
  },
  label: {
    ...typography.body3,
    color: colors.gray[700],
  },
  heading: {
    ...typography.head3,
    color: colors.gray[800],
    marginBottom: 20,
  },
  inlineTop: {
    marginTop: 18,
  },
  input: {
    ...commonStyles.input,
    marginTop: 8,
  },
});

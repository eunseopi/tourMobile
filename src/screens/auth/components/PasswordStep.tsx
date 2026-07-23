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
      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        value={password}
        onChangeText={onChangePassword}
        placeholder="8자 이상 입력"
        placeholderTextColor="#a0a0a0"
        secureTextEntry
        style={styles.input}
      />

      <Text style={[styles.label, styles.inlineTop]}>비밀번호 확인</Text>
      <TextInput
        value={passwordConfirm}
        onChangeText={onChangePasswordConfirm}
        placeholder="한 번 더 입력"
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
  inlineTop: {
    marginTop: 18,
  },
  input: {
    ...commonStyles.input,
    marginTop: 8,
  },
});

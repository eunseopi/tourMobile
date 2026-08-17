import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { validatePasswordConfirm, validateSignupPassword } from "src/utils/validation/authValidation";

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
  const passwordError = password ? validateSignupPassword(password) : "";
  const confirmError = passwordConfirm ? validatePasswordConfirm(password, passwordConfirm) : "";

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>비밀번호를 입력해주세요.</Text>
      <TextInput
        value={password}
        onChangeText={onChangePassword}
        placeholder="비밀번호를 입력해주세요."
        placeholderTextColor="#a0a0a0"
        secureTextEntry
        style={styles.input}
      />
      <Text style={[styles.guide, passwordError && styles.error]}>
        {passwordError || "8~12자 · 특수문자(!, _, @, -) 1개 이상 · 영문 또는 숫자 포함"}
      </Text>

      <Text style={[styles.label, styles.inlineTop]}>비밀번호를 한번 더 확인해주세요.</Text>
      <TextInput
        value={passwordConfirm}
        onChangeText={onChangePasswordConfirm}
        placeholderTextColor="#a0a0a0"
        secureTextEntry
        style={styles.input}
      />
      {confirmError ? <Text style={[styles.guide, styles.error]}>{confirmError}</Text> : null}
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
  guide: {
    ...typography.caption1,
    color: colors.gray[500],
    marginTop: 8,
  },
  error: {
    color: colors.error[100],
  },
});

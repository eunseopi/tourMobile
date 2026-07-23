import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Props = {
  email: string;
  emailError?: string;
  isSendingCode: boolean;
  onChangeEmail: (value: string) => void;
  onBlurEmail: () => void;
  onSendCode: () => void;
};

export function EmailStep({
  email,
  emailError,
  isSendingCode,
  onChangeEmail,
  onBlurEmail,
  onSendCode,
}: Props) {
  const canCheckDuplicate = email.trim().length > 0;
  const isDuplicateButtonDisabled = isSendingCode || !canCheckDuplicate;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>이메일을 입력해주세요.</Text>
      <View style={[styles.inputShell, emailError ? styles.inputShellError : null]}>
        <TextInput
          value={email}
          onChangeText={onChangeEmail}
          onBlur={onBlurEmail}
          placeholder="이메일을 입력해주세요"
          placeholderTextColor="#a0a0a0"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <Pressable
          style={[styles.duplicateButton, isDuplicateButtonDisabled && styles.duplicateButtonDisabled]}
          onPress={onSendCode}
          disabled={isDuplicateButtonDisabled}
        >
          {isSendingCode ? (
            <ActivityIndicator color={colors.primary[500]} />
          ) : (
            <Text
              style={[
                styles.duplicateButtonText,
                isDuplicateButtonDisabled && styles.duplicateButtonTextDisabled,
              ]}
            >
              중복확인
            </Text>
          )}
        </Pressable>
      </View>
      {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
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
  inputShell: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingLeft: 14,
    paddingRight: 8,
    ...typography.body2,
    color: colors.gray[800],
  },
  inputShellError: {
    borderColor: colors.error[100],
  },
  duplicateButton: {
    minWidth: 76,
    minHeight: 34,
    marginRight: 7,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  duplicateButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  duplicateButtonText: {
    ...typography.caption1,
    color: colors.base[0],
  },
  duplicateButtonTextDisabled: {
    color: colors.base[0],
  },
  errorText: {
    marginTop: 6,
    ...typography.caption2,
    color: colors.error[100],
  },
});

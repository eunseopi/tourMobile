import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

type Props = {
  email: string;
  emailError?: string;
  authCode: string;
  authError?: string;
  showAuthInput: boolean;
  authPassed: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
  onChangeEmail: (value: string) => void;
  onBlurEmail: () => void;
  onChangeAuthCode: (value: string) => void;
  onSendCode: () => void;
  onVerifyCode: () => void;
};

export function EmailStep({
  email,
  emailError,
  authCode,
  authError,
  showAuthInput,
  authPassed,
  isSendingCode,
  isVerifyingCode,
  onChangeEmail,
  onBlurEmail,
  onChangeAuthCode,
  onSendCode,
  onVerifyCode,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>이메일</Text>
      <TextInput
        value={email}
        onChangeText={onChangeEmail}
        onBlur={onBlurEmail}
        placeholder="you@example.com"
        placeholderTextColor="#a0a0a0"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

      <Pressable style={styles.secondaryButton} onPress={onSendCode} disabled={isSendingCode}>
        {isSendingCode ? (
          <ActivityIndicator color="#8b532f" />
        ) : (
          <Text style={styles.secondaryButtonText}>인증번호 받기</Text>
        )}
      </Pressable>

      {showAuthInput && (
        <>
          <Text style={[styles.label, styles.inlineTop]}>인증번호</Text>
          <TextInput
            value={authCode}
            onChangeText={onChangeAuthCode}
            placeholder="이메일로 받은 코드 입력"
            placeholderTextColor="#a0a0a0"
            style={styles.input}
          />
          {!!authError && <Text style={styles.errorText}>{authError}</Text>}

          <Pressable style={styles.secondaryButton} onPress={onVerifyCode} disabled={isVerifyingCode}>
            {isVerifyingCode ? (
              <ActivityIndicator color="#8b532f" />
            ) : (
              <Text style={styles.secondaryButtonText}>{authPassed ? "인증 완료" : "인증 확인"}</Text>
            )}
          </Pressable>
        </>
      )}
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
  errorText: {
    marginTop: 6,
    ...typography.caption2,
    color: colors.error[100],
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
});

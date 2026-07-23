import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { AxiosError } from "axios";
import type { RootStackParamList } from "../../App";
import { colors, layout, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { authApi } from "src/api/auth";
import { useKakaoLogin } from "src/features/auth/useKakaoLogin";
import { QK } from "src/utils/lib/queryKeys";
import { validateLoginForm } from "src/utils/validation/authValidation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

type LoginResponse = {
  success?: boolean;
  failure?: boolean;
  message?: string;
};

export default function LoginScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { run: runKakaoLogin, isLoading: isKakaoLoading } = useKakaoLogin(navigation);

  const validation = useMemo(() => validateLoginForm(email, password), [email, password]);

  const handleLogin = async () => {
    if (!validation.isValid || isSubmitting) {
      if (!validation.isValid) {
        const message = validation.errors.email || validation.errors.password;
        Alert.alert("입력 확인", message);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authApi.login({ email: email.trim(), password });
      const body = response.data as LoginResponse | undefined;

      if (body?.failure || body?.success === false) {
        throw new Error(body?.message || "로그인에 실패했습니다.");
      }

      await queryClient.invalidateQueries({ queryKey: QK.sessionMe });
      await queryClient.refetchQueries({ queryKey: QK.sessionMe });

      Alert.alert("로그인 완료", "로그인되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.replace("Main"),
        },
      ]);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : "로그인에 실패했습니다.");

      Alert.alert("로그인 실패", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      await runKakaoLogin();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : "카카오 로그인에 실패했습니다.");
      Alert.alert("카카오 로그인 실패", message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>로그인</Text>

        <View style={styles.form}>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#a0a0a0"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            {!!validation.errors.email && <Text style={styles.errorText}>{validation.errors.email}</Text>}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="8자 이상 입력"
              placeholderTextColor="#a0a0a0"
              secureTextEntry
              style={styles.input}
            />
            {!!validation.errors.password && (
              <Text style={styles.errorText}>{validation.errors.password}</Text>
            )}
          </View>

          <Pressable
            style={[styles.submitButton, (!validation.isValid || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={!validation.isValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>이메일로 로그인</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.kakaoButton, isKakaoLoading && styles.submitButtonDisabled]}
            onPress={handleKakaoLogin}
            disabled={isKakaoLoading}
          >
            <Text style={styles.kakaoButtonText}>
              {isKakaoLoading ? "카카오 로그인 중..." : "카카오로 로그인"}
            </Text>
          </Pressable>

          <Pressable style={styles.outlineButton} onPress={() => navigation.navigate("PasswordReset")}>
            <Text style={styles.outlineButtonText}>비밀번호 재설정</Text>
          </Pressable>

          <Pressable style={styles.outlineButton} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.outlineButtonText}>회원가입</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 32,
    paddingBottom: 140,
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
    marginBottom: 20,
  },
  form: {
    gap: 10,
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    ...typography.body3,
    color: colors.gray[700],
  },
  input: {
    ...commonStyles.input,
  },
  errorText: {
    ...typography.caption2,
    color: colors.error[100],
  },
  submitButton: {
    ...commonStyles.primaryButton,
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[100],
  },
  submitButtonText: {
    ...commonStyles.primaryButtonText,
  },
  kakaoButton: {
    height: 48,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE500",
  },
  kakaoButtonText: {
    ...typography.body1,
    color: "#2b1d00",
  },
  outlineButton: {
    height: 48,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  outlineButtonText: {
    ...typography.body1,
    color: colors.gray[700],
  },
});

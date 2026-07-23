import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { AxiosError } from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "src/app/navigation/types";
import { FormTextField } from "src/components/form/FormTextField";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { colors, layout, typography } from "src/design/theme";
import { authApi } from "src/api/auth";
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
  const [touched, setTouched] = useState({ email: false, password: false });

  const validation = useMemo(() => validateLoginForm(email, password), [email, password]);
  const emailError = touched.email ? validation.errors.email : undefined;
  const passwordError = touched.password ? validation.errors.password : undefined;

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

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.replace("RegisterChoice");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
            <Text style={styles.backButtonText}>{"<"}</Text>
          </Pressable>

          <Text style={styles.title}>다시 오신 것을 환영해요 :)</Text>
          <Text style={styles.subtitle}>로그인해주세요.</Text>

          <View style={styles.form}>
            <FormTextField
              label="이메일"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="이메일을 입력해주세요."
              placeholderTextColor="#a0a0a0"
              autoCapitalize="none"
              keyboardType="email-address"
              error={emailError}
            />

            <FormTextField
              label="비밀번호"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (!touched.password) setTouched((prev) => ({ ...prev, password: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              placeholder="비밀번호를 입력해주세요."
              placeholderTextColor="#a0a0a0"
              secureTextEntry
              error={passwordError}
            />

            <PrimaryActionButton
              label="이메일로 로그인"
              isLoading={isSubmitting}
              disabled={!validation.isValid}
              style={styles.submitButton}
              onPress={handleLogin}
            />

            <Pressable style={styles.outlineButton} onPress={() => navigation.navigate("Register")}>
              <Text style={styles.outlineButtonText}>회원가입</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
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
  backButton: {
    alignSelf: "flex-start",
    minWidth: 32,
    minHeight: 32,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 18,
  },
  backButtonText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "400",
    color: colors.gray[800],
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body2,
    color: colors.gray[600],
    marginBottom: 28,
  },
  form: {
    gap: 10,
  },
  submitButton: {
    marginTop: 10,
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

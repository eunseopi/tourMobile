import { useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useResetPassword } from "src/features/user/useResetPassword";
import {
  validatePassword,
  validatePasswordConfirm,
} from "src/utils/validation/authValidation";

type Props = NativeStackScreenProps<RootStackParamList, "PasswordReset">;

export default function PasswordResetScreen({ navigation }: Props) {
  const { data: me, isLoading, isError, refetch } = useSessionMe();
  const resetPassword = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordError = useMemo(() => validatePassword(password), [password]);
  const confirmError = useMemo(
    () => validatePasswordConfirm(password, confirm),
    [password, confirm]
  );

  const canSubmit =
    !!me?.email &&
    password.length > 0 &&
    confirm.length > 0 &&
    !passwordError &&
    !confirmError;

  const handleSubmit = async () => {
    if (!me?.email || !canSubmit) return;

    try {
      await resetPassword.mutateAsync({
        email: me.email,
        newPassword: password,
      });
      Alert.alert("변경 완료", "비밀번호가 재설정되었어요.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        "변경 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>계정 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !me) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>계정 정보를 불러오지 못했어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          <Text style={styles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>이메일</Text>
      <View style={styles.readonlyField}>
        <Text style={styles.readonlyText}>{me.email}</Text>
      </View>

      <Text style={[styles.label, styles.spacingTop]}>새 비밀번호</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="새 비밀번호를 입력하세요"
        placeholderTextColor="#aaa"
        style={[styles.input, passwordError ? styles.inputError : null]}
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <Text style={[styles.label, styles.spacingTop]}>비밀번호 확인</Text>
      <TextInput
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="비밀번호를 다시 입력하세요"
        placeholderTextColor="#aaa"
        style={[styles.input, confirmError ? styles.inputError : null]}
      />
      {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

      <Pressable
        style={[
          styles.primaryButton,
          (!canSubmit || resetPassword.isPending) && styles.disabledButton,
        ]}
        disabled={!canSubmit || resetPassword.isPending}
        onPress={handleSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {resetPassword.isPending ? "변경 중..." : "비밀번호 변경"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#444",
  },
  spacingTop: {
    marginTop: 18,
  },
  readonlyField: {
    marginTop: 8,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
  },
  readonlyText: {
    fontSize: 15,
    color: "#555",
  },
  input: {
    marginTop: 8,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#f9f9f9",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    fontSize: 15,
    color: "#222",
  },
  inputError: {
    borderColor: "#d33",
  },
  primaryButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
  errorText: {
    marginTop: 8,
    color: "#d33",
  },
});

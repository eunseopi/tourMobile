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
import type { RootStackParamList } from "src/app/navigation/types";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
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
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>계정 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !me) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>계정 정보를 불러오지 못했어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={commonStyles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>비밀번호를 입력해주세요.</Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="특수문자 포함 8-12자로 입력해주세요."
          placeholderTextColor={colors.gray[400]}
          style={[styles.input, passwordError ? styles.inputError : null]}
        />
        {passwordError ? <Text style={styles.messageError}>{passwordError}</Text> : null}

        <Text style={styles.caption}>비밀번호를 한번 더 확인해주세요.</Text>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="비밀번호를 다시 입력해주세요."
          placeholderTextColor={colors.gray[400]}
          editable={!resetPassword.isPending}
          style={[styles.input, confirmError ? styles.inputError : null]}
        />
        {confirmError ? <Text style={styles.messageError}>{confirmError}</Text> : null}
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
            (!canSubmit || resetPassword.isPending) && commonStyles.primaryButtonDisabled,
          ]}
          disabled={!canSubmit || resetPassword.isPending}
          onPress={handleSubmit}
        >
          {resetPassword.isPending ? (
            <ActivityIndicator color={colors.base[0]} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>수정하기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
    paddingBottom: 132,
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
    marginBottom: 24,
  },
  caption: {
    ...typography.body3,
    color: colors.gray[700],
    marginTop: 28,
    marginBottom: 8,
  },
  input: {
    ...commonStyles.input,
  },
  inputError: {
    borderColor: colors.error[100],
  },
  messageError: {
    ...typography.caption1,
    color: colors.error[100],
    marginTop: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[0],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});

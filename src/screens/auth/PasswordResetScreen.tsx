import { useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { FormTextField } from "src/components/form/FormTextField";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { ScreenStateView } from "src/components/ui/ScreenStateView";
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
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      navigation.replace("Login");
    } catch (e: any) {
      Alert.alert(
        "변경 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  if (isLoading) {
    return (
      <ScreenStateView
        type="loading"
        title="비밀번호 수정하기"
        loadingText="계정 정보를 불러오는 중..."
        errorText="계정 정보를 불러오지 못했어요."
      />
    );
  }

  if (isError || !me) {
    return (
      <ScreenStateView
        type="error"
        title="비밀번호 수정하기"
        loadingText="계정 정보를 불러오는 중..."
        errorText="계정 정보를 불러오지 못했어요."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <View style={commonStyles.screen}>
      <ScreenHeader title="비밀번호 수정하기" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>비밀번호를 입력해주세요.</Text>

        <FormTextField
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="특수문자 포함 8-12자로 입력해주세요."
          error={passwordError}
        />

        <FormTextField
          label="비밀번호를 한번 더 확인해주세요."
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="비밀번호를 다시 입력해주세요."
          editable={!resetPassword.isPending}
          error={confirmError}
          containerStyle={styles.confirmField}
        />
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <PrimaryActionButton
          label="수정하기"
          isLoading={resetPassword.isPending}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
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
  confirmField: {
    marginTop: 28,
  },
});

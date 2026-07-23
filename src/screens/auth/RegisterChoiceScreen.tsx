import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { useKakaoLogin } from "src/features/auth/useKakaoLogin";
import { colors, layout, typography } from "src/design/theme";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterChoice">;

export default function RegisterChoiceScreen({ navigation }: Props) {
  const { run: runKakaoLogin, isLoading: isKakaoLoading } = useKakaoLogin(navigation);

  const handleKakao = async () => {
    try {
      await runKakaoLogin();
    } catch (error) {
      Alert.alert(
        "카카오 로그인 실패",
        error instanceof Error ? error.message : "잠시 후 다시 시도해주세요."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>JD</Text>
        </View>
        <Text style={styles.welcomeTitle}>제주데이</Text>
      </View>

      <View style={styles.buttonWrapper}>
        <Pressable style={styles.kakaoButton} onPress={handleKakao} disabled={isKakaoLoading}>
          {isKakaoLoading ? (
            <ActivityIndicator color="#2b1d00" />
          ) : (
            <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
          )}
        </Pressable>
        <Pressable style={styles.emailButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.emailButtonText}>로그인</Text>
        </Pressable>
        <Pressable style={styles.emailButton} onPress={() => navigation.replace("Register")}>
          <Text style={styles.emailButtonText}>이메일로 회원가입</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  logoWrapper: {
    flex: 1,
    paddingTop: 73,
    paddingBottom: 154,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  logoText: {
    ...typography.head2,
    color: colors.base[0],
  },
  welcomeTitle: {
    ...typography.head2,
    color: colors.gray[800],
    marginTop: 32,
  },
  buttonWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 75,
    paddingHorizontal: layout.screenPadding,
    gap: 10,
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
  emailButton: {
    height: 48,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  emailButtonText: {
    ...typography.body1,
    color: colors.gray[700],
  },
});

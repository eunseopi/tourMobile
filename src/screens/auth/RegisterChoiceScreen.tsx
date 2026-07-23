import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { HallabongLogo } from "src/components/brand/HallabongLogo";
import { colors, layout, typography } from "src/design/theme";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterChoice">;

export default function RegisterChoiceScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <HallabongLogo />
        <Text style={styles.welcomeTitle}>하루제주에 오신 것을 환영합니다!</Text>
      </View>

      <View style={styles.buttonWrapper}>
        <Pressable style={styles.emailButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.emailButtonText}>로그인 하기</Text>
        </Pressable>
        <Pressable style={styles.emailButton} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.emailButtonText}>회원가입 하기</Text>
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
  welcomeTitle: {
    ...typography.head2,
    color: colors.gray[800],
    marginTop: 32,
    textAlign: "center",
  },
  buttonWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 75,
    paddingHorizontal: layout.screenPadding,
    gap: 10,
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

import { useEffect } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { colors, layout, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("LanguageSetting");
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>JD</Text>
        </View>
        <View style={styles.welcome}>
          <Text style={styles.title}>제주데이</Text>
          <Text style={styles.subtitle}>제주 여행을 더 가볍게</Text>
        </View>
      </View>

      <View style={commonStyles.bottomAction}>
        <Pressable style={commonStyles.primaryButton} onPress={() => navigation.replace("LanguageSetting")}>
          <Text style={commonStyles.primaryButtonText}>시작하기</Text>
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
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  logoText: {
    ...typography.head1,
    color: colors.base[0],
  },
  welcome: {
    marginTop: 32,
    alignItems: "center",
  },
  title: {
    ...typography.head2,
    color: colors.gray[800],
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body4,
    color: colors.gray[700],
  },
});

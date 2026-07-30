import { useCallback, useEffect, useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { HallabongLogo } from "src/components/brand/HallabongLogo";
import { colors, layout, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { onboardingStorage } from "src/utils/lib/onboardingStorage";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  const [canLeaveSplash, setCanLeaveSplash] = useState(false);
  const [canContinueWithoutSession, setCanContinueWithoutSession] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const { data: session, isFetching } = useSessionMe();
  const nextRoute = useMemo(
    () => (session ? "Main" : hasOnboarded ? "RegisterChoice" : "LanguageSetting"),
    [session, hasOnboarded]
  );
  const isCheckingSession = !session && isFetching;

  useEffect(() => {
    onboardingStorage.getHasOnboarded().then((value) => {
      setHasOnboarded(value);
      setHasCheckedOnboarding(true);
    });
  }, []);

  const goNext = useCallback(() => {
    navigation.replace(nextRoute);
  }, [navigation, nextRoute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanLeaveSplash(true);
    }, 1200);
    const fallbackTimer = setTimeout(() => {
      setCanContinueWithoutSession(true);
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!canLeaveSplash || !hasCheckedOnboarding || (isCheckingSession && !canContinueWithoutSession)) return;
    goNext();
  }, [canContinueWithoutSession, canLeaveSplash, goNext, hasCheckedOnboarding, isCheckingSession]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <HallabongLogo />
        <View style={styles.welcome}>
          <Text style={styles.title}>하루제주의 첫 걸음</Text>
          <Text style={styles.subtitle}>하루제주에 오신 것을 환영합니다.</Text>
          <Text style={styles.subtitle}>지금 챌린지에 입장하세요!</Text>
        </View>
      </View>

      <View style={commonStyles.bottomAction}>
        <Pressable style={commonStyles.primaryButton} onPress={goNext}>
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

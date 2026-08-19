import { useCallback, useEffect, useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { HallabongLogo } from "src/components/brand/HallabongLogo";
import { AppModal } from "src/components/ui/AppModal";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT } from "src/config/legalContent";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { onboardingStorage } from "src/utils/lib/onboardingStorage";
import { termsStorage } from "src/utils/lib/termsStorage";

const TERMS_CONTENT = `[이용약관]

${TERMS_OF_SERVICE_CONTENT}


[개인정보 수집 및 이용 동의]

${PRIVACY_POLICY_CONTENT}`;

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [hasStoredTermsAgreement, setHasStoredTermsAgreement] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasCheckedTermsStorage, setHasCheckedTermsStorage] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const { data: session, isFetched: hasCheckedSession } = useSessionMe();
  const nextRoute = useMemo(
    () => (session ? "Main" : hasOnboarded ? "RegisterChoice" : "Permission"),
    [session, hasOnboarded]
  );

  useEffect(() => {
    onboardingStorage.getHasOnboarded().then((value) => {
      setHasOnboarded(value);
      setHasCheckedOnboarding(true);
    });
    termsStorage.getHasAgreed().then((value) => {
      setHasStoredTermsAgreement(value);
      setHasCheckedTermsStorage(true);
    });
  }, []);

  const goNext = useCallback(() => {
    navigation.replace(nextRoute);
  }, [navigation, nextRoute]);

  // 기존 동의자는 체크박스를 다시 보여주지 않는다. 세션 조회까지 끝난 뒤 로그인 상태에 맞는 화면으로 이동한다.
  useEffect(() => {
    if (
      !hasCheckedOnboarding ||
      !hasCheckedTermsStorage ||
      !hasCheckedSession ||
      !hasStoredTermsAgreement
    ) return;
    goNext();
  }, [
    goNext,
    hasCheckedOnboarding,
    hasCheckedSession,
    hasCheckedTermsStorage,
    hasStoredTermsAgreement,
  ]);

  const isReady = hasCheckedOnboarding && hasCheckedTermsStorage;
  const canStart = isReady && agreedToTerms;

  const handleStart = () => {
    if (!canStart) return;
    void termsStorage.setHasAgreed();
    goNext();
  };

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

      {isReady && !hasStoredTermsAgreement ? (
        <View style={commonStyles.bottomAction}>
          <View style={styles.agreeRow}>
            <Pressable
              style={styles.agreeCheckArea}
              onPress={() => setAgreedToTerms((prev) => !prev)}
              hitSlop={8}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </View>
              <Text style={styles.agreeText}>이용약관 및 개인정보 처리방침에 동의합니다 (필수)</Text>
            </Pressable>

            <Pressable onPress={() => setIsTermsModalOpen(true)} hitSlop={8}>
              <Text style={styles.viewLink}>보기</Text>
            </Pressable>
          </View>

          <PrimaryActionButton label="시작하기" disabled={!canStart} onPress={handleStart} />
        </View>
      ) : null}

      <AppModal visible={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} variant="sheet">
        <Text style={styles.modalTitle}>이용약관 및 개인정보 처리방침</Text>
        <ScrollView style={styles.modalScroll}>
          <Text style={styles.termsText}>{TERMS_CONTENT}</Text>
        </ScrollView>
      </AppModal>
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
  termsText: {
    ...typography.caption2,
    color: colors.gray[600],
    lineHeight: 20,
  },
  agreeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 4,
  },
  agreeCheckArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  viewLink: {
    ...typography.caption2,
    color: colors.gray[600],
    textDecorationLine: "underline",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[400],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  checkboxChecked: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[400],
  },
  checkboxMark: {
    fontSize: 13,
    lineHeight: 13,
    fontWeight: "700",
    color: colors.base[0],
  },
  agreeText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  modalTitle: {
    ...typography.head3,
    color: colors.gray[800],
    marginBottom: 14,
  },
  modalScroll: {
    maxHeight: "70%",
  },
});

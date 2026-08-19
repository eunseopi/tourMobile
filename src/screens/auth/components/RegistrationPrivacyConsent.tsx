import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ChevronLeftIcon from "src/assets/ChevronLeft.svg";
import { REGISTRATION_PRIVACY_CONSENT_CONTENT } from "src/config/legalContent";
import { colors, layout, typography } from "src/design/theme";

type Props = {
  agreed: boolean;
  onToggle: () => void;
  onBack: () => void;
  onContinue: () => void;
};

export function RegistrationPrivacyConsent({ agreed, onToggle, onBack, onContinue }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityLabel="뒤로가기" hitSlop={12} style={styles.backButton} onPress={onBack}>
          <ChevronLeftIcon width={11} height={18} />
        </Pressable>

        <Text style={styles.title}>개인정보 수집 안내</Text>
        <Text style={styles.description}>회원가입 정보를 입력하기 전에 수집 항목과 이용 목적을 확인해주세요.</Text>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>{REGISTRATION_PRIVACY_CONSENT_CONTENT}</Text>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel="개인정보 수집 및 이용에 동의"
          style={styles.agreeRow}
          onPress={onToggle}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </View>
          <Text style={styles.agreeText}>개인정보 수집·이용에 동의합니다 (필수)</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !agreed }}
          style={[styles.continueButton, !agreed && styles.continueButtonDisabled]}
          disabled={!agreed}
          onPress={onContinue}
        >
          <Text style={[styles.continueText, !agreed && styles.continueTextDisabled]}>동의하고 정보 입력하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg[0] },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: 12, paddingBottom: 124 },
  backButton: { width: 40, height: 40, justifyContent: "center", marginBottom: 12 },
  title: { ...typography.head2, color: colors.gray[800], marginBottom: 8 },
  description: { ...typography.body4, color: colors.gray[600], marginBottom: 20 },
  noticeBox: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    backgroundColor: colors.bg[50],
  },
  noticeText: { ...typography.caption2, color: colors.gray[700], lineHeight: 20 },
  agreeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 20, gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[400],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  checkboxChecked: { borderColor: colors.primary[400], backgroundColor: colors.primary[400] },
  checkboxMark: { fontSize: 14, lineHeight: 16, fontWeight: "700", color: colors.base[0] },
  agreeText: { ...typography.body3, flex: 1, color: colors.gray[700] },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: colors.bg[0],
  },
  continueButton: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  continueButtonDisabled: { backgroundColor: colors.gray[100] },
  continueText: { ...typography.body1, color: colors.base[0] },
  continueTextDisabled: { color: colors.gray[600] },
});

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Props = {
  step: number;
  totalSteps: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function RegisterFooter({ step, totalSteps, isSubmitting, onBack, onNext }: Props) {
  return (
    <View style={styles.footerRow}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>{step === 0 ? "뒤로" : "이전"}</Text>
      </Pressable>
      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
        onPress={onNext}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>{step === totalSteps - 1 ? "회원가입 완료" : "다음"}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  backButtonText: {
    ...typography.body1,
    color: colors.gray[400],
  },
  primaryButton: {
    flex: 2,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  primaryButtonDisabled: {
    backgroundColor: colors.gray[100],
  },
  primaryButtonText: {
    ...typography.body1,
    color: colors.base[0],
  },
});

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Props = {
  step: number;
  totalSteps: number;
  isSubmitting: boolean;
  isNextEnabled: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function RegisterFooter({ step, totalSteps, isSubmitting, isNextEnabled, onBack, onNext }: Props) {
  const isDisabled = isSubmitting || !isNextEnabled;

  return (
    <View style={styles.footerRow}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>{step === 0 ? "뒤로" : "이전"}</Text>
      </Pressable>
      <Pressable
        style={[styles.primaryButton, isDisabled && styles.primaryButtonDisabled]}
        onPress={onNext}
        disabled={isDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.primaryButtonText, isDisabled && styles.primaryButtonTextDisabled]}>
            {step === totalSteps - 1 ? "회원가입 완료" : "다음"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 15,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: colors.bg[0],
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
  primaryButtonTextDisabled: {
    color: colors.gray[400],
  },
});

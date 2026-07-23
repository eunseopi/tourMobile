import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { commonStyles } from "src/design/commonStyles";
import { colors } from "src/design/theme";

type Props = {
  isSubmitting: boolean;
  onComplete: () => void;
};

export function ChallengeCompleteButton({ isSubmitting, onComplete }: Props) {
  return (
    <Pressable
      style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
      disabled={isSubmitting}
      onPress={onComplete}
    >
      {isSubmitting ? <ActivityIndicator color={colors.base[0]} /> : null}
      <Text style={styles.primaryButtonText}>
        {isSubmitting ? "완료 처리 중..." : "챌린지 완료하기"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    ...commonStyles.primaryButton,
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
  },
  disabledButton: {
    ...commonStyles.primaryButtonDisabled,
  },
  primaryButtonText: {
    ...commonStyles.primaryButtonText,
  },
});

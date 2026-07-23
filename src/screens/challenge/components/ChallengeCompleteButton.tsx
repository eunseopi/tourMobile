import { StyleSheet } from "react-native";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";

type Props = {
  isSubmitting: boolean;
  onComplete: () => void;
};

export function ChallengeCompleteButton({ isSubmitting, onComplete }: Props) {
  return (
    <PrimaryActionButton
      label="챌린지 완료하기"
      loadingLabel="완료 처리 중..."
      isLoading={isSubmitting}
      style={styles.primaryButton}
      onPress={onComplete}
    />
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
  },
});

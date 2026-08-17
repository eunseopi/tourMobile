import { Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { PressableScale } from "src/components/ui/PressableScale";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { colors, typography } from "src/design/theme";

type Props = {
  isSubmitting: boolean;
  isCancelling: boolean;
  onComplete: () => void;
  onCancel: () => void;
};

export function ChallengeCompleteButton({ isSubmitting, isCancelling, onComplete, onCancel }: Props) {
  return (
    <View style={styles.wrapper}>
      <PrimaryActionButton
        label="챌린지 완료하기"
        loadingLabel="완료 처리 중..."
        isLoading={isSubmitting}
        disabled={isCancelling}
        style={styles.primaryButton}
        onPress={onComplete}
      />
      <PressableScale onPress={onCancel} disabled={isSubmitting || isCancelling} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>{isCancelling ? "취소 처리 중..." : "챌린지 취소하기"}</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  primaryButton: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    ...typography.caption1,
    color: colors.error[100],
  },
});

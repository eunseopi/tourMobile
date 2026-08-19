import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { PressableScale } from "src/components/ui/PressableScale";
import { commonStyles } from "src/design/commonStyles";
import { colors } from "src/design/theme";

type Props = {
  onBack: () => void;
  onAddChallenge: () => void;
  isAddingChallenge?: boolean;
};

export function SpotDetailActions({ onBack, onAddChallenge, isAddingChallenge }: Props) {
  return (
    <View style={styles.actionRow}>
      <PressableScale style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>뒤로가기</Text>
      </PressableScale>
      <PressableScale
        style={[styles.primaryButton, isAddingChallenge && styles.primaryButtonDisabled]}
        onPress={onAddChallenge}
        disabled={isAddingChallenge}
      >
        {isAddingChallenge ? (
          <ActivityIndicator color={colors.base[0]} />
        ) : (
          <Text style={styles.primaryButtonText}>챌린지 추가하기</Text>
        )}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  primaryButton: {
    ...commonStyles.primaryButton,
    flex: 1,
  },
  primaryButtonText: {
    ...commonStyles.primaryButtonText,
  },
  primaryButtonDisabled: {
    ...commonStyles.primaryButtonDisabled,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    flex: 1,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
});

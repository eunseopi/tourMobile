import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

type Props = {
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function PostWriteSubmitButton({ isSubmitting, onSubmit }: Props) {
  return (
    <Pressable
      style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
      onPress={onSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <ActivityIndicator color={colors.base[0]} />
      ) : (
        <Text style={styles.primaryButtonText}>등록하기</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    ...commonStyles.primaryButton,
  },
  primaryButtonDisabled: {
    ...commonStyles.primaryButtonDisabled,
  },
  primaryButtonText: {
    ...commonStyles.primaryButtonText,
  },
});

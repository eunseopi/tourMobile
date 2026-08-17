import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";

type Props = {
  type: "loading" | "error";
  loadingText: string;
  errorText: string;
  backgroundColor?: string;
  title?: string;
  onRetry?: () => void;
};

export function ScreenStateView({
  type,
  loadingText,
  errorText,
  backgroundColor = colors.bg[0],
  title,
  onRetry,
}: Props) {
  const message = type === "loading" ? loadingText : errorText;

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      {title ? <ScreenHeader title={title} /> : null}
      <View style={styles.center}>
        {type === "loading" ? <ActivityIndicator color={colors.primary[400]} /> : null}
        <Text style={type === "loading" ? styles.mutedText : styles.errorText}>{message}</Text>
        {type === "error" ? (
          <Pressable style={commonStyles.primaryButton} onPress={onRetry}>
            <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});

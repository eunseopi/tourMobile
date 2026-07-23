import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";

type Props = {
  type: "loading" | "error";
  onRetry?: () => void;
};

export function ProductDetailStateView({ type, onRetry }: Props) {
  if (type === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>상품 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>상품 정보를 찾을 수 없어요.</Text>
      <Pressable style={commonStyles.primaryButton} onPress={onRetry}>
        <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[50],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});

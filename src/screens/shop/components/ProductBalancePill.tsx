import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Props = {
  hallabong?: number;
  isLoading: boolean;
};

export function ProductBalancePill({ hallabong, isLoading }: Props) {
  return (
    <View style={styles.balancePillSmall}>
      <Text style={styles.balanceLabel}>내 한라봉</Text>
      <Text style={styles.balanceValue}>
        {isLoading ? "확인 중..." : `${(hallabong ?? 0).toLocaleString("ko-KR")}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  balancePillSmall: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 25,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  balanceLabel: {
    ...typography.body3,
    color: colors.gray[600],
  },
  balanceValue: {
    ...typography.body1,
    color: colors.primary[400],
  },
});

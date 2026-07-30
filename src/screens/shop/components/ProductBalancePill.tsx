import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import Hanlabong from "src/assets/hanlabong.svg";

type Props = {
  hallabong?: number;
  isLoading: boolean;
};

export function ProductBalancePill({ hallabong, isLoading }: Props) {
  return (
    <View style={styles.balancePillSmall}>
      <Text style={styles.balanceLabel}>내 한라봉</Text>
      <Hanlabong width={24} height={24} />
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
    marginTop: 10,
    marginBottom: 25,
    paddingVertical: 14,
    paddingHorizontal: 17.5,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  balanceLabel: {
    ...typography.body1,
    color: colors.primary[400],
  },
  balanceValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.gray[600],
    marginLeft: 8,
  },
});

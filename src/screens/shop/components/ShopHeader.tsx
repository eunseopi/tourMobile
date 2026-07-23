import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import type { ProductCategory } from "src/types/ProductTypes";

const CATEGORIES: Array<{ key: ProductCategory; label: string }> = [
  { key: "JEJU_TICON", label: "제주티콘" },
  { key: "GOODS", label: "굿즈" },
];

type Props = {
  hallabong?: number | null;
  category: ProductCategory;
  onChangeCategory: (category: ProductCategory) => void;
  onPressCharge: () => void;
};

export function ShopHeader({ hallabong, category, onChangeCategory, onPressCharge }: Props) {
  return (
    <>
      <View style={styles.balancePill}>
        <View style={styles.balanceLeft}>
          <Text style={styles.fruitIcon}>●</Text>
          <Text style={styles.balanceLabel}>내 한라봉</Text>
          <Text style={styles.balanceValue}>{(hallabong ?? 0).toLocaleString("ko-KR")}</Text>
        </View>
        <View style={styles.balanceDivider} />
        <Pressable style={styles.chargeButton} onPress={onPressCharge}>
          <Text style={styles.chargeText}>충전하기</Text>
          <Text style={styles.chargeArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map((item) => {
          const active = item.key === category;
          return (
            <Pressable key={item.key} style={styles.tab} onPress={() => onChangeCategory(item.key)}>
              <Text style={[styles.tabText, active && styles.activeTabText]}>{item.label}</Text>
              {active ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  balancePill: { flexDirection: "row", alignItems: "center", marginVertical: 10, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 50, borderWidth: 1, borderColor: colors.primary[200], backgroundColor: colors.primary[50] },
  balanceLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  fruitIcon: { color: colors.primary[400], fontSize: 14, marginRight: 8 },
  balanceLabel: { ...typography.body3, color: colors.gray[600], marginRight: 6 },
  balanceValue: { ...typography.body1, color: colors.primary[400] },
  balanceDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.primary[200] },
  chargeButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 9 },
  chargeText: { ...typography.body1, color: colors.primary[400] },
  chargeArrow: { fontSize: 22, lineHeight: 22, color: colors.primary[400] },
  tabs: { flexDirection: "row", minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabText: { ...typography.body1, color: colors.gray[500] },
  activeTabText: { color: colors.primary[400] },
  tabIndicator: { position: "absolute", left: 0, right: 0, bottom: -1, height: 2, backgroundColor: colors.primary[400] },
});

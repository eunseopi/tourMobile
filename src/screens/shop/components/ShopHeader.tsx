import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import type { ProductCategory } from "src/types/ProductTypes";
import Hanlabong from "src/assets/hanlabong.svg";

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
          <Text style={styles.balanceLabel}>내 한라봉</Text>
          <Hanlabong width={24} height={24} />
          <Text style={styles.balanceValue}>{(hallabong ?? 0).toLocaleString("ko-KR")}</Text>
        </View>
        <View style={styles.balanceDivider} />
        <Pressable style={styles.chargeButton} onPress={onPressCharge}>
          <Text style={styles.chargeText}>한라봉 채우기</Text>
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
  balancePill: { flexDirection: "row", alignItems: "center", marginVertical: 10, paddingVertical: 14, paddingHorizontal: 17.5, borderRadius: 50, borderWidth: 1, borderColor: colors.primary[200], backgroundColor: colors.primary[50] },
  balanceLeft: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 },
  balanceLabel: { ...typography.body1, color: colors.primary[400] },
  balanceValue: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: colors.gray[600], marginLeft: 8 },
  balanceDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.primary[200] },
  chargeButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 9 },
  chargeText: { ...typography.body1, color: colors.primary[400] },
  chargeArrow: { fontSize: 20, lineHeight: 20, color: colors.primary[400] },
  tabs: { flexDirection: "row", minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabText: { fontSize: 16, lineHeight: 22, fontWeight: "400", color: colors.gray[500] },
  activeTabText: { fontWeight: "600", color: colors.primary[400] },
  tabIndicator: { position: "absolute", left: 0, right: 0, bottom: -1, height: 1.5, backgroundColor: colors.primary[400] },
});

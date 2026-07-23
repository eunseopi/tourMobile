import { useCallback, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useProducts } from "src/features/product/useProducts";
import type { ProductCategory } from "src/types/ProductTypes";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;

const CATEGORIES: Array<{ key: ProductCategory; label: string }> = [
  { key: "JEJU_TICON", label: "제주티콘" },
  { key: "GOODS", label: "굿즈" },
];

export default function ShopScreen({ navigation }: Props) {
  const [category, setCategory] = useState<ProductCategory>("JEJU_TICON");
  const { data: me } = useSessionMe();
  const { products, isLoading, isError, error, refetch } = useProducts(category);

  const handlePressProduct = useCallback(
    (productId: string | number) => {
      navigation.navigate("ProductDetail", { productId, category });
    },
    [category, navigation]
  );

  return (
    <View style={styles.container}>
      <View style={styles.balancePill}>
        <View style={styles.balanceLeft}>
          <Text style={styles.fruitIcon}>●</Text>
          <Text style={styles.balanceLabel}>내 한라봉</Text>
          <Text style={styles.balanceValue}>{(me?.hallabong ?? 0).toLocaleString("ko-KR")}</Text>
        </View>
        <View style={styles.balanceDivider} />
        <Pressable style={styles.chargeButton} onPress={() => navigation.navigate("PointConvert")}>
          <Text style={styles.chargeText}>충전하기</Text>
          <Text style={styles.chargeArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map((item) => {
          const active = item.key === category;
          return (
            <Pressable
              key={item.key}
              style={styles.tab}
              onPress={() => setCategory(item.key)}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>
                {item.label}
              </Text>
              {active ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
          <Text style={styles.mutedText}>상품을 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? "상품 목록을 불러오지 못했어요."}</Text>
          <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
            <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products ?? []}
          keyExtractor={(item) => String(item.productId)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.mutedText}>표시할 상품이 없어요.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.productCard}
              onPress={() => handlePressProduct(item.productId)}
            >
              <View style={styles.productImageWrapper}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                ) : null}
              </View>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productPrice}>
                {(item.hallabongCost ?? 0).toLocaleString("ko-KR")} 한라봉
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.bg[50],
  },
  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  balanceLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fruitIcon: {
    color: colors.primary[400],
    fontSize: 14,
    marginRight: 8,
  },
  balanceLabel: {
    ...typography.body3,
    color: colors.gray[600],
    marginRight: 6,
  },
  balanceValue: {
    ...typography.body1,
    color: colors.primary[400],
  },
  balanceDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.primary[200],
  },
  chargeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 9,
  },
  chargeText: {
    ...typography.body1,
    color: colors.primary[400],
  },
  chargeArrow: {
    fontSize: 22,
    lineHeight: 22,
    color: colors.primary[400],
  },
  tabs: {
    flexDirection: "row",
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    ...typography.body1,
    color: colors.gray[500],
  },
  activeTabText: {
    color: colors.primary[400],
  },
  tabIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
    backgroundColor: colors.primary[400],
  },
  listContent: {
    paddingVertical: 30,
    paddingBottom: 44,
  },
  row: {
    gap: 15,
  },
  productCard: {
    flex: 1,
    marginBottom: 15,
  },
  productImageWrapper: {
    width: "100%",
    aspectRatio: 32 / 27,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.gray[200],
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productName: {
    ...typography.body2,
    color: colors.gray[700],
  },
  productPrice: {
    ...typography.body3,
    color: colors.gray[700],
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  emptyBox: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
    textAlign: "center",
  },
});

import { useMemo, useState } from "react";
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
import type { RootStackParamList } from "src/app/navigation/types";
import EmptyBuddy from "src/assets/emptyBuddy.svg";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useMyProducts } from "src/features/my-page/useMyProducts";
import type { ProductCategory } from "src/types/ProductTypes";

type Props = NativeStackScreenProps<RootStackParamList, "MyCoupons">;

const TABS: { value: ProductCategory; label: string }[] = [
  { value: "JEJU_TICON", label: "제주티콘" },
  { value: "GOODS", label: "굿즈" },
];

export default function MyCouponsScreen({ navigation }: Props) {
  const { data: me } = useSessionMe();
  const {
    data: allCoupons = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyProducts(me?.userId);
  const [tab, setTab] = useState<ProductCategory>("JEJU_TICON");
  const coupons = useMemo(
    () => allCoupons.filter((item) => item.category === tab),
    [allCoupons, tab]
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="내 상품권" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
          <Text style={styles.mutedText}>쿠폰을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="내 상품권" />
        <View style={styles.center}>
          <Text style={styles.errorText}>쿠폰 목록을 불러오지 못했어요.</Text>
          <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
            <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="내 상품권" />
      <View style={styles.tabRow}>
        {TABS.map((item) => (
          <Pressable
            key={item.value}
            style={[styles.tabButton, tab === item.value && styles.tabButtonActive]}
            onPress={() => setTab(item.value)}
          >
            <Text style={[styles.tabButtonText, tab === item.value && styles.tabButtonTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
      style={styles.container}
      data={coupons}
      keyExtractor={(item) => String(item.exchangeId)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <EmptyBuddy width={104} height={110} />
          <Text style={styles.emptyText}>
            아직 보유한 {tab === "JEJU_TICON" ? "제주티콘" : "굿즈"}이 없어요.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.productCard}
          onPress={() =>
            navigation.navigate("CouponDetail", { exchangeId: item.exchangeId })
          }
        >
          <View style={styles.productImageWrapper}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            ) : null}
          </View>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.status, item.accepted && styles.acceptedStatus]}>
            {item.accepted ? (item.category === "JEJU_TICON" ? "사용 완료" : "수령완료") : "사용 가능"}
          </Text>
        </Pressable>
      )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 14,
    backgroundColor: colors.bg[50],
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  tabButtonActive: {
    backgroundColor: colors.primary[400],
  },
  tabButtonText: {
    ...typography.body3,
    fontWeight: "600",
    color: colors.gray[600],
  },
  tabButtonTextActive: {
    color: colors.base[0],
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 30,
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
  status: {
    ...typography.caption1,
    color: colors.primary[400],
    marginTop: 2,
  },
  acceptedStatus: {
    color: colors.gray[600],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[50],
  },
  emptyBox: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  emptyText: {
    ...typography.body4,
    fontWeight: "500",
    color: colors.gray[600],
    textAlign: "center",
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});

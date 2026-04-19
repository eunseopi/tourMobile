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
import { useProducts } from "src/features/product/useProducts";
import type { ProductCategory } from "src/types/ProductTypes";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;

const CATEGORIES: Array<{ key: ProductCategory; label: string }> = [
  { key: "JEJU_TICON", label: "제주티콘" },
  { key: "GOODS", label: "굿즈" },
];

export default function ShopScreen({ navigation }: Props) {
  const [category, setCategory] = useState<ProductCategory>("JEJU_TICON");
  const { products, isLoading, isError, error, refetch } = useProducts(category);

  const handlePressProduct = useCallback(
    (productId: string | number) => {
      navigation.navigate("ProductDetail", { productId, category });
    },
    [category, navigation]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>한라봉으로 교환해요</Text>

      <View style={styles.tabs}>
        {CATEGORIES.map((item) => {
          const active = item.key === category;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => setCategory(item.key)}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#ff8b4c" />
          <Text style={styles.mutedText}>상품을 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? "상품 목록을 불러오지 못했어요."}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
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
            <View style={styles.center}>
              <Text style={styles.mutedText}>표시할 상품이 없어요.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => handlePressProduct(item.productId)}
            >
              <View style={styles.imageBox}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                ) : (
                  <Text style={styles.placeholderText}>No Image</Text>
                )}
              </View>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.price}>
                {item.hallabongCost ?? 0} 한라봉
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
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#191919",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
  },
  activeTab: {
    backgroundColor: "#ff8b4c",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#777",
  },
  activeTabText: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 28,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#fafafa",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e8e8e8",
  },
  imageBox: {
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
  },
  productName: {
    marginTop: 10,
    minHeight: 40,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: "#222",
  },
  price: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  mutedText: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#d33",
  },
  retryButton: {
    marginTop: 14,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";
import type { Product } from "src/types/ProductTypes";
import Hanlabong from "src/assets/hanlabong.svg";

type Props = {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  error?: string | null;
  onRefresh: () => void;
  onPressProduct: (productId: string | number) => void;
};

export function ProductGrid({ products, isLoading, isError, error, onRefresh, onPressProduct }: Props) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>상품을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "상품 목록을 불러오지 못했어요."}</Text>
        <Pressable style={commonStyles.primaryButton} onPress={onRefresh}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.productId)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.mutedText}>표시할 상품이 없어요.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.productCard} onPress={() => onPressProduct(item.productId)}>
          <View style={styles.productImageWrapper}>
            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.productImage} /> : null}
          </View>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          {typeof item.hallabongCost === "number" ? (
            <View style={styles.productPriceRow}>
              <Text style={styles.productPrice}>{item.hallabongCost.toLocaleString("ko-KR")}</Text>
              <Hanlabong width={24} height={24} />
            </View>
          ) : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 30, paddingBottom: 44 },
  row: { gap: 15 },
  productCard: { flex: 1, marginBottom: 15 },
  productImageWrapper: { width: "100%", aspectRatio: 32 / 27, marginBottom: 10, borderRadius: 8, overflow: "hidden", backgroundColor: colors.gray[200] },
  productImage: { width: "100%", height: "100%" },
  productName: { ...typography.body2, color: colors.gray[700] },
  productPriceRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  productPrice: { ...typography.body3, color: colors.gray[700] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  emptyBox: { minHeight: 220, alignItems: "center", justifyContent: "center" },
  mutedText: { ...typography.body4, color: colors.gray[500] },
  errorText: { ...typography.body3, color: colors.error[100], textAlign: "center" },
});

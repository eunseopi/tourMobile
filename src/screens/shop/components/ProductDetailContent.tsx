import { Image, StyleSheet, Text, View } from "react-native";
import type { Product } from "src/types/ProductTypes";
import { colors, typography } from "src/design/theme";

type Props = {
  product: Product;
  categoryLabel: string;
};

export function ProductDetailContent({ product, categoryLabel }: Props) {
  return (
    <>
      <View style={styles.productImageWrapper}>
        {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.productImage} /> : null}
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productArea}>
          <Text style={styles.productAreaText}>{categoryLabel}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{(product.hallabongCost ?? 0).toLocaleString("ko-KR")} 한라봉</Text>
        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  productImageWrapper: {
    width: "100%",
    aspectRatio: 32 / 27,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.gray[200],
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    marginTop: 0,
  },
  productArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productAreaText: {
    ...typography.head4,
    color: colors.gray[500],
    fontWeight: "600",
  },
  chevron: {
    fontSize: 20,
    lineHeight: 20,
    color: colors.gray[400],
  },
  productName: {
    ...typography.head2,
    color: colors.gray[800],
    marginTop: 10,
    marginBottom: 2,
  },
  productPrice: {
    ...typography.head3,
    color: colors.gray[700],
  },
  description: {
    ...typography.body4,
    color: colors.gray[600],
    marginTop: 12,
  },
});

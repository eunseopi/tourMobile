import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout } from "src/design/theme";
import { useProductDetailFlow } from "src/features/product/useProductDetailFlow";
import { ProductBalancePill } from "./components/ProductBalancePill";
import { ProductChargeBanner } from "./components/ProductChargeBanner";
import { ProductDetailContent } from "./components/ProductDetailContent";
import { ProductDetailStateView } from "./components/ProductDetailStateView";
import { ProductPurchaseButton } from "./components/ProductPurchaseButton";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { productId, category } = route.params;
  const productDetail = useProductDetailFlow({
    productId,
    category,
    onGoPointConvert: () => navigation.navigate("PointConvert"),
    onGoChallenge: () => navigation.navigate("Challenge"),
    onGoPostWrite: () => navigation.navigate("PostWrite"),
  });

  if (productDetail.isLoading) {
    return <ProductDetailStateView type="loading" />;
  }

  if (productDetail.isError || !productDetail.product) {
    return <ProductDetailStateView type="error" onRetry={() => productDetail.refetch()} />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ProductBalancePill
          hallabong={productDetail.me?.hallabong}
          isLoading={productDetail.isLoadingMe}
        />
        <ProductDetailContent
          product={productDetail.product}
          categoryLabel={productDetail.categoryLabel}
        />
        <ProductChargeBanner onPress={() => navigation.navigate("PointConvert")} />
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <ProductPurchaseButton
          isPurchasing={productDetail.isPurchasing}
          onPurchase={productDetail.handlePurchase}
        />
      </View>
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
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 172,
  },
});

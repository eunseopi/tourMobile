import { useCallback, useState } from "react";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";
import type { MainTabParamList, RootStackParamList } from "src/app/navigation/types";
import { NotificationBellButton } from "src/components/navigation/NotificationBellButton";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { colors, layout } from "src/design/theme";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useProducts } from "src/features/product/useProducts";
import type { ProductCategory } from "src/types/ProductTypes";
import { ProductGrid } from "./components/ProductGrid";
import { ShopHeader } from "./components/ShopHeader";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Shop">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ShopScreen({ navigation }: Props) {
  const [category, setCategory] = useState<ProductCategory>("JEJU_TICON");
  const { data: me } = useSessionMe();
  const { products, isLoading, isError, error, refetch } = useProducts(category);

  const handlePressProduct = useCallback(
    (productId: string | number) => navigation.navigate("ProductDetail", { productId, category }),
    [category, navigation]
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="구매하기" showBack={false} right={<NotificationBellButton />} />
      <View style={styles.container}>
        <ShopHeader
          hallabong={me?.hallabong}
          category={category}
          onChangeCategory={setCategory}
          onPressCharge={() => navigation.navigate("PointConvert")}
          onPressMyCoupons={() => navigation.navigate("MyCoupons")}
        />
        <ProductGrid
          products={products ?? []}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRefresh={() => void refetch()}
          onPressProduct={handlePressProduct}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg[50] },
  container: { flex: 1, paddingHorizontal: layout.screenPadding, backgroundColor: colors.bg[50] },
});

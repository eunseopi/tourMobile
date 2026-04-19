import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useProduct } from "src/features/product/useProduct";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useExchangeProduct } from "src/features/product/useExchangeProduct";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

const CATEGORY_LABEL = {
  JEJU_TICON: "제주티콘",
  GOODS: "굿즈",
} as const;

export default function ProductDetailScreen({ route }: Props) {
  const { productId, category } = route.params;
  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const { data: me, isLoading: isLoadingMe } = useSessionMe();
  const exchangeProduct = useExchangeProduct();

  const handlePurchase = async () => {
    if (!product) return;

    if (!me?.userId) {
      Alert.alert("로그인이 필요해요", "상품 구매를 위해 다시 로그인해주세요.");
      return;
    }

    try {
      await exchangeProduct.mutateAsync({
        productId: product.productId,
        userId: me.userId,
      });

      Alert.alert("구매 완료", "마이페이지에서 구매한 상품을 확인할 수 있어요.");
    } catch (error: any) {
      const errorCode = error?.response?.data?.errorCode;
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "구매에 실패했습니다.";

      if (errorCode === "INSUFFICIENT_HALLABONG") {
        Alert.alert("한라봉이 부족해요", "챌린지나 포인트 전환으로 한라봉을 모아보세요.");
        return;
      }

      Alert.alert("구매 실패", message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>상품 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>상품 정보를 찾을 수 없어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          <Text style={styles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imageBox}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>No Image</Text>
        )}
      </View>

      <Text style={styles.category}>
        {category ? CATEGORY_LABEL[category] : "상품"}
      </Text>
      <Text style={styles.name}>{product.name}</Text>

      {product.description ? (
        <Text style={styles.description}>{product.description}</Text>
      ) : null}

      <View style={styles.priceBox}>
        <Text style={styles.priceLabel}>교환 비용</Text>
        <Text style={styles.price}>{product.hallabongCost ?? 0} 한라봉</Text>
      </View>

      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>보유 한라봉</Text>
        <Text style={styles.balanceText}>
          {isLoadingMe ? "확인 중..." : `${me?.hallabong ?? 0} 한라봉`}
        </Text>
      </View>

      <Pressable
        style={[
          styles.primaryButton,
          exchangeProduct.isPending && styles.disabledButton,
        ]}
        disabled={exchangeProduct.isPending}
        onPress={handlePurchase}
      >
        <Text style={styles.primaryButtonText}>
          {exchangeProduct.isPending ? "구매 중..." : "구매하기"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#f3f3f3",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: "#999",
  },
  category: {
    marginTop: 22,
    fontSize: 14,
    fontWeight: "700",
    color: "#ff8b4c",
  },
  name: {
    marginTop: 8,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
    color: "#1f1f1f",
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#666",
  },
  priceBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff4ec",
  },
  priceLabel: {
    fontSize: 13,
    color: "#855234",
  },
  price: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  balanceBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#f8f8f8",
  },
  balanceLabel: {
    fontSize: 13,
    color: "#777",
  },
  balanceText: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
  },
  primaryButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
  errorText: {
    color: "#d33",
  },
});

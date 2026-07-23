import { Alert } from "react-native";
import type { ProductCategory } from "src/types/ProductTypes";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useExchangeProduct } from "src/features/product/useExchangeProduct";
import { useProduct } from "src/features/product/useProduct";

type UseProductDetailFlowOptions = {
  productId: string | number;
  category?: ProductCategory;
  onGoPointConvert: () => void;
  onGoChallenge: () => void;
  onGoPostWrite: () => void;
};

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  JEJU_TICON: "제주티콘",
  GOODS: "굿즈",
};

export function useProductDetailFlow({
  productId,
  category,
  onGoPointConvert,
  onGoChallenge,
  onGoPostWrite,
}: UseProductDetailFlowOptions) {
  const productQuery = useProduct(productId);
  const sessionQuery = useSessionMe();
  const exchangeProduct = useExchangeProduct();
  const categoryLabel = category ? CATEGORY_LABEL[category] : "상품";

  const handlePurchase = async () => {
    const product = productQuery.data;
    const me = sessionQuery.data;
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
      const message = error?.response?.data?.message ?? error?.message ?? "구매에 실패했습니다.";

      if (errorCode === "INSUFFICIENT_HALLABONG") {
        Alert.alert("한라봉이 부족해요", "챌린지나 커뮤니티 활동으로 한라봉을 모아보세요.", [
          { text: "포인트 전환", onPress: onGoPointConvert },
          { text: "챌린지 보기", onPress: onGoChallenge },
          { text: "스팟 남기기", onPress: onGoPostWrite },
          { text: "닫기", style: "cancel" },
        ]);
        return;
      }

      Alert.alert("구매 실패", message);
    }
  };

  return {
    product: productQuery.data,
    me: sessionQuery.data,
    categoryLabel,
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    isLoadingMe: sessionQuery.isLoading,
    isPurchasing: exchangeProduct.isPending,
    refetch: productQuery.refetch,
    handlePurchase,
  };
}

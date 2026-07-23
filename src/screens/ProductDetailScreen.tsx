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
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
import { useProduct } from "src/features/product/useProduct";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useExchangeProduct } from "src/features/product/useExchangeProduct";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

const CATEGORY_LABEL = {
  JEJU_TICON: "제주티콘",
  GOODS: "굿즈",
} as const;

export default function ProductDetailScreen({ navigation, route }: Props) {
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
        Alert.alert("한라봉이 부족해요", "챌린지나 커뮤니티 활동으로 한라봉을 모아보세요.", [
          { text: "포인트 전환", onPress: () => navigation.navigate("PointConvert") },
          { text: "챌린지 보기", onPress: () => navigation.navigate("Challenge") },
          { text: "스팟 남기기", onPress: () => navigation.navigate("PostWrite") },
          { text: "닫기", style: "cancel" },
        ]);
        return;
      }

      Alert.alert("구매 실패", message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>상품 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>상품 정보를 찾을 수 없어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.balancePillSmall}>
          <Text style={styles.balanceLabel}>내 한라봉</Text>
          <Text style={styles.balanceValue}>
            {isLoadingMe ? "확인 중..." : `${(me?.hallabong ?? 0).toLocaleString("ko-KR")}`}
          </Text>
        </View>

        <View style={styles.productImageWrapper}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : null}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productArea}>
            <Text style={styles.productAreaText}>{category ? CATEGORY_LABEL[category] : "상품"}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            {(product.hallabongCost ?? 0).toLocaleString("ko-KR")} 한라봉
          </Text>
          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}
        </View>

        <Pressable style={styles.banner} onPress={() => navigation.navigate("PointConvert")}>
          <View style={styles.bannerImage} />
          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerTitle}>한라봉 충전하기</Text>
            <Text style={styles.bannerSubtitle}>포인트를 한라봉으로 바꿔보세요.</Text>
          </View>
          <Text style={styles.bannerArrow}>›</Text>
        </Pressable>
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
            exchangeProduct.isPending && commonStyles.primaryButtonDisabled,
          ]}
          disabled={exchangeProduct.isPending}
          onPress={handlePurchase}
        >
          {exchangeProduct.isPending ? (
            <ActivityIndicator color={colors.base[0]} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>구매하기</Text>
          )}
        </Pressable>
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
  balancePillSmall: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 25,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  balanceLabel: {
    ...typography.body3,
    color: colors.gray[600],
  },
  balanceValue: {
    ...typography.body1,
    color: colors.primary[400],
  },
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
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 91,
    marginTop: 40,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF4DB",
  },
  bannerImage: {
    width: 104,
    height: "100%",
    backgroundColor: colors.primary[100],
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.head4,
    color: colors.primary[500],
    fontWeight: "600",
  },
  bannerSubtitle: {
    ...typography.body4,
    color: colors.primary[400],
    marginTop: 4,
  },
  bannerArrow: {
    paddingRight: 20,
    fontSize: 24,
    color: colors.primary[400],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[50],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});

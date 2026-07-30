import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { ScreenStateView } from "src/components/ui/ScreenStateView";
import { colors } from "src/design/theme";
import { useCouponDetailFlow } from "src/features/my-page/useCouponDetailFlow";
import { CouponDetailCard } from "./components/CouponDetailCard";

type Props = NativeStackScreenProps<RootStackParamList, "CouponDetail">;

export default function CouponDetailScreen({ route }: Props) {
  const { exchangeId } = route.params;
  const couponDetail = useCouponDetailFlow(exchangeId);

  if (couponDetail.isLoading) {
    return (
      <ScreenStateView
        type="loading"
        title="사용하기"
        loadingText="쿠폰 정보를 불러오는 중..."
        errorText="쿠폰 정보를 찾을 수 없어요."
        backgroundColor={colors.bg[50]}
      />
    );
  }

  if (couponDetail.isError || !couponDetail.coupon) {
    return (
      <ScreenStateView
        type="error"
        title="사용하기"
        loadingText="쿠폰 정보를 불러오는 중..."
        errorText="쿠폰 정보를 찾을 수 없어요."
        backgroundColor={colors.bg[50]}
        onRetry={() => couponDetail.refetch()}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="사용하기" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.cardWrapper}>
          <CouponDetailCard coupon={couponDetail.coupon} />
          <PrimaryActionButton
            label={couponDetail.coupon.accepted ? "수령완료" : "수령하기"}
            isLoading={couponDetail.isAccepting}
            disabled={couponDetail.disabled}
            style={styles.actionButton}
            onPress={couponDetail.handleAcceptToggle}
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
  },
  cardWrapper: {
    gap: 0,
  },
  actionButton: {
    marginTop: 14,
  },
});

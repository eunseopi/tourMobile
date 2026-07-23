import { useMemo } from "react";
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
import { colors, shadow, typography } from "src/design/theme";
import { useExchangeDetail } from "src/features/my-page/useExchangeDetail";
import { useAcceptToggle } from "src/features/my-page/useAcceptToggle";
import { useSessionMe } from "src/features/my-page/useSessionMe";

type Props = NativeStackScreenProps<RootStackParamList, "CouponDetail">;

export default function CouponDetailScreen({ route }: Props) {
  const { exchangeId } = route.params;
  const { data: me } = useSessionMe();
  const { data: coupon, isLoading, isError, refetch } = useExchangeDetail(exchangeId);
  const acceptToggle = useAcceptToggle();

  const disabled = useMemo(
    () => !coupon || coupon.accepted || acceptToggle.isPending,
    [acceptToggle.isPending, coupon]
  );

  const handleAcceptToggle = async () => {
    if (!coupon || coupon.accepted) return;

    try {
      await acceptToggle.mutateAsync({
        exchangeId: coupon.exchangeId,
        userId: me?.userId,
      });
      Alert.alert("수령 완료", "쿠폰 사용 상태가 반영되었어요.");
      void refetch();
    } catch (error: any) {
      Alert.alert(
        "처리 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>쿠폰 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !coupon) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>쿠폰 정보를 찾을 수 없어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.couponBox}>
        <View style={styles.productImageWrapper}>
          {coupon.imageUrl ? (
            <Image source={{ uri: coupon.imageUrl }} style={styles.productImage} />
          ) : null}
        </View>

        <View style={styles.couponInformation}>
          <Text style={styles.couponName} numberOfLines={2}>{coupon.name}</Text>
          <View style={styles.bar} />

          <View style={styles.availablePlace}>
            <Text style={styles.placeCaption}>사용처</Text>
            <Text style={styles.placeText}>
              인천광역시 중구 공항로271, 인천국제공항 제 1 여객터미널 교통센터 지하 1층
            </Text>
          </View>

          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              해당 버튼은 담당자에게 물품 수령 시 제출하며{`
`}
              1회만 사용 가능하고 재사용은 불가합니다.{`
`}
              ※ 사용 전 내용을 꼭 확인해 주세요. ※
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
            disabled && commonStyles.primaryButtonDisabled,
          ]}
          disabled={disabled}
          onPress={handleAcceptToggle}
        >
          {acceptToggle.isPending ? (
            <ActivityIndicator color={colors.base[0]} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>
              {coupon.accepted ? "수령완료" : "수령하기"}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 44,
  },
  couponBox: {
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
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
  couponInformation: {
    marginVertical: 20,
  },
  couponName: {
    ...typography.head4,
    color: colors.gray[800],
    fontWeight: "600",
  },
  bar: {
    height: 1,
    marginVertical: 16,
    backgroundColor: colors.gray[200],
  },
  availablePlace: {
    marginBottom: 8,
  },
  placeCaption: {
    ...typography.body3,
    color: colors.gray[700],
    marginBottom: 4,
  },
  placeText: {
    ...typography.caption2,
    color: colors.gray[600],
  },
  alertBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.bg[50],
  },
  alertText: {
    ...typography.caption2,
    color: colors.gray[400],
    textAlign: "center",
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

import { useMemo } from "react";
import { Alert } from "src/components/ui/AppAlert";
import { useAcceptToggle } from "src/features/my-page/useAcceptToggle";
import { useExchangeDetail } from "src/features/my-page/useExchangeDetail";
import { useSessionMe } from "src/features/my-page/useSessionMe";

export function useCouponDetailFlow(exchangeId: string | number) {
  const { data: me } = useSessionMe();
  const couponQuery = useExchangeDetail(exchangeId);
  const acceptToggle = useAcceptToggle();

  const disabled = useMemo(
    () => !couponQuery.data || couponQuery.data.accepted || acceptToggle.isPending,
    [acceptToggle.isPending, couponQuery.data],
  );

  const handleAcceptToggle = async () => {
    const coupon = couponQuery.data;
    if (!coupon || coupon.accepted) return;

    try {
      await acceptToggle.mutateAsync({
        exchangeId: coupon.exchangeId,
        userId: me?.userId,
      });
      Alert.alert("수령 완료", "쿠폰 사용 상태가 반영되었어요.");
      void couponQuery.refetch();
    } catch (error: any) {
      Alert.alert(
        "처리 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요.",
      );
    }
  };

  return {
    coupon: couponQuery.data,
    isLoading: couponQuery.isLoading,
    isError: couponQuery.isError,
    isAccepting: acceptToggle.isPending,
    disabled,
    refetch: couponQuery.refetch,
    handleAcceptToggle,
  };
}

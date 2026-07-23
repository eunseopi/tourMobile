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
import { useExchangeDetail } from "src/features/my-page/useExchangeDetail";
import { useAcceptToggle } from "src/features/my-page/useAcceptToggle";
import { useSessionMe } from "src/features/my-page/useSessionMe";

type Props = NativeStackScreenProps<RootStackParamList, "CouponDetail">;

export default function CouponDetailScreen({ route }: Props) {
  const { exchangeId } = route.params;
  const { data: me } = useSessionMe();
  const { data: coupon, isLoading, isError, refetch } = useExchangeDetail(exchangeId);
  const acceptToggle = useAcceptToggle();

  const categoryLabel = useMemo(() => {
    if (!coupon) return "쿠폰";
    return coupon.category === "JEJU_TICON" ? "제주티콘" : "굿즈";
  }, [coupon]);

  const handleAcceptToggle = async () => {
    if (!coupon || coupon.accepted) return;

    try {
      await acceptToggle.mutateAsync({
        exchangeId: coupon.exchangeId,
        userId: me?.userId,
      });
      Alert.alert("사용 완료", "쿠폰 사용 상태가 반영되었어요.");
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
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>쿠폰 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !coupon) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>쿠폰 정보를 찾을 수 없어요.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {coupon.imageUrl ? (
          <Image source={{ uri: coupon.imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Coupon</Text>
        )}
      </View>

      <Text style={styles.category}>{categoryLabel}</Text>
      <Text style={styles.name}>{coupon.name}</Text>

      <View style={styles.infoBox}>
        <InfoRow label="교환 번호" value={String(coupon.exchangeId)} />
        <InfoRow label="상품 번호" value={String(coupon.productId)} />
        <InfoRow
          label="상태"
          value={coupon.accepted ? "사용 완료" : "사용 가능"}
        />
      </View>

      <Pressable
        style={[
          styles.primaryButton,
          (coupon.accepted || acceptToggle.isPending) && styles.disabledButton,
        ]}
        disabled={coupon.accepted || acceptToggle.isPending}
        onPress={handleAcceptToggle}
      >
        <Text style={styles.primaryButtonText}>
          {coupon.accepted
            ? "이미 사용했어요"
            : acceptToggle.isPending
              ? "처리 중..."
              : "사용 처리하기"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  hero: {
    width: "100%",
    aspectRatio: 1.2,
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
    fontWeight: "800",
  },
  category: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  name: {
    marginTop: 8,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "900",
    color: "#191919",
  },
  infoBox: {
    marginTop: 22,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fafafa",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e6e6e6",
  },
  infoRow: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e8e8e8",
  },
  infoLabel: {
    fontSize: 14,
    color: "#777",
  },
  infoValue: {
    fontSize: 14,
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
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
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
  retryButton: {
    marginTop: 14,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});

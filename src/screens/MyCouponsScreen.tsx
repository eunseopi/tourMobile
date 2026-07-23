import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useMyProducts } from "src/features/my-page/useMyProducts";

type Props = NativeStackScreenProps<RootStackParamList, "MyCoupons">;

export default function MyCouponsScreen({ navigation }: Props) {
  const { data: me } = useSessionMe();
  const {
    data: coupons = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyProducts(me?.userId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>쿠폰을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>쿠폰 목록을 불러오지 못했어요.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={coupons}
      keyExtractor={(item) => String(item.exchangeId)}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.mutedText}>보유한 쿠폰이 없습니다.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() =>
            navigation.navigate("CouponDetail", { exchangeId: item.exchangeId })
          }
        >
          <View style={styles.imageBox}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <Text style={styles.placeholderText}>Coupon</Text>
            )}
          </View>
          <View style={styles.body}>
            <Text style={styles.category}>
              {item.category === "JEJU_TICON" ? "제주티콘" : "굿즈"}
            </Text>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.status, item.accepted && styles.acceptedStatus]}>
              {item.accepted ? "사용 완료" : "사용 가능"}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#fafafa",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e8e8e8",
  },
  imageBox: {
    width: 96,
    height: 96,
    borderRadius: 14,
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
  body: {
    flex: 1,
    justifyContent: "center",
  },
  category: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  name: {
    marginTop: 6,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    color: "#222",
  },
  status: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "800",
    color: "#2a7f39",
  },
  acceptedStatus: {
    color: "#999",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  emptyBox: {
    paddingVertical: 100,
    alignItems: "center",
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

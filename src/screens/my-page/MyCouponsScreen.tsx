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
import type { RootStackParamList } from "src/app/navigation/types";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
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
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>쿠폰을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>쿠폰 목록을 불러오지 못했어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={coupons}
      keyExtractor={(item) => String(item.exchangeId)}
      numColumns={2}
      columnWrapperStyle={styles.row}
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
          style={styles.productCard}
          onPress={() =>
            navigation.navigate("CouponDetail", { exchangeId: item.exchangeId })
          }
        >
          <View style={styles.productImageWrapper}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            ) : null}
          </View>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.status, item.accepted && styles.acceptedStatus]}>
            {item.accepted ? "수령완료" : "사용 가능"}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 30,
    paddingBottom: 44,
  },
  row: {
    gap: 15,
  },
  productCard: {
    flex: 1,
    marginBottom: 15,
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
  productName: {
    ...typography.body2,
    color: colors.gray[700],
  },
  status: {
    ...typography.caption1,
    color: colors.primary[400],
    marginTop: 2,
  },
  acceptedStatus: {
    color: colors.gray[400],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[50],
  },
  emptyBox: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
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

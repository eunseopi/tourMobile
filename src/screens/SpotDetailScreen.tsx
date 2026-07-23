import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { communityApi } from "src/api/community";
import { formatDate } from "src/utils/formDate";

type Props = NativeStackScreenProps<RootStackParamList, "SpotDetail">;

export default function SpotDetailScreen({ route, navigation }: Props) {
  const { spotId } = route.params;
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["spotDetail", spotId],
    queryFn: () => communityApi.getSpotDetail(spotId).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>스팟 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>스팟 정보를 찾을 수 없어요.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
      {data.imageUrls?.[0] ? (
        <Image source={{ uri: data.imageUrls[0] }} style={styles.heroImage} />
      ) : (
        <View style={[styles.heroImage, styles.heroFallback]}>
          <Text style={styles.heroFallbackText}>SPOT</Text>
        </View>
      )}

      <Text style={styles.title}>{data.name}</Text>
      <Text style={styles.meta}>
        {data.userNickname || "제주데이"} · {formatDate(data.createdAt)}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>좋아요</Text>
          <Text style={styles.statValue}>{data.likeCount ?? 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>좌표</Text>
          <Text style={styles.statValueSmall}>
            {Number(data.latitude).toFixed(3)}, {Number(data.longitude).toFixed(3)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>소개</Text>
      <Text style={styles.description}>
        {data.description || "이 스팟에 대한 소개가 아직 준비되지 않았어요."}
      </Text>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate("Map", {
              focusId: String(data.id),
              latitude: data.latitude,
              longitude: data.longitude,
              type: "SPOT",
            })
          }
        >
          <Text style={styles.primaryButtonText}>지도에서 보기</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Community")}
        >
          <Text style={styles.secondaryButtonText}>커뮤니티로</Text>
        </Pressable>
      </View>
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
    paddingBottom: 32,
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
    color: "#d14b4b",
  },
  retryButton: {
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4ec",
  },
  heroFallbackText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ff8b4c",
  },
  title: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: "900",
    color: "#1f1f1f",
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: "#777",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f7f7f7",
  },
  statLabel: {
    fontSize: 13,
    color: "#777",
  },
  statValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "900",
    color: "#ff8b4c",
  },
  statValueSmall: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  sectionTitle: {
    marginTop: 22,
    fontSize: 18,
    fontWeight: "900",
    color: "#222",
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: "#555",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f1f1",
  },
  secondaryButtonText: {
    color: "#444",
    fontWeight: "700",
    fontSize: 15,
  },
});

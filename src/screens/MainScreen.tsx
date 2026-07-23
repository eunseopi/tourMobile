import { useEffect, useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
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
import CheckInModal from "src/components/main/CheckInModal";
import { useLoadOngoingChallenges, useLoadUpcomingChallenges } from "src/features/challenges/useChallengeQueries";
import { useCheckIn } from "src/features/main/useCheckIn";
import { useCommunityPosts } from "src/features/community/useCommunityPosts";
import { useNearbySpots } from "src/features/main/useNearbySpots";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import type { Spot } from "src/reducer/types";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;
const DEFAULT_JEJU = { latitude: 33.4996, longitude: 126.5312 };

export default function MainScreen({ navigation }: Props) {
  const [coords, setCoords] = useState(DEFAULT_JEJU);
  const [locationLabel, setLocationLabel] = useState("제주 제주시");
  const [isLocating, setIsLocating] = useState(true);
  const [checkInOpen, setCheckInOpen] = useState(false);

  const { data: me } = useSessionMe();
  const { state: checkInState, claim } = useCheckIn();
  const upcoming = useLoadUpcomingChallenges();
  const ongoing = useLoadOngoingChallenges();
  const community = useCommunityPosts("latest", 0, 5);
  const nearby = useNearbySpots(coords.latitude, coords.longitude, 3);

  useEffect(() => {
    if (checkInState.shouldOpen) {
      setCheckInOpen(true);
    }
  }, [checkInState.shouldOpen]);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        setIsLocating(true);
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          setLocationLabel("제주 제주시");
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        const nextCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(nextCoords);

        const places = await Location.reverseGeocodeAsync(nextCoords);
        const place = places[0];
        if (place) {
          const region = [place.region, place.city, place.district]
            .filter(Boolean)
            .slice(0, 2)
            .join(" ");
          if (region) setLocationLabel(region);
        }
      } catch {
        setLocationLabel("제주 제주시");
      } finally {
        setIsLocating(false);
      }
    };

    void loadLocation();
  }, []);

  const refreshAll = async () => {
    await Promise.all([
      nearby.refetch(),
      community.refetch(),
      upcoming.refetch(),
      ongoing.refetch(),
    ]);
  };

  const nearestItems = useMemo(
    () =>
      [...nearby.items]
        .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))
        .slice(0, 5),
    [nearby.items]
  );

  const heroChallenge = ongoing.data?.[0] ?? upcoming.data?.[0] ?? null;
  const latestPosts = community.data?.content?.slice(0, 3) ?? [];

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={
              nearby.isRefetching ||
              community.isRefetching ||
              upcoming.isRefetching ||
              ongoing.isRefetching
            }
            onRefresh={refreshAll}
          />
        }
      >
        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>JEJU DAY</Text>
          <Text style={styles.title}>
            {me?.nickname ? `${me.nickname}님, 오늘도 제주를 걸어볼까요?` : "오늘도 제주를 걸어볼까요?"}
          </Text>
          <Text style={styles.description}>
            {isLocating ? "현재 위치를 확인하는 중..." : `${locationLabel} 근처 스팟과 챌린지를 모아봤어요.`}
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>보유 한라봉</Text>
              <Text style={styles.heroStatValue}>{me?.hallabong ?? 0}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>누적 걸음수</Text>
              <Text style={styles.heroStatValue}>{(me?.totalSteps ?? 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickRow}>
          <QuickButton label="지도" onPress={() => navigation.navigate("Map")} />
          <QuickButton label="상점" onPress={() => navigation.navigate("Shop")} />
          <QuickButton label="커뮤니티" onPress={() => navigation.navigate("Community")} />
          <QuickButton label="챌린지" onPress={() => navigation.navigate("Challenge")} />
          <QuickButton label="마이페이지" onPress={() => navigation.navigate("MyPage")} />
        </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>주변 스팟</Text>
          <Text style={styles.sectionMeta}>반경 3km</Text>
        </View>
        <Text style={styles.sectionDescription}>
          {isLocating ? "위치를 잡는 동안 기본 제주 중심 좌표로 불러와요." : `${locationLabel} 주변 추천입니다.`}
        </Text>

        {nearby.isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color="#ff8b4c" />
            <Text style={styles.centerText}>근처 스팟을 찾는 중...</Text>
          </View>
        ) : nearestItems.length > 0 ? (
          nearestItems.map((item) => (
            <Pressable
              key={String(item.id)}
              style={styles.listItem}
              onPress={() =>
                navigation.navigate("Map", {
                  focusId: item.id,
                  latitude: Number(item.latitude),
                  longitude: Number(item.longitude),
                  type: normalizeMapType(item.type),
                  filter: normalizeMapType(item.type),
                })
              }
            >
              <View style={styles.listMain}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.listMeta}>
                  {spotTypeLabel(item.type)} · {formatDistance(item.distanceKm)}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{Math.max(0, item.likeCount ?? 0)} ♥</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.centerBox}>
            <Text style={styles.centerText}>근처 스팟이 아직 없어요.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>추천 챌린지</Text>
          <Pressable onPress={() => navigation.navigate("Challenge")}>
            <Text style={styles.linkText}>전체 보기</Text>
          </Pressable>
        </View>

        {heroChallenge ? (
          <View style={styles.challengeFeature}>
            <View style={styles.challengeTextBox}>
              <Text style={styles.challengeStatus}>{heroChallenge.statusLabel}</Text>
              <Text style={styles.challengeTitle}>{heroChallenge.title}</Text>
              <Text style={styles.challengeMeta}>{heroChallenge.dateText || heroChallenge.categoryLabel}</Text>
              <View style={styles.challengeActions}>
                <Pressable
                  style={styles.challengeActionPrimary}
                  onPress={() =>
                    navigation.navigate("ChallengeDetail", { challenge: heroChallenge })
                  }
                >
                  <Text style={styles.challengeActionPrimaryText}>상세 보기</Text>
                </Pressable>
                <Pressable
                  style={styles.challengeActionGhost}
                  onPress={() => navigation.navigate("Map", { filter: "CHALLENGE" })}
                >
                  <Text style={styles.challengeActionGhostText}>지도에서 보기</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.challengeArrow}>›</Text>
          </View>
        ) : (
          <View style={styles.centerBox}>
            <Text style={styles.centerText}>지금 보여드릴 챌린지가 없어요.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최신 커뮤니티</Text>
          <Pressable onPress={() => navigation.navigate("Community")}>
            <Text style={styles.linkText}>더 보기</Text>
          </Pressable>
        </View>

        {community.isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color="#ff8b4c" />
            <Text style={styles.centerText}>게시글을 불러오는 중...</Text>
          </View>
        ) : latestPosts.length > 0 ? (
          latestPosts.map((post) => (
            <CommunityPreview
              key={post.id}
              post={post}
              onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
            />
          ))
        ) : (
          <View style={styles.centerBox}>
            <Text style={styles.centerText}>아직 게시글이 없어요.</Text>
          </View>
        )}
      </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>포팅 진행 중</Text>
          </View>

          <Pressable style={styles.devItem} onPress={() => navigation.navigate("Splash")}>
            <Text style={styles.devItemText}>스플래시 흐름 보기</Text>
            <Text style={styles.challengeArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.devItem} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.devItemText}>로그인 / 회원가입 보기</Text>
            <Text style={styles.challengeArrow}>›</Text>
          </Pressable>
        </View>
      </ScrollView>

      <CheckInModal
        open={checkInOpen}
        day={checkInState.day}
        reward={checkInState.reward}
        bonus={checkInState.bonus}
        onClose={() => setCheckInOpen(false)}
        onClaim={() => {
          claim();
          setCheckInOpen(false);
        }}
      />
    </>
  );
}

function QuickButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickButton} onPress={onPress}>
      <Text style={styles.quickButtonText}>{label}</Text>
    </Pressable>
  );
}

function CommunityPreview({ post, onPress }: { post: Spot; onPress: () => void }) {
  return (
    <Pressable style={styles.postPreview} onPress={onPress}>
      {post.imageUrls?.[0] ? (
        <Image source={{ uri: post.imageUrls[0] }} style={styles.postPreviewImage} />
      ) : (
        <View style={[styles.postPreviewImage, styles.postPreviewFallback]}>
          <Text style={styles.postPreviewFallbackText}>POST</Text>
        </View>
      )}
      <View style={styles.postPreviewText}>
        <Text style={styles.postPreviewTitle} numberOfLines={1}>
          {post.name}
        </Text>
        <Text style={styles.postPreviewBody} numberOfLines={2}>
          {post.description || "제주 스팟 이야기를 확인해보세요."}
        </Text>
        <Text style={styles.postPreviewMeta}>
          {post.userNickname} · 좋아요 {post.likeCount}
        </Text>
      </View>
    </Pressable>
  );
}

function spotTypeLabel(type?: string) {
  switch (type) {
    case "CHALLENGE":
      return "챌린지";
    case "POST":
      return "커뮤니티";
    case "SPOT":
      return "스팟";
    default:
      return "추천";
  }
}

function normalizeMapType(type?: string): "SPOT" | "POST" | "CHALLENGE" {
  if (type === "POST" || type === "SPOT" || type === "CHALLENGE") return type;
  return "SPOT";
}

function formatDistance(distanceKm?: number | null) {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return "거리 정보 없음";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)}km`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  heroSection: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#fff4ec",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "900",
    color: "#191919",
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#666",
  },
  heroStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  heroStat: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  heroStatLabel: {
    fontSize: 13,
    color: "#777",
  },
  heroStatValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "900",
    color: "#ff8b4c",
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  quickButton: {
    minWidth: "48%",
    flexGrow: 1,
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
  },
  quickButtonText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "700",
  },
  section: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1f1f1f",
  },
  sectionMeta: {
    fontSize: 13,
    color: "#777",
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  centerBox: {
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    marginTop: 10,
    color: "#777",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e8e8e8",
  },
  listMain: {
    flex: 1,
    paddingRight: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
  },
  listMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
  },
  badge: {
    minWidth: 62,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4ec",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8b532f",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ff8b4c",
  },
  challengeFeature: {
    marginTop: 12,
    minHeight: 104,
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
  },
  challengeTextBox: {
    flex: 1,
    paddingRight: 12,
  },
  challengeStatus: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffb585",
  },
  challengeTitle: {
    marginTop: 8,
    fontSize: 19,
    fontWeight: "900",
    color: "#fff",
  },
  challengeMeta: {
    marginTop: 8,
    fontSize: 13,
    color: "#ddd",
  },
  challengeActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  challengeActionPrimary: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  challengeActionPrimaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  challengeActionGhost: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2d2d2d",
    borderWidth: 1,
    borderColor: "#494949",
  },
  challengeActionGhostText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f2f2f2",
  },
  challengeArrow: {
    fontSize: 28,
    color: "#bbb",
  },
  postPreview: {
    flexDirection: "row",
    marginTop: 12,
    minHeight: 92,
    gap: 12,
  },
  postPreviewImage: {
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  postPreviewFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  postPreviewFallbackText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#999",
  },
  postPreviewText: {
    flex: 1,
    justifyContent: "center",
  },
  postPreviewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
  },
  postPreviewBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#666",
  },
  postPreviewMeta: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
  },
  devItem: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e8e8e8",
  },
  devItemText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
});

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
import type { RootStackParamList } from "src/app/navigation/types";
import CheckInModal from "src/components/main/CheckInModal";
import { useLoadOngoingChallenges, useLoadUpcomingChallenges } from "src/features/challenges/useChallengeQueries";
import { useCheckIn } from "src/features/main/useCheckIn";
import { useCommunityPosts } from "src/features/community/useCommunityPosts";
import { useNearbySpots } from "src/features/main/useNearbySpots";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import type { Spot } from "src/reducer/types";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";

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
            <ActivityIndicator color={colors.primary[400]} />
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
            <ActivityIndicator color={colors.primary[400]} />
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
    backgroundColor: colors.bg[50],
  },
  content: {
    padding: 20,
    paddingBottom: 90,
  },
  heroSection: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  eyebrow: {
    ...typography.caption1,
    color: colors.primary[400],
  },
  title: {
    ...typography.head2,
    color: colors.gray[800],
    marginTop: 8,
  },
  description: {
    ...typography.body4,
    color: colors.gray[600],
    marginTop: 10,
  },
  heroStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  heroStat: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.bg[50],
  },
  heroStatLabel: {
    ...typography.caption2,
    color: colors.gray[500],
  },
  heroStatValue: {
    ...typography.head3,
    color: colors.primary[400],
    marginTop: 8,
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
    minHeight: 48,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  quickButtonText: {
    ...typography.body1,
    color: colors.gray[700],
  },
  section: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...typography.head3,
    color: colors.gray[800],
  },
  sectionMeta: {
    ...typography.caption2,
    color: colors.gray[500],
  },
  sectionDescription: {
    ...typography.body4,
    color: colors.gray[600],
    marginTop: 8,
  },
  centerBox: {
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    ...typography.body4,
    color: colors.gray[500],
    marginTop: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  listMain: {
    flex: 1,
    paddingRight: 12,
  },
  listTitle: {
    ...typography.body3,
    color: colors.gray[800],
  },
  listMeta: {
    ...typography.caption2,
    color: colors.gray[500],
    marginTop: 4,
  },
  badge: {
    minWidth: 62,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[50],
  },
  badgeText: {
    ...typography.caption1,
    color: colors.primary[500],
  },
  linkText: {
    ...typography.body3,
    color: colors.primary[400],
  },
  challengeFeature: {
    marginTop: 12,
    minHeight: 104,
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[800],
  },
  challengeTextBox: {
    flex: 1,
    paddingRight: 12,
  },
  challengeStatus: {
    ...typography.caption1,
    color: colors.primary[300],
  },
  challengeTitle: {
    ...typography.head4,
    color: colors.base[0],
    marginTop: 8,
  },
  challengeMeta: {
    ...typography.caption2,
    color: colors.gray[200],
    marginTop: 8,
  },
  challengeActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  challengeActionPrimary: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  challengeActionPrimaryText: {
    ...typography.caption1,
    color: colors.base[0],
  },
  challengeActionGhost: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[700],
    borderWidth: 1,
    borderColor: colors.gray[600],
  },
  challengeActionGhostText: {
    ...typography.caption1,
    color: colors.gray[100],
  },
  challengeArrow: {
    fontSize: 28,
    color: colors.gray[400],
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
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  postPreviewFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  postPreviewFallbackText: {
    ...typography.caption1,
    color: colors.gray[400],
  },
  postPreviewText: {
    flex: 1,
    justifyContent: "center",
  },
  postPreviewTitle: {
    ...typography.body3,
    color: colors.gray[800],
  },
  postPreviewBody: {
    ...typography.caption2,
    color: colors.gray[600],
    marginTop: 6,
  },
  postPreviewMeta: {
    ...typography.caption2,
    color: colors.gray[400],
    marginTop: 8,
  },
});

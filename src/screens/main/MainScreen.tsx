import { useEffect, useMemo, useRef, useState } from "react";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useScrollToTop } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import { SafeAreaView } from "react-native-safe-area-context";
import type { MainTabParamList, RootStackParamList } from "src/app/navigation/types";
import { colors, spacing } from "src/design/theme";
import { useStartChallenge } from "src/features/challenges/useChallengeMutations";
import { useCommunityPosts } from "src/features/community/useCommunityPosts";
import { useNearbySpots } from "src/features/main/useNearbySpots";
import { usePedometerSteps } from "src/features/steps/usePedometerSteps";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { getCurrentPositionWithFallback, joinUniqueParts } from "src/utils/lib/location";
import { useTabBarHeight } from "src/utils/lib/useTabBarHeight";
import { CheckInButton } from "./components/CheckInButton";
import { CommunityPreviewList } from "./components/CommunityPreviewList";
import { HomeSection } from "./components/HomeSection";
import { MainHero } from "./components/MainHero";
import { NearbyMapWidget, type NearbyMapItem } from "./components/NearbyMapWidget";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;
const DEFAULT_JEJU = { latitude: 33.4996, longitude: 126.5312 };

export default function MainScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const [coords, setCoords] = useState(DEFAULT_JEJU);
  const [locationLabel, setLocationLabel] = useState("제주 제주시");
  const [isLocating, setIsLocating] = useState(true);
  const [mapRecenterKey, setMapRecenterKey] = useState(0);

  const [startingId, setStartingId] = useState<string | number | null>(null);

  const { data: me } = useSessionMe();
  const todaySteps = usePedometerSteps();
  const community = useCommunityPosts("latest", 0, 5);
  const nearby = useNearbySpots(coords.latitude, coords.longitude, 1);
  const startChallenge = useStartChallenge();

  useEffect(() => {
    const loadLocation = async () => {
      try {
        setIsLocating(true);
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          setLocationLabel("제주 제주시");
          return;
        }

        const position = await getCurrentPositionWithFallback();
        const nextCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(nextCoords);

        const places = await Location.reverseGeocodeAsync(nextCoords);
        const place = places[0];
        if (place) {
          const region = joinUniqueParts([place.region, place.district || place.city], 2);
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
    setMapRecenterKey((value) => value + 1);
    await Promise.all([nearby.refetch(), community.refetch()]);
  };

  const nearestItems = useMemo(
    () => [...nearby.items].sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99)).slice(0, 20),
    [nearby.items]
  );

  const latestPosts = community.data?.content?.slice(0, 3) ?? [];
  const tabBarHeight = useTabBarHeight();

  const handleStartChallenge = (item: NearbyMapItem) => {
    Alert.alert("챌린지 시작", `'${item.name}' 챌린지를 시작할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "시작하기",
        onPress: async () => {
          try {
            setStartingId(item.id);
            const permission = await Location.requestForegroundPermissionsAsync();
            let latitude = coords.latitude;
            let longitude = coords.longitude;

            if (permission.status === "granted") {
              try {
                const current = await getCurrentPositionWithFallback();
                latitude = current.coords.latitude;
                longitude = current.coords.longitude;
              } catch {
                // 위치를 못 가져와도 이미 있는 좌표로 챌린지 시작은 계속 진행한다.
              }
            }

            await startChallenge.mutateAsync({ id: item.id, latitude, longitude });
            Alert.alert("챌린지 시작", "챌린지 탭의 '진행중'에서 확인할 수 있어요.");
          } catch (error: any) {
            Alert.alert(
              "시작 실패",
              error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
            );
          } finally {
            setStartingId(null);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight }]}
        refreshControl={
          <RefreshControl
            refreshing={nearby.isRefetching || community.isRefetching}
            onRefresh={refreshAll}
          />
        }
      >
        <MainHero
          nickname={me?.nickname}
          profileUrl={me?.profile}
          isLocating={isLocating}
          locationLabel={locationLabel}
          hallabong={me?.hallabong}
          totalSteps={todaySteps}
          onPressStats={() => navigation.navigate("PointConvert")}
        />

        <CheckInButton />

        <HomeSection
          title="주변 챌린지 · 스팟"
          linkLabel="지도에서 보기"
          // 글쓰기에서 사용한 위치 선택 모드가 내비게이션 스택에 남아 있어도
          // 홈에서는 항상 일반 탐색 지도로 열리도록 명시적으로 초기화한다.
          onPressLink={() => navigation.navigate("Map", { pickMode: false })}
          description={
            isLocating
              ? "위치를 잡는 동안 기본 제주 중심 좌표로 불러와요."
              : `${locationLabel} 주변 추천이에요.`
          }
        >
          <NearbyMapWidget
            latitude={coords.latitude}
            longitude={coords.longitude}
            recenterKey={mapRecenterKey}
            items={nearestItems}
            isLoading={nearby.isLoading}
            isStarting={startChallenge.isPending}
            startingId={startingId}
            onStartChallenge={handleStartChallenge}
          />
        </HomeSection>

        <HomeSection title="최신 커뮤니티" linkLabel="더 보기" onPressLink={() => navigation.navigate("Community")}>
          <CommunityPreviewList
            isLoading={community.isLoading}
            posts={latestPosts}
            onPressPost={(post) => navigation.navigate("PostDetail", { postId: post.id })}
          />
        </HomeSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg[50] },
  container: { flex: 1, backgroundColor: colors.bg[50] },
  content: { padding: 20, gap: spacing.sectionGap },
});

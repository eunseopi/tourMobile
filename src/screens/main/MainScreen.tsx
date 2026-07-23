import { useEffect, useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import CheckInModal from "src/components/main/CheckInModal";
import { colors } from "src/design/theme";
import { useLoadOngoingChallenges, useLoadUpcomingChallenges } from "src/features/challenges/useChallengeQueries";
import { useCommunityPosts } from "src/features/community/useCommunityPosts";
import { useCheckIn } from "src/features/main/useCheckIn";
import { useNearbySpots } from "src/features/main/useNearbySpots";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { CommunityPreviewList } from "./components/CommunityPreviewList";
import { FeaturedChallenge } from "./components/FeaturedChallenge";
import { HomeSection } from "./components/HomeSection";
import { MainHero } from "./components/MainHero";
import { NearbySpotList, normalizeMapType } from "./components/NearbySpotList";
import { QuickActions } from "./components/QuickActions";

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
    if (checkInState.shouldOpen) setCheckInOpen(true);
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
          const region = [place.region, place.city, place.district].filter(Boolean).slice(0, 2).join(" ");
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
    await Promise.all([nearby.refetch(), community.refetch(), upcoming.refetch(), ongoing.refetch()]);
  };

  const nearestItems = useMemo(
    () => [...nearby.items].sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99)).slice(0, 5),
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
            refreshing={nearby.isRefetching || community.isRefetching || upcoming.isRefetching || ongoing.isRefetching}
            onRefresh={refreshAll}
          />
        }
      >
        <MainHero
          nickname={me?.nickname}
          isLocating={isLocating}
          locationLabel={locationLabel}
          hallabong={me?.hallabong}
          totalSteps={me?.totalSteps}
        />

        <QuickActions
          actions={[
            { label: "지도", onPress: () => navigation.navigate("Map") },
            { label: "상점", onPress: () => navigation.navigate("Shop") },
            { label: "커뮤니티", onPress: () => navigation.navigate("Community") },
            { label: "챌린지", onPress: () => navigation.navigate("Challenge") },
            { label: "마이페이지", onPress: () => navigation.navigate("MyPage") },
          ]}
        />

        <HomeSection
          title="주변 스팟"
          meta="반경 3km"
          description={isLocating ? "위치를 잡는 동안 기본 제주 중심 좌표로 불러와요." : `${locationLabel} 주변 추천입니다.`}
        >
          <NearbySpotList
            isLoading={nearby.isLoading}
            items={nearestItems}
            onPressItem={(item) =>
              navigation.navigate("Map", {
                focusId: item.id,
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                type: normalizeMapType(item.type),
                filter: normalizeMapType(item.type),
              })
            }
          />
        </HomeSection>

        <HomeSection title="추천 챌린지" linkLabel="전체 보기" onPressLink={() => navigation.navigate("Challenge")}>
          <FeaturedChallenge
            challenge={heroChallenge}
            onPressDetail={(challenge) => navigation.navigate("ChallengeDetail", { challenge })}
            onPressMap={() => navigation.navigate("Map", { filter: "CHALLENGE" })}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg[50] },
  content: { padding: 20, paddingBottom: 90 },
});

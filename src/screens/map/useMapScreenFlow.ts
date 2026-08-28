import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "src/components/ui/AppAlert";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import MapView, { type Region } from "react-native-maps";
import type { RootStackParamList } from "src/app/navigation/types";
import { spotsApi, type SpotCategory } from "src/api/spotsApi";
import {
  useLoadCompletedChallenges,
  useLoadOngoingChallenges,
  useLoadUpcomingChallenges,
} from "src/features/challenges/useChallengeQueries";
import { haversineKm, useNearbySpots } from "src/features/main/useNearbySpots";
import { getCurrentPositionWithFallback, getLocationErrorMessage, joinUniqueParts } from "src/utils/lib/location";
import { RADIUS_OPTIONS } from "./components/MapHud";
import { normalizeType, pickDominantType } from "./mapUtils";
import type { ClusteredMarker, MapMarkerItem } from "./types";

type Navigation = NativeStackNavigationProp<RootStackParamList, "Map">;
type Params = RootStackParamList["Map"];

export const DEFAULT_REGION: Region = {
  latitude: 33.4996,
  longitude: 126.5312,
  // 홈 지도(약 100m)보다 조금 넓은 약 300m 시야로 시작한다.
  latitudeDelta: 0.0054,
  longitudeDelta: 0.0084,
};

const MAP_VIEW_DELTAS = {
  latitudeDelta: DEFAULT_REGION.latitudeDelta,
  longitudeDelta: DEFAULT_REGION.longitudeDelta,
};

// 지도를 드래그할 때마다 정확한 좌표로 근처 스팟을 다시 조회하면 팬 제스처가 끝날
// 때마다(때론 애니메이션 도중에도) 매번 새 네트워크 요청 + 마커 재계산이 발생해
// 지도가 버벅이거나 멈춘 것처럼 보인다. 검색 중심을 이 거리 이상 벗어났을 때만
// 다시 조회하도록 완충한다.
const FETCH_REFRESH_DISTANCE_KM = 0.3;

export function useMapScreenFlow(navigation: Navigation, params: Params) {
  const mapRef = useRef<MapView | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [radiusKm, setRadiusKm] = useState<(typeof RADIUS_OPTIONS)[number]>(1);
  const [category, setCategory] = useState<SpotCategory | null>(null);
  const [searchText, setSearchText] = useState("");
  const [pendingFocusId, setPendingFocusId] = useState<string | number | null>(null);
  const [isConfirmingLocation, setIsConfirmingLocation] = useState(false);
  const pickMode = params?.pickMode === true;
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);
  const [fetchCenter, setFetchCenter] = useState<{ latitude: number; longitude: number } | null>({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });

  const nearby = useNearbySpots(fetchCenter?.latitude, fetchCenter?.longitude, radiusKm, category);
  const ongoing = useLoadOngoingChallenges();
  const upcoming = useLoadUpcomingChallenges();
  const completed = useLoadCompletedChallenges();

  const ongoingIds = useMemo(
    () => new Set((ongoing.data ?? []).map((item) => String(item.id))),
    [ongoing.data]
  );
  const completedIds = useMemo(
    () =>
      new Set(
        (completed.data?.pages ?? []).flatMap((page) => page.items.map((item: { id: string | number }) => String(item.id)))
      ),
    [completed.data]
  );
  const search = useQuery<MapMarkerItem[], Error>({
    queryKey: ["mapSearch", searchText.trim()],
    enabled: searchText.trim().length >= 2,
    queryFn: async () => {
      const response = await spotsApi.search(searchText.trim());
      const list = response.data?.data ?? [];
      return list.map((item) => ({
        id: item.id,
        name: item.name,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        likeCount: 0,
        type: normalizeType(item.type),
        category: item.category,
      }));
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    const loadLocation = async () => {
      try {
        setIsLocating(true);
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") return;

        const current = await getCurrentPositionWithFallback();
        setCurrentLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          accuracy: current.coords.accuracy ?? null,
        });
        const nextRegion: Region = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          ...MAP_VIEW_DELTAS,
        };
        setRegion(nextRegion);
        setFetchCenter({ latitude: nextRegion.latitude, longitude: nextRegion.longitude });
        mapRef.current?.animateToRegion(nextRegion, 500);
      } finally {
        setIsLocating(false);
      }
    };

    void loadLocation();
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let mounted = true;

    const watchLocation = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
          timeInterval: 5_000,
        },
        (location) => {
          if (!mounted) return;
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? null,
          });
        },
      );
    };

    void watchLocation();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  const baseMarkers = useMemo<MapMarkerItem[]>(
    () => (searchText.trim().length >= 2 ? search.data ?? [] : nearby.items),
    [nearby.items, search.data, searchText],
  );

  const filteredMarkers = useMemo(() => {
    const normalized = baseMarkers.map((item) => {
      // 표시용 거리는 항상 실제 GPS 위치(currentLocation) 기준으로 다시 계산한다.
      // nearby.items의 distanceKm은 검색 반경 조회 기준점(fetchCenter, 지도를 크게
      // 패닝하기 전엔 갱신 안 됨)으로 계산돼 있어서, 홈 화면(실제 위치 기준)에서 보던
      // 거리랑 지도 화면에서 크게 달라 보이는 원인이 된다.
      const distanceKm = currentLocation
        ? haversineKm(
            currentLocation.latitude,
            currentLocation.longitude,
            Number(item.latitude),
            Number(item.longitude),
          )
        : (item.distanceKm ?? null);

      return { ...item, type: normalizeType(item.type), distanceKm };
    });

    // nearby 목록은 서버에서 이미 category로 필터링돼서 내려오지만(재필터는 no-op),
    // 검색 결과(search.data)는 서버 필터링이 없어서 여기서 클라이언트단으로 걸러야 한다.
    if (!category) return normalized;
    return normalized.filter((item) => item.category === category);
  }, [category, baseMarkers, currentLocation]);

  const selectedItem = useMemo(() => {
    return filteredMarkers.find((item) => String(item.id) === String(selectedId)) ?? null;
  }, [filteredMarkers, selectedId]);

  const clusteredMarkers = useMemo(() => {
    if (searchText.trim().length >= 2 || region.latitudeDelta < 0.018) {
      return filteredMarkers.map((item) => ({ kind: "item", item }) as ClusteredMarker);
    }

    const latBucket = Math.max(region.latitudeDelta / 6, 0.004);
    const lngBucket = Math.max(region.longitudeDelta / 6, 0.004);
    const groups = new Map<string, MapMarkerItem[]>();

    filteredMarkers.forEach((item) => {
      const latKey = Math.round(Number(item.latitude) / latBucket);
      const lngKey = Math.round(Number(item.longitude) / lngBucket);
      const key = `${latKey}:${lngKey}`;
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });

    return [...groups.entries()].map(([key, items]) => {
      if (items.length === 1) return { kind: "item", item: items[0] } as ClusteredMarker;

      const latitude = items.reduce((sum, item) => sum + Number(item.latitude), 0) / items.length;
      const longitude = items.reduce((sum, item) => sum + Number(item.longitude), 0) / items.length;

      return {
        kind: "cluster",
        id: `cluster:${key}`,
        latitude,
        longitude,
        count: items.length,
        dominantType: pickDominantType(items),
        items,
      } as ClusteredMarker;
    });
  }, [filteredMarkers, region.latitudeDelta, region.longitudeDelta, searchText]);

  useEffect(() => {
    if (selectedId == null) return;
    if (nearby.isFetching || search.isFetching) return;
    const exists = filteredMarkers.some((item) => String(item.id) === String(selectedId));
    if (!exists && pendingFocusId == null) setSelectedId(null);
  }, [filteredMarkers, pendingFocusId, selectedId, nearby.isFetching, search.isFetching]);

  useEffect(() => {
    if (pendingFocusId == null) return;
    const focused = filteredMarkers.find((item) => String(item.id) === String(pendingFocusId));
    if (!focused) return;

    setSelectedId(focused.id);
    setPendingFocusId(null);
    setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: Number(focused.latitude),
          longitude: Number(focused.longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        350,
      );
    }, 50);
  }, [filteredMarkers, pendingFocusId]);

  useEffect(() => {
    if (!params) return;
    if (params.latitude != null && params.longitude != null) {
      const focusedRegion: Region = {
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(focusedRegion);
      setTimeout(() => {
        mapRef.current?.animateToRegion(focusedRegion, 350);
      }, 50);
    }
    if (params.focusId != null) {
      setPendingFocusId(params.focusId);
      setSelectedId(params.focusId);
    }
  }, [params]);

  const recenter = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("위치 권한 필요", "현재 위치로 이동하려면 위치 권한이 필요해요.");
        return;
      }

      const current = await getCurrentPositionWithFallback();
      setCurrentLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy ?? null,
      });
      const nextRegion: Region = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        ...MAP_VIEW_DELTAS,
      };
      setRegion(nextRegion);
      setFetchCenter({ latitude: nextRegion.latitude, longitude: nextRegion.longitude });
      mapRef.current?.animateToRegion(nextRegion, 500);
    } catch (error) {
      Alert.alert("위치 확인 실패", getLocationErrorMessage(error));
    }
  };

  const handleRegionChangeComplete = (nextRegion: Region) => {
    setRegion(nextRegion);
    setFetchCenter((prev) => {
      if (
        prev &&
        haversineKm(prev.latitude, prev.longitude, nextRegion.latitude, nextRegion.longitude) <
          FETCH_REFRESH_DISTANCE_KM
      ) {
        return prev;
      }
      return { latitude: nextRegion.latitude, longitude: nextRegion.longitude };
    });
  };

  const handleRadiusChange = (radius: (typeof RADIUS_OPTIONS)[number]) => {
    setRadiusKm(radius);
  };

  const handleCategoryChange = (next: SpotCategory | null) => {
    setCategory(next);
  };

  const handleMarkerPress = (id: string | number) => {
    setSelectedId(id);
    const item = filteredMarkers.find((entry) => String(entry.id) === String(id));
    if (!item) return;

    mapRef.current?.animateToRegion(
      {
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300,
    );
  };

  const handleClusterPress = (cluster: Extract<ClusteredMarker, { kind: "cluster" }>) => {
    const nextRegion: Region = {
      latitude: cluster.latitude,
      longitude: cluster.longitude,
      latitudeDelta: Math.max(region.latitudeDelta / 2, 0.01),
      longitudeDelta: Math.max(region.longitudeDelta / 2, 0.01),
    };
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 280);
  };

  const handleOpenSelected = () => {
    if (!selectedItem) return;

    if (selectedItem.type === "POST") {
      navigation.navigate("PostDetail", { postId: Number(selectedItem.id) });
      return;
    }

    if (selectedItem.type === "CHALLENGE") {
      const ongoingChallenge = ongoing.data?.find((item) => String(item.id) === String(selectedItem.id));
      if (ongoingChallenge) {
        navigation.navigate("ChallengeComplete", { challenge: ongoingChallenge });
        return;
      }

      const upcomingChallenge = upcoming.data?.find((item) => String(item.id) === String(selectedItem.id));
      if (upcomingChallenge) {
        navigation.navigate("ChallengeDetail", { challenge: upcomingChallenge });
        return;
      }

      // 챌린지 목록에서 못 찾은 경우(id 매칭 실패 등)에도 뒤로가기가 없는 탭 화면으로
      // 보내지 않도록, 항상 뒤로가기가 있는 스팟 상세로 대신 보낸다.
      navigation.navigate("SpotDetail", { spotId: Number(selectedItem.id) });
      return;
    }

    navigation.navigate("SpotDetail", { spotId: Number(selectedItem.id) });
  };

  const handleFocusItem = (item: MapMarkerItem) => {
    setSelectedId(item.id);
    mapRef.current?.animateToRegion(
      {
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300,
    );
  };

  const handleWriteSpot = () => {
    const base =
      selectedItem != null
        ? {
            name: selectedItem.name,
            latitude: Number(selectedItem.latitude),
            longitude: Number(selectedItem.longitude),
            sourceType: normalizeType(selectedItem.type),
          }
        : {
            name: "",
            latitude: Number(region.latitude),
            longitude: Number(region.longitude),
          };

    navigation.navigate("PostWrite", { initialLocation: base, openedFromMap: true });
  };

  const handleConfirmLocation = async () => {
    try {
      setIsConfirmingLocation(true);
      const places = await Location.reverseGeocodeAsync({
        latitude: region.latitude,
        longitude: region.longitude,
      });
      const place = places[0];
      const name =
        joinUniqueParts([place?.region, place?.district, place?.street, place?.name]) ||
        `제주 스팟 ${region.latitude.toFixed(3)}, ${region.longitude.toFixed(3)}`;

      if (navigation.canGoBack()) navigation.goBack();
      navigation.navigate("PostWrite", {
        initialLocation: {
          name,
          latitude: region.latitude,
          longitude: region.longitude,
        },
      });
    } catch {
      Alert.alert("위치 확인 실패", "선택한 위치를 가져오지 못했어요.");
    } finally {
      setIsConfirmingLocation(false);
    }
  };

  return {
    mapRef,
    region,
    selectedId,
    selectedItem,
    currentLocation,
    isLocating,
    radiusKm,
    category,
    searchText,
    nearby,
    search,
    filteredMarkers,
    clusteredMarkers,
    ongoingIds,
    completedIds,
    setRegion,
    handleRegionChangeComplete,
    setSearchText,
    handleRadiusChange,
    handleCategoryChange,
    recenter,
    handleMarkerPress,
    handleClusterPress,
    handleOpenSelected,
    handleFocusItem,
    handleWriteSpot,
    pickMode,
    isConfirmingLocation,
    handleConfirmLocation,
  };
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import MapView, { type Region } from "react-native-maps";
import type { RootStackParamList } from "src/app/navigation/types";
import { spotsApi } from "src/api/spotsApi";
import { useLoadOngoingChallenges } from "src/features/challenges/useChallengeQueries";
import { useNearbySpots } from "src/features/main/useNearbySpots";
import { usePathStats } from "src/features/main/usePathStats";
import { useSaveSteps } from "src/features/steps/useSaveSteps";
import { RADIUS_OPTIONS } from "./components/MapHud";
import { normalizeType, pickDominantType } from "./mapUtils";
import type { ClusteredMarker, MapFilter, MapMarkerItem } from "./types";

type Navigation = NativeStackNavigationProp<RootStackParamList, "Map">;
type Params = RootStackParamList["Map"];

export const DEFAULT_REGION: Region = {
  latitude: 33.4996,
  longitude: 126.5312,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export function useMapScreenFlow(navigation: Navigation, params: Params) {
  const mapRef = useRef<MapView | null>(null);
  const cardListRef = useRef<FlatList<MapMarkerItem> | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [radiusKm, setRadiusKm] = useState<(typeof RADIUS_OPTIONS)[number]>(3);
  const [activeFilter, setActiveFilter] = useState<MapFilter>(params?.filter ?? "ALL");
  const [searchText, setSearchText] = useState("");
  const [pendingFocusId, setPendingFocusId] = useState<string | number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);

  const pathStats = usePathStats(
    currentLocation?.latitude ?? null,
    currentLocation?.longitude ?? null,
    currentLocation?.accuracy ?? null,
  );
  useSaveSteps(pathStats.steps, { enabled: pathStats.steps > 0 });

  const nearby = useNearbySpots(region.latitude, region.longitude, radiusKm);
  const ongoing = useLoadOngoingChallenges();
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

        const current = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          accuracy: current.coords.accuracy ?? null,
        });
        const nextRegion: Region = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        };
        setRegion(nextRegion);
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
    const normalized = baseMarkers.map((item) => ({
      ...item,
      type: normalizeType(item.type),
    }));

    if (activeFilter === "ALL") return normalized;
    return normalized.filter((item) => item.type === activeFilter);
  }, [activeFilter, baseMarkers]);

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
    const exists = filteredMarkers.some((item) => String(item.id) === String(selectedId));
    if (!exists && pendingFocusId == null) setSelectedId(null);
  }, [filteredMarkers, pendingFocusId, selectedId]);

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
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        350,
      );
    }, 50);
  }, [filteredMarkers, pendingFocusId]);

  useEffect(() => {
    if (!params) return;
    if (params.filter) setActiveFilter(params.filter);
    if (params.latitude != null && params.longitude != null) {
      const focusedRegion: Region = {
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
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

  useEffect(() => {
    if (!selectedItem) return;
    const index = filteredMarkers.findIndex((item) => String(item.id) === String(selectedItem.id));
    if (index >= 0) {
      cardListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  }, [filteredMarkers, selectedItem]);

  const recenter = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("위치 권한 필요", "현재 위치로 이동하려면 위치 권한이 필요해요.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      const nextRegion: Region = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 500);
    } catch {
      Alert.alert("위치 확인 실패", "현재 위치를 다시 가져오지 못했어요.");
    }
  };

  const handleMarkerPress = (id: string | number) => {
    setSelectedId(id);
    const item = filteredMarkers.find((entry) => String(entry.id) === String(id));
    if (!item) return;

    mapRef.current?.animateToRegion(
      {
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
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
      const challenge = ongoing.data?.find((item) => String(item.id) === String(selectedItem.id));
      if (challenge) navigation.navigate("ChallengeDetail", { challenge });
      else navigation.navigate("Challenge");
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
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
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

  return {
    mapRef,
    cardListRef,
    region,
    selectedId,
    selectedItem,
    currentLocation,
    isLocating,
    radiusKm,
    activeFilter,
    searchText,
    pathStats,
    nearby,
    search,
    filteredMarkers,
    clusteredMarkers,
    setRegion,
    setSearchText,
    setActiveFilter,
    setRadiusKm,
    recenter,
    handleMarkerPress,
    handleClusterPress,
    handleOpenSelected,
    handleFocusItem,
    handleWriteSpot,
  };
}

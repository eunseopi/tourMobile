import { useEffect, useMemo, useRef, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import MapView, { Marker, type Region } from "react-native-maps";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { spotsApi } from "src/api/spotsApi";
import { useLoadOngoingChallenges } from "src/features/challenges/useChallengeQueries";
import { useNearbySpots } from "src/features/main/useNearbySpots";
import { usePathStats } from "src/features/main/usePathStats";
import { useSaveSteps } from "src/features/steps/useSaveSteps";

type Props = NativeStackScreenProps<RootStackParamList, "Map">;
type MapFilter = "ALL" | "SPOT" | "POST" | "CHALLENGE";
type MapMarkerItem = {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  likeCount: number;
  likedByMe?: boolean;
  imageUrls?: string[];
  type?: "POST" | "SPOT" | "CHALLENGE" | string;
  challengeOngoing?: boolean;
  distanceKm?: number | null;
};
type ClusteredMarker =
  | { kind: "item"; item: MapMarkerItem }
  | {
      kind: "cluster";
      id: string;
      latitude: number;
      longitude: number;
      count: number;
      dominantType: "POST" | "SPOT" | "CHALLENGE";
      items: MapMarkerItem[];
    };

const DEFAULT_REGION: Region = {
  latitude: 33.4996,
  longitude: 126.5312,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const FILTERS: Array<{ key: MapFilter; label: string }> = [
  { key: "ALL", label: "전체" },
  { key: "SPOT", label: "스팟" },
  { key: "POST", label: "커뮤니티" },
  { key: "CHALLENGE", label: "챌린지" },
];

const RADIUS_OPTIONS = [1, 3, 5] as const;

export default function MapScreen({ navigation, route }: Props) {
  const params = route.params;
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
    currentLocation?.accuracy ?? null
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
      } catch {
        // 기본 제주 좌표 유지
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
        }
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
    [nearby.items, search.data, searchText]
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
      if (items.length === 1) {
        return { kind: "item", item: items[0] } as ClusteredMarker;
      }

      const latitude =
        items.reduce((sum, item) => sum + Number(item.latitude), 0) / items.length;
      const longitude =
        items.reduce((sum, item) => sum + Number(item.longitude), 0) / items.length;
      const dominantType = pickDominantType(items);

      return {
        kind: "cluster",
        id: `cluster:${key}`,
        latitude,
        longitude,
        count: items.length,
        dominantType,
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
        350
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
      300
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
      if (challenge) {
        navigation.navigate("ChallengeDetail", { challenge });
      } else {
        navigation.navigate("Challenge");
      }
      return;
    }

    navigation.navigate("SpotDetail", { spotId: Number(selectedItem.id) });
  };

  const handleSearchFocusItem = (item: MapMarkerItem) => {
    setSelectedId(item.id);
    mapRef.current?.animateToRegion(
      {
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      300
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

    navigation.navigate("PostWrite", {
      initialLocation: base,
      openedFromMap: true,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {clusteredMarkers.map((entry) =>
          entry.kind === "item" ? (
            <Marker
              key={String(entry.item.id)}
              coordinate={{
                latitude: Number(entry.item.latitude),
                longitude: Number(entry.item.longitude),
              }}
              title={entry.item.name}
              description={markerDescription(entry.item.type, entry.item.likeCount)}
              onPress={() => handleMarkerPress(entry.item.id)}
            >
              <View style={styles.markerWrap}>
                <View
                  style={[
                    styles.markerBubble,
                    { backgroundColor: markerColor(entry.item.type) },
                    String(selectedId) === String(entry.item.id) && styles.markerBubbleSelected,
                  ]}
                >
                  <Text style={styles.markerIcon}>{markerIcon(entry.item.type)}</Text>
                </View>
                <View
                  style={[
                    styles.markerStem,
                    { backgroundColor: markerColor(entry.item.type) },
                    String(selectedId) === String(entry.item.id) && styles.markerStemSelected,
                  ]}
                />
              </View>
            </Marker>
          ) : (
            <Marker
              key={entry.id}
              coordinate={{ latitude: entry.latitude, longitude: entry.longitude }}
              onPress={() => handleClusterPress(entry)}
            >
              <View style={styles.clusterWrap}>
                <View
                  style={[
                    styles.clusterBubble,
                    { backgroundColor: markerColor(entry.dominantType) },
                  ]}
                >
                  <Text style={styles.clusterCount}>{entry.count}</Text>
                </View>
              </View>
            </Marker>
          )
        )}
      </MapView>

      {!selectedItem && filteredMarkers.length > 0 ? (
        <View style={styles.previewRail}>
          {filteredMarkers.slice(0, 4).map((item) => (
            <Pressable
              key={String(item.id)}
              style={styles.previewChip}
              onPress={() => handleSearchFocusItem(item)}
            >
              <Text style={styles.previewChipType}>{typeLabel(item.type)}</Text>
              <Text style={styles.previewChipTitle} numberOfLines={1}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {filteredMarkers.length > 0 ? (
        <View style={styles.cardRail}>
          <FlatList
            ref={cardListRef}
            data={filteredMarkers.slice(0, 12)}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardRailContent}
            getItemLayout={(_, index) => ({ length: 220, offset: 220 * index, index })}
            renderItem={({ item }) => {
              const active = String(item.id) === String(selectedId);
              return (
                <Pressable
                  style={[styles.railCard, active && styles.railCardActive]}
                  onPress={() => handleSearchFocusItem(item)}
                >
                  <Text style={styles.railCardEyebrow}>{typeLabel(item.type)}</Text>
                  <Text style={styles.railCardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.railCardMeta} numberOfLines={1}>
                    {formatDistance(item.distanceKm)} · 좋아요 {item.likeCount ?? 0}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      ) : null}

      <View style={styles.topOverlay}>
        <View style={styles.headerPanel}>
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>지도 탐색</Text>
            <Text style={styles.headerSubtitle}>
              {isLocating
                ? "현재 위치를 확인하는 중..."
                : `${filteredMarkers.length}개 표시 · 오늘 이동 ${pathStats.formatSteps()}`}
            </Text>
          </View>

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="스팟이나 장소 이름 검색"
            placeholderTextColor="#9a9a9a"
            style={styles.searchInput}
          />

          <View style={styles.filterRow}>
            {FILTERS.map((item) => {
              const active = item.key === activeFilter;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setActiveFilter(item.key)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((value) => {
              const active = value === radiusKm;
              return (
                <Pressable
                  key={value}
                  style={[styles.radiusChip, active && styles.radiusChipActive]}
                  onPress={() => setRadiusKm(value)}
                >
                  <Text style={[styles.radiusChipText, active && styles.radiusChipTextActive]}>
                    {value}km
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.recenterButton} onPress={recenter}>
          <Text style={styles.recenterButtonText}>현재 위치</Text>
        </Pressable>
      </View>

      <View style={styles.bottomSheet}>
        {nearby.isLoading || search.isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color="#ff8b4c" />
            <Text style={styles.centerText}>지도를 준비하는 중...</Text>
          </View>
        ) : selectedItem ? (
          <>
            <View style={styles.cardTopRow}>
              <View style={styles.cardTextBox}>
                <Text style={styles.cardEyebrow}>{typeLabel(selectedItem.type)}</Text>
                <Text style={styles.cardTitle}>{selectedItem.name}</Text>
                <Text style={styles.cardMeta}>
                  {formatDistance(selectedItem.distanceKm)} · 좋아요 {selectedItem.likeCount ?? 0}
                </Text>
              </View>
              {selectedItem.imageUrls?.[0] ? (
                <Image source={{ uri: selectedItem.imageUrls[0] }} style={styles.cardThumb} />
              ) : (
                <View style={[styles.cardThumb, styles.cardThumbFallback]}>
                  <Text style={styles.cardThumbFallbackText}>{markerIcon(selectedItem.type)}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <Pressable style={styles.primaryButton} onPress={handleOpenSelected}>
                <Text style={styles.primaryButtonText}>열어보기</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={handleWriteSpot}>
                <Text style={styles.secondaryButtonText}>여기서 스팟 남기기</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Main")}>
                <Text style={styles.secondaryButtonText}>홈으로</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>마커를 눌러보세요</Text>
            <Text style={styles.cardMeta}>
              커뮤니티 글, 스팟, 챌린지를 지도에서 한 번에 볼 수 있게 첫 버전을 붙여뒀어요.
            </Text>

            <View style={styles.actionRow}>
              <Pressable style={styles.primaryButton} onPress={handleWriteSpot}>
                <Text style={styles.primaryButtonText}>현재 위치로 스팟 남기기</Text>
              </Pressable>
            </View>

            {searchText.trim().length >= 2 && filteredMarkers.length > 0 ? (
              <View style={styles.searchResultList}>
                {filteredMarkers.slice(0, 3).map((item) => (
                  <Pressable
                    key={String(item.id)}
                    style={styles.searchResultItem}
                    onPress={() => handleSearchFocusItem(item)}
                  >
                    <Text style={styles.searchResultTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.searchResultMeta}>{typeLabel(item.type)}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Community")}>
                <Text style={styles.primaryButtonText}>커뮤니티 보기</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Challenge")}>
                <Text style={styles.secondaryButtonText}>챌린지 보기</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function markerColor(type?: string) {
  switch (type) {
    case "CHALLENGE":
      return "#ff8b4c";
    case "POST":
      return "#5b8def";
    case "SPOT":
      return "#37b26c";
    default:
      return "#9c9c9c";
  }
}

function markerDescription(type?: string, likeCount?: number) {
  return `${typeLabel(type)} · 좋아요 ${likeCount ?? 0}`;
}

function typeLabel(type?: string) {
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

function normalizeType(type?: string): "POST" | "SPOT" | "CHALLENGE" {
  if (type === "POST" || type === "SPOT" || type === "CHALLENGE") return type;
  return "SPOT";
}

function markerIcon(type?: string) {
  switch (type) {
    case "CHALLENGE":
      return "C";
    case "POST":
      return "P";
    case "SPOT":
      return "S";
    default:
      return "•";
  }
}

function pickDominantType(items: MapMarkerItem[]): "POST" | "SPOT" | "CHALLENGE" {
  const score = { POST: 0, SPOT: 0, CHALLENGE: 0 };
  items.forEach((item) => {
    const type = normalizeType(item.type);
    score[type] += 1;
  });

  if (score.CHALLENGE >= score.POST && score.CHALLENGE >= score.SPOT) return "CHALLENGE";
  if (score.POST >= score.SPOT) return "POST";
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
  map: {
    flex: 1,
  },
  topOverlay: {
    position: "absolute",
    top: 18,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerPanel: {
    flex: 1,
    gap: 10,
  },
  headerCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1f1f1f",
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#666",
  },
  searchInput: {
    minHeight: 46,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
    color: "#222",
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  filterChipActive: {
    backgroundColor: "#1f1f1f",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#555",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  radiusRow: {
    flexDirection: "row",
    gap: 8,
  },
  radiusChip: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  radiusChipActive: {
    backgroundColor: "#ff8b4c",
  },
  radiusChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#666",
  },
  radiusChipTextActive: {
    color: "#fff",
  },
  recenterButton: {
    minWidth: 82,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31,31,31,0.92)",
  },
  recenterButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  bottomSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 176,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.97)",
  },
  previewRail: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 304,
    flexDirection: "row",
    gap: 8,
  },
  previewChip: {
    flex: 1,
    minHeight: 58,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  previewChipType: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  previewChipTitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#222",
  },
  markerWrap: {
    alignItems: "center",
  },
  clusterWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerBubbleSelected: {
    transform: [{ scale: 1.12 }],
  },
  markerIcon: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  markerStem: {
    width: 4,
    height: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: -2,
  },
  markerStemSelected: {
    height: 12,
  },
  clusterBubble: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  clusterCount: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  cardRail: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 198,
  },
  cardRailContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  railCard: {
    width: 210,
    minHeight: 84,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  railCardActive: {
    backgroundColor: "#fff4ec",
    borderWidth: 1,
    borderColor: "#ffbe96",
  },
  railCardEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  railCardTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "900",
    color: "#222",
  },
  railCardMeta: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    marginTop: 10,
    fontSize: 13,
    color: "#777",
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  cardTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "900",
    color: "#1f1f1f",
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
  cardThumb: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#eee",
  },
  cardThumbFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4ec",
  },
  cardThumbFallbackText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ff8b4c",
  },
  searchResultList: {
    marginTop: 14,
    gap: 8,
  },
  searchResultItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#222",
  },
  searchResultMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#777",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f1f1",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#444",
  },
});

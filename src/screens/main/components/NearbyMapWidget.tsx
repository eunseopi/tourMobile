import { useEffect, useMemo, useRef, useState } from "react";
import { Image } from "expo-image";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import type { NearbySpot } from "src/api/spotsApi";
import { FadeSlideIn } from "src/components/ui/FadeSlideIn";
import { PressableScale } from "src/components/ui/PressableScale";
import { colors, shadow, typography } from "src/design/theme";
import {
  useLoadCompletedChallenges,
  useLoadOngoingChallenges,
} from "src/features/challenges/useChallengeQueries";
import { formatDistance, getChallengeStatus, markerColor } from "src/screens/map/mapUtils";
import { UserLocationMarker } from "src/screens/map/components/UserLocationMarker";

export type NearbyMapItem = NearbySpot & { distanceKm: number | null };

// 홈 미니맵은 현재 위치를 중심으로 반경 약 300m가 한 화면에 들어오게 한다.
// 전체 지역 탐색은 별도 지도 화면에서 한다.
const HOME_CLOSE_REGION_DELTA = {
  latitudeDelta: 0.0054,
  longitudeDelta: 0.0065,
};
const MINI_MAP_RADIUS_KM = 0.3;

type Props = {
  latitude: number;
  longitude: number;
  recenterKey: number;
  items: NearbyMapItem[];
  isLoading: boolean;
  isStarting: boolean;
  startingId: string | number | null;
  onStartChallenge: (item: NearbyMapItem) => void;
};

export function NearbyMapWidget({
  latitude,
  longitude,
  recenterKey,
  items,
  isLoading,
  isStarting,
  startingId,
  onStartChallenge,
}: Props) {
  const mapRef = useRef<MapView | null>(null);
  const [selected, setSelected] = useState<NearbyMapItem | null>(null);
  const ongoing = useLoadOngoingChallenges();
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

  const markers = useMemo(
    () =>
      items.filter(
        (item) =>
          item.type !== "POST" &&
          item.distanceKm != null &&
          item.distanceKm <= MINI_MAP_RADIUS_KM,
      ),
    [items]
  );

  const isThisStarting = isStarting && selected != null && String(startingId) === String(selected.id);

  const locationRegion: Region = useMemo(
    () => ({ latitude, longitude, ...HOME_CLOSE_REGION_DELTA }),
    [latitude, longitude]
  );

  useEffect(() => {
    mapRef.current?.animateToRegion(locationRegion, 500);
  }, [locationRegion, recenterKey]);

  return (
    <View>
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={locationRegion}
          scrollEnabled
          zoomEnabled
          pitchEnabled={false}
          rotateEnabled={false}
          onPress={() => setSelected(null)}
        >
          <UserLocationMarker latitude={latitude} longitude={longitude} />
          {markers.map((item) => (
            <Marker
              key={String(item.id)}
              coordinate={{ latitude: Number(item.latitude), longitude: Number(item.longitude) }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={(event) => {
                event.stopPropagation();
                setSelected(item);
              }}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: markerColor(getChallengeStatus(item, ongoingIds, completedIds)) },
                  String(selected?.id) === String(item.id) && styles.dotSelected,
                ]}
              />
            </Marker>
          ))}
        </MapView>

        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary[400]} />
          </View>
        ) : null}
      </View>

      {selected ? (
        <FadeSlideIn key={String(selected.id)} style={styles.detailCard}>
          {selected.imageUrls?.[0] ? (
            <Image
              source={{ uri: selected.imageUrls[0] }}
              style={styles.detailImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View style={[styles.detailImage, styles.detailImagePlaceholder]} />
          )}

          <View style={styles.detailBody}>
            {(() => {
              const status = getChallengeStatus(selected, ongoingIds, completedIds);
              const isChallenge = selected.type === "CHALLENGE";
              const label = !isChallenge
                ? "추천 스팟"
                : status === "done"
                  ? "완료된 챌린지"
                  : status === "ongoing"
                    ? "진행중인 챌린지"
                    : "챌린지";
              const tint = status === "done" ? colors.gray[600] : markerColor(status);
              return (
                <View style={[styles.typeTag, { backgroundColor: status === "done" ? colors.gray[100] : colors.primary[50] }]}>
                  <Text style={[styles.typeText, { color: tint }]}>{label}</Text>
                </View>
              );
            })()}
            <Text style={styles.detailTitle} numberOfLines={1}>
              {selected.name}
            </Text>
            {selected.distanceKm != null ? (
              <Text style={styles.detailMeta}>{formatDistance(selected.distanceKm)}</Text>
            ) : null}

            <View style={styles.detailActions}>
              <PressableScale style={styles.secondaryButton} onPress={() => setSelected(null)}>
                <Text style={styles.secondaryButtonText}>돌아가기</Text>
              </PressableScale>
              {selected.type !== "POST" &&
              getChallengeStatus(selected, ongoingIds, completedIds) === "available" ? (
                <PressableScale
                  style={[styles.primaryButton, isThisStarting && styles.primaryButtonDisabled]}
                  disabled={isThisStarting}
                  onPress={() => onStartChallenge(selected)}
                >
                  <Text style={styles.primaryButtonText}>
                    {isThisStarting
                      ? "추가하는 중..."
                      : selected.type === "CHALLENGE"
                        ? "챌린지 시작하기"
                        : "챌린지 추가하기"}
                  </Text>
                </PressableScale>
              ) : null}
            </View>
          </View>
        </FadeSlideIn>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    height: 240,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.gray[100],
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.base[0],
    ...shadow.card,
  },
  dotSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  detailCard: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.bg[50],
  },
  detailImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  detailImagePlaceholder: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  detailBody: { flex: 1, gap: 4 },
  typeTag: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  typeText: { ...typography.caption2, fontSize: 11 },
  detailTitle: { ...typography.body3, color: colors.gray[800] },
  detailMeta: { ...typography.caption2, color: colors.gray[600] },
  detailActions: { flexDirection: "row", gap: 8, marginTop: 6 },
  secondaryButton: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  secondaryButtonText: { ...typography.caption1, color: colors.gray[700] },
  primaryButton: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  primaryButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  primaryButtonText: { ...typography.caption1, color: colors.base[0] },
});

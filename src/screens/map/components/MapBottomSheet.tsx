import type { StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import ChallengeOngoingMarker from "src/assets/challengeOngoingMarker.svg";
import IsDoneMarker from "src/assets/isDoneMarker.svg";
import SpotMarker from "src/assets/spot.svg";
import { FadeSlideIn } from "src/components/ui/FadeSlideIn";
import { PressableScale } from "src/components/ui/PressableScale";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";
import type { MapMarkerItem } from "../types";
import { formatDistance, getChallengeStatus, typeLabel } from "../mapUtils";

function ThumbFallbackIcon({
  item,
  ongoingIds,
  completedIds,
}: {
  item: MapMarkerItem;
  ongoingIds: Set<string>;
  completedIds: Set<string>;
}) {
  const status = getChallengeStatus(item, ongoingIds, completedIds);
  if (status === "done") return <IsDoneMarker width={32} height={33} />;
  if (status === "ongoing") return <ChallengeOngoingMarker width={32} height={33} />;
  return <SpotMarker width={32} height={33} />;
}

type Props = {
  isLoading: boolean;
  selectedItem: MapMarkerItem | null;
  searchText: string;
  filteredMarkers: MapMarkerItem[];
  ongoingIds: Set<string>;
  completedIds: Set<string>;
  onOpenSelected: () => void;
  onWriteSpot: () => void;
  onFocusItem: (item: MapMarkerItem) => void;
  style?: StyleProp<ViewStyle>;
};

export function MapBottomSheet({
  isLoading,
  selectedItem,
  searchText,
  filteredMarkers,
  ongoingIds,
  completedIds,
  onOpenSelected,
  onWriteSpot,
  onFocusItem,
  style,
}: Props) {
  return (
    <View style={[styles.bottomSheet, style]}>
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.primary[400]} />
          <Text style={styles.centerText}>지도를 준비하는 중...</Text>
        </View>
      ) : selectedItem ? (
        <FadeSlideIn key={String(selectedItem.id)}>
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
                <ThumbFallbackIcon item={selectedItem} ongoingIds={ongoingIds} completedIds={completedIds} />
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            <PressableScale style={styles.primaryButton} onPress={onOpenSelected}>
              <Text style={styles.primaryButtonText}>열어보기</Text>
            </PressableScale>
          </View>
        </FadeSlideIn>
      ) : (
        <>
          <Text style={styles.cardTitle}>마커를 눌러보세요</Text>
          <Text style={styles.cardMeta}>
            커뮤니티 글, 스팟, 챌린지를 지도에서 한 번에 확인할 수 있어요.
          </Text>

          <View style={styles.actionRow}>
            <PressableScale style={styles.primaryButton} onPress={onWriteSpot}>
              <Text style={styles.primaryButtonText}>현재 위치로 스팟 남기기</Text>
            </PressableScale>
          </View>

          {searchText.trim().length >= 2 && filteredMarkers.length > 0 ? (
            <View style={styles.searchResultList}>
              {filteredMarkers.slice(0, 3).map((item) => (
                <Pressable key={String(item.id)} style={styles.searchResultItem} onPress={() => onFocusItem(item)}>
                  <Text style={styles.searchResultTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.searchResultMeta}>{typeLabel(item.type)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 176,
    padding: 9,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.97)",
    ...shadow.card,
  },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerText: { ...typography.caption2, color: colors.gray[600], marginTop: 5 },
  cardEyebrow: { ...typography.caption1, color: colors.primary[400] },
  cardTopRow: { flexDirection: "row", gap: 7, alignItems: "flex-start" },
  cardTextBox: { flex: 1 },
  cardTitle: { ...typography.head3, color: colors.gray[800], marginTop: 4 },
  cardMeta: { ...typography.body4, color: colors.gray[600], marginTop: 4 },
  cardThumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: colors.gray[200] },
  cardThumbFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.primary[50] },
  searchResultList: { marginTop: 7, gap: 4 },
  searchResultItem: {
    minHeight: 44,
    paddingHorizontal: 6,
    borderRadius: 12,
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  searchResultTitle: { ...typography.body3, color: colors.gray[800] },
  searchResultMeta: { ...typography.caption2, color: colors.gray[600], marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 5, marginTop: 9 },
  primaryButton: { ...commonStyles.primaryButton, flex: 1 },
  primaryButtonText: { ...commonStyles.primaryButtonText },
});

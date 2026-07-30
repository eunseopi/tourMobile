import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import ChallengeMarker from "src/assets/challenge.svg";
import IsDoneMarker from "src/assets/isDoneMarker.svg";
import SpotMarker from "src/assets/spot.svg";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";
import type { MapMarkerItem } from "../types";
import { formatDistance, typeLabel } from "../mapUtils";

function ThumbFallbackIcon({ item }: { item: MapMarkerItem }) {
  if (item.type === "CHALLENGE") {
    return item.challengeOngoing === false ? (
      <IsDoneMarker width={32} height={33} />
    ) : (
      <ChallengeMarker width={32} height={33} />
    );
  }
  return <SpotMarker width={32} height={33} />;
}

type Props = {
  isLoading: boolean;
  selectedItem: MapMarkerItem | null;
  searchText: string;
  filteredMarkers: MapMarkerItem[];
  onOpenSelected: () => void;
  onWriteSpot: () => void;
  onGoHome: () => void;
  onGoCommunity: () => void;
  onGoChallenge: () => void;
  onFocusItem: (item: MapMarkerItem) => void;
};

export function MapBottomSheet({
  isLoading,
  selectedItem,
  searchText,
  filteredMarkers,
  onOpenSelected,
  onWriteSpot,
  onGoHome,
  onGoCommunity,
  onGoChallenge,
  onFocusItem,
}: Props) {
  return (
    <View style={styles.bottomSheet}>
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.primary[400]} />
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
                <ThumbFallbackIcon item={selectedItem} />
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={onOpenSelected}>
              <Text style={styles.primaryButtonText}>열어보기</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onWriteSpot}>
              <Text style={styles.secondaryButtonText}>여기서 스팟 남기기</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onGoHome}>
              <Text style={styles.secondaryButtonText}>홈으로</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.cardTitle}>마커를 눌러보세요</Text>
          <Text style={styles.cardMeta}>
            커뮤니티 글, 스팟, 챌린지를 지도에서 한 번에 확인할 수 있어요.
          </Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={onWriteSpot}>
              <Text style={styles.primaryButtonText}>현재 위치로 스팟 남기기</Text>
            </Pressable>
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

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={onGoCommunity}>
              <Text style={styles.primaryButtonText}>커뮤니티 보기</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onGoChallenge}>
              <Text style={styles.secondaryButtonText}>챌린지 보기</Text>
            </Pressable>
          </View>
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
    padding: 18,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.97)",
    ...shadow.card,
  },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerText: { ...typography.caption2, color: colors.gray[500], marginTop: 10 },
  cardEyebrow: { ...typography.caption1, color: colors.primary[400] },
  cardTopRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  cardTextBox: { flex: 1 },
  cardTitle: { ...typography.head3, color: colors.gray[800], marginTop: 8 },
  cardMeta: { ...typography.body4, color: colors.gray[600], marginTop: 8 },
  cardThumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: colors.gray[200] },
  cardThumbFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.primary[50] },
  searchResultList: { marginTop: 14, gap: 8 },
  searchResultItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  searchResultTitle: { ...typography.body3, color: colors.gray[800] },
  searchResultMeta: { ...typography.caption2, color: colors.gray[500], marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  primaryButton: { ...commonStyles.primaryButton, flex: 1 },
  primaryButtonText: { ...commonStyles.primaryButtonText },
  secondaryButton: { ...commonStyles.secondaryButton, flex: 1 },
  secondaryButtonText: { ...commonStyles.secondaryButtonText },
});

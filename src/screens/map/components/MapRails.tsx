import type { RefObject } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";
import type { MapMarkerItem } from "../types";
import { formatDistance, typeLabel } from "../mapUtils";

type PreviewProps = {
  items: MapMarkerItem[];
  selectedItem: MapMarkerItem | null;
  onFocusItem: (item: MapMarkerItem) => void;
};

export function MapPreviewRail({ items, selectedItem, onFocusItem }: PreviewProps) {
  if (selectedItem || items.length === 0) return null;

  return (
    <View style={styles.previewRail}>
      {items.slice(0, 4).map((item) => (
        <Pressable key={String(item.id)} style={styles.previewChip} onPress={() => onFocusItem(item)}>
          <Text style={styles.previewChipType}>{typeLabel(item.type)}</Text>
          <Text style={styles.previewChipTitle} numberOfLines={1}>
            {item.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

type CardProps = {
  items: MapMarkerItem[];
  selectedId: string | number | null;
  listRef: RefObject<FlatList<MapMarkerItem> | null>;
  onFocusItem: (item: MapMarkerItem) => void;
};

export function MapCardRail({ items, selectedId, listRef, onFocusItem }: CardProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.cardRail}>
      <FlatList
        ref={listRef}
        data={items.slice(0, 12)}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardRailContent}
        getItemLayout={(_, index) => ({ length: 220, offset: 220 * index, index })}
        renderItem={({ item }) => {
          const active = String(item.id) === String(selectedId);
          return (
            <Pressable style={[styles.railCard, active && styles.railCardActive]} onPress={() => onFocusItem(item)}>
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
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  previewChipType: { ...typography.caption2, color: colors.primary[400] },
  previewChipTitle: { ...typography.caption1, color: colors.gray[800], marginTop: 6 },
  cardRail: { position: "absolute", left: 0, right: 0, bottom: 198 },
  cardRailContent: { paddingHorizontal: 16, gap: 10 },
  railCard: {
    width: 210,
    minHeight: 84,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.94)",
    ...shadow.card,
  },
  railCardActive: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  railCardEyebrow: { ...typography.caption2, color: colors.primary[400] },
  railCardTitle: { ...typography.body3, color: colors.gray[800], marginTop: 6 },
  railCardMeta: { ...typography.caption2, color: colors.gray[500], marginTop: 8 },
});

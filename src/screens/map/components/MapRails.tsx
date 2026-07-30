import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import type { MapMarkerItem } from "../types";
import { typeLabel } from "../mapUtils";

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

const styles = StyleSheet.create({
  previewRail: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 282,
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
});

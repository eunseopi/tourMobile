import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import type { NearbySpot } from "src/api/spotsApi";
import LocationIcon from "src/assets/Location.svg";
import { SectionState } from "./HomeSection";

type NearbySpotItem = NearbySpot & { distanceKm?: number | null };

type Props = {
  isLoading: boolean;
  items: NearbySpotItem[];
  onPressItem: (item: NearbySpotItem) => void;
};

export function NearbySpotList({ isLoading, items, onPressItem }: Props) {
  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.centerText}>근처 스팟을 찾는 중...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return <SectionState>근처 스팟이 아직 없어요.</SectionState>;
  }

  return (
    <>
      {items.map((item) => (
        <Pressable key={String(item.id)} style={styles.listItem} onPress={() => onPressItem(item)}>
          <View style={styles.listMain}>
            <Text style={styles.listTitle} numberOfLines={1}>{item.name}</Text>
            <View style={styles.listMetaRow}>
              <LocationIcon width={12} height={12} />
              <Text style={styles.listMeta}>
                {spotTypeLabel(item.type)} · {formatDistance(item.distanceKm)}
              </Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{Math.max(0, item.likeCount ?? 0)} ♥</Text>
          </View>
        </Pressable>
      ))}
    </>
  );
}

export function spotTypeLabel(type?: string) {
  switch (type) {
    case "CHALLENGE": return "챌린지";
    case "POST": return "커뮤니티";
    case "SPOT": return "스팟";
    default: return "추천";
  }
}

export function normalizeMapType(type?: string): "SPOT" | "POST" | "CHALLENGE" {
  if (type === "POST" || type === "SPOT" || type === "CHALLENGE") return type;
  return "SPOT";
}

export function formatDistance(distanceKm?: number | null) {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return "거리 정보 없음";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)}km`;
}

const styles = StyleSheet.create({
  centerBox: { paddingVertical: 22, alignItems: "center", justifyContent: "center" },
  centerText: { ...typography.body4, color: colors.gray[500], marginTop: 10 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  listMain: { flex: 1, paddingRight: 12 },
  listTitle: { ...typography.body3, color: colors.gray[800] },
  listMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  listMeta: { ...typography.caption2, color: colors.gray[500] },
  badge: {
    minWidth: 62,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[50],
  },
  badgeText: { ...typography.caption1, color: colors.primary[500] },
});

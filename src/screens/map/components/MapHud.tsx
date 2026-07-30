import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ClearIcon from "src/assets/Clear.svg";
import { colors, shadow, typography } from "src/design/theme";
import type { MapFilter } from "../types";

const FILTERS: Array<{ key: MapFilter; label: string }> = [
  { key: "ALL", label: "전체" },
  { key: "SPOT", label: "스팟" },
  { key: "POST", label: "커뮤니티" },
  { key: "CHALLENGE", label: "챌린지" },
];

export const RADIUS_OPTIONS = [1, 3, 5] as const;

type Props = {
  isLocating: boolean;
  markerCount: number;
  stepsText: string;
  searchText: string;
  activeFilter: MapFilter;
  radiusKm: (typeof RADIUS_OPTIONS)[number];
  onChangeSearchText: (value: string) => void;
  onChangeFilter: (filter: MapFilter) => void;
  onChangeRadius: (radius: (typeof RADIUS_OPTIONS)[number]) => void;
  onRecenter: () => void;
};

export function MapHud({
  isLocating,
  markerCount,
  stepsText,
  searchText,
  activeFilter,
  radiusKm,
  onChangeSearchText,
  onChangeFilter,
  onChangeRadius,
  onRecenter,
}: Props) {
  return (
    <View style={styles.topOverlay}>
      <View style={styles.headerPanel}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>지도 탐색</Text>
          <Text style={styles.headerSubtitle}>
            {isLocating ? "현재 위치를 확인하는 중..." : `${markerCount}개 표시 · 오늘 이동 ${stepsText}`}
          </Text>
        </View>

        <View style={styles.searchInputWrap}>
          <TextInput
            value={searchText}
            onChangeText={onChangeSearchText}
            placeholder="스팟이나 장소 이름 검색"
            placeholderTextColor={colors.gray[400]}
            style={styles.searchInput}
          />
          {searchText.length > 0 ? (
            <Pressable
              style={styles.clearButton}
              onPress={() => onChangeSearchText("")}
              hitSlop={8}
              accessibilityLabel="검색어 지우기"
            >
              <ClearIcon width={18} height={18} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((item) => {
            const active = item.key === activeFilter;
            return (
              <Pressable
                key={item.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => onChangeFilter(item.key)}
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
                onPress={() => onChangeRadius(value)}
              >
                <Text style={[styles.radiusChipText, active && styles.radiusChipTextActive]}>
                  {value}km
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={styles.recenterButton} onPress={onRecenter}>
        <Text style={styles.recenterButtonText}>현재 위치</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerPanel: { flex: 1, gap: 10 },
  headerCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    ...shadow.card,
  },
  headerTitle: { ...typography.head4, color: colors.gray[800] },
  headerSubtitle: { ...typography.caption2, color: colors.gray[600], marginTop: 6 },
  searchInputWrap: { justifyContent: "center" },
  searchInput: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingRight: 40,
    backgroundColor: "rgba(255,255,255,0.96)",
    ...typography.body4,
    color: colors.gray[800],
  },
  clearButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  filterChipActive: { backgroundColor: colors.primary[400] },
  filterChipText: { ...typography.caption1, color: colors.gray[500] },
  filterChipTextActive: { color: colors.base[0] },
  radiusRow: { flexDirection: "row", gap: 8 },
  radiusChip: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  radiusChipActive: { backgroundColor: colors.gray[800] },
  radiusChipText: { ...typography.caption1, color: colors.gray[600] },
  radiusChipTextActive: { color: colors.base[0] },
  recenterButton: {
    minWidth: 82,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,31,31,0.92)",
  },
  recenterButtonText: { ...typography.caption1, color: colors.base[0] },
});

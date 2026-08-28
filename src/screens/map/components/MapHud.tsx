import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChevronLeftIcon from "src/assets/ChevronLeft.svg";
import ClearIcon from "src/assets/Clear.svg";
import LocationIcon from "src/assets/Location.svg";
import type { SpotCategory } from "src/api/spotsApi";
import { colors, shadow, typography } from "src/design/theme";

const CATEGORIES: Array<{ key: SpotCategory | null; label: string }> = [
  { key: null, label: "전체" },
  { key: "TOURIST_SPOT", label: "관광지" },
  { key: "RESTAURANT", label: "식당" },
  { key: "UNIQUE_SPOT", label: "이색 스팟" },
];

export const RADIUS_OPTIONS = [1, 3, 5] as const;

type Props = {
  isLocating: boolean;
  markerCount: number;
  searchText: string;
  category: SpotCategory | null;
  radiusKm: (typeof RADIUS_OPTIONS)[number];
  onChangeSearchText: (value: string) => void;
  onChangeCategory: (category: SpotCategory | null) => void;
  onChangeRadius: (radius: (typeof RADIUS_OPTIONS)[number]) => void;
  onRecenter: () => void;
  onBack?: () => void;
};

export function MapHud({
  isLocating,
  markerCount,
  searchText,
  category,
  radiusKm,
  onChangeSearchText,
  onChangeCategory,
  onChangeRadius,
  onRecenter,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.topOverlay, { top: insets.top + 18 }]}>
      {onBack ? (
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          hitSlop={8}
          accessibilityLabel="뒤로가기"
        >
          <ChevronLeftIcon width={10} height={16} />
        </Pressable>
      ) : null}

      <View style={styles.headerPanel}>
        <View style={styles.headerCard}>
          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>지도 탐색</Text>
            <Text style={styles.headerSubtitle}>
              {isLocating ? "현재 위치를 확인하는 중..." : `${markerCount}개 표시`}
            </Text>
          </View>
          <Pressable style={styles.recenterButton} onPress={onRecenter} hitSlop={8} accessibilityLabel="현재 위치로 이동">
            <LocationIcon width={18} height={18} />
          </Pressable>
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

        <Text style={styles.rowLabel}>카테고리</Text>
        <View style={styles.filterRow}>
          {CATEGORIES.map((item) => {
            const active = item.key === category;
            return (
              <Pressable
                key={item.key ?? "ALL"}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => onChangeCategory(item.key)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  topOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    ...shadow.card,
  },
  headerPanel: { flex: 1, gap: 5 },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 7,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    ...shadow.card,
  },
  headerTextBox: { flexShrink: 1 },
  headerTitle: { ...typography.head4, color: colors.gray[800] },
  headerSubtitle: { ...typography.caption2, color: colors.gray[600], marginTop: 3 },
  recenterButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  searchInputWrap: { justifyContent: "center" },
  searchInput: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 7,
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
  rowLabel: {
    ...typography.caption2,
    color: colors.gray[600],
    marginLeft: 2,
  },
  filterRow: { flexDirection: "row", gap: 4 },
  filterChip: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 4,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  filterChipActive: { backgroundColor: colors.primary[400] },
  filterChipText: { ...typography.caption1, color: colors.gray[600] },
  filterChipTextActive: { color: colors.base[0] },
  radiusRow: { flexDirection: "row", gap: 4 },
  radiusChip: {
    flex: 1,
    minHeight: 32,
    paddingHorizontal: 4,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  radiusChipActive: { backgroundColor: colors.gray[800] },
  radiusChipText: { ...typography.caption1, color: colors.gray[600] },
  radiusChipTextActive: { color: colors.base[0] },
});

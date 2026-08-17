import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DefaultProfile from "src/assets/default_profile.svg";
import Hanlabong from "src/assets/hanlabong.svg";
import PenIcon from "src/assets/pen.svg";
import Steps from "src/assets/Steps.svg";
import TrophyIcon from "src/assets/trophyColor.svg";
import { colors, shadow, typography } from "src/design/theme";
import { LevelInfoModal } from "./LevelInfoModal";

type Props = {
  profile?: string | null;
  nickname?: string | null;
  name?: string | null;
  level: string;
  hallabong?: number | null;
  totalSteps?: number | null;
  onPressProfile: () => void;
};

export function MyProfileSummary({
  profile,
  nickname,
  name,
  level,
  hallabong,
  totalSteps,
  onPressProfile,
}: Props) {
  const displayName = nickname || name || "게스트";
  const [imageFailed, setImageFailed] = useState(false);
  const [levelInfoOpen, setLevelInfoOpen] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profile]);

  return (
    <View style={styles.profileWrapper}>
      <Pressable style={styles.profileBox} onPress={onPressProfile}>
        <View style={styles.profileImageWrapper}>
          {profile && !imageFailed ? (
            <Image
              source={{ uri: profile }}
              style={styles.profileImage}
              cachePolicy="memory-disk"
              transition={150}
              onError={(e) => {
                console.warn("[MyProfileSummary] 프로필 이미지 로드 실패:", profile, e.error);
                setImageFailed(true);
              }}
            />
          ) : (
            <DefaultProfile width={72} height={72} />
          )}
        </View>

        <View style={styles.nicknameWrapper}>
          <View style={styles.nicknameBox}>
            <Text style={styles.nickname} numberOfLines={1}>{displayName}</Text>
            <PenIcon width={16} height={16} />
          </View>
          <Pressable
            style={styles.levelBadge}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              setLevelInfoOpen(true);
            }}
          >
            <TrophyIcon width={16} height={16} />
            <Text style={styles.levelBadgeText}>LV. {level}</Text>
          </Pressable>
        </View>
      </Pressable>

      <LevelInfoModal
        visible={levelInfoOpen}
        totalSteps={totalSteps ?? 0}
        onClose={() => setLevelInfoOpen(false)}
      />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.statLabelRow}>
            <Hanlabong width={18} height={18} />
            <Text style={styles.statLabel}>내 한라봉</Text>
          </View>
          <Text style={styles.statValue}>{(hallabong ?? 0).toLocaleString("ko-KR")}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <View style={styles.statLabelRow}>
            <Steps width={18} height={18} />
            <Text style={styles.statLabel}>누적 걸음수</Text>
          </View>
          <Text style={styles.statValue}>{(totalSteps ?? 0).toLocaleString("ko-KR")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileWrapper: { backgroundColor: colors.bg[0], padding: 20, gap: 20 },
  profileBox: { flexDirection: "row", alignItems: "center", gap: 30 },
  profileImageWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: colors.gray[300], backgroundColor: colors.gray[200], alignItems: "center", justifyContent: "center", overflow: "hidden" },
  profileImage: { width: "100%", height: "100%" },
  nicknameWrapper: { flex: 1, paddingTop: 20, paddingBottom: 18 },
  nicknameBox: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  nickname: { width: 140, ...typography.head3, color: colors.gray[800] },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  levelBadgeText: { ...typography.caption1, fontWeight: "700", color: colors.primary[500] },
  statsRow: {
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  statBox: { flex: 1, paddingVertical: 16, paddingHorizontal: 14, gap: 8 },
  statDivider: { width: 1, marginVertical: 14, backgroundColor: colors.gray[200] },
  statLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: { ...typography.caption1, color: colors.gray[600] },
  statValue: { ...typography.head3, color: colors.gray[800] },
});

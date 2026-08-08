import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";
import DefaultProfile from "src/assets/default_profile.svg";
import LocationIcon from "src/assets/Location.svg";
import HanlabongIcon from "src/assets/hanlabong.svg";
import StepsIcon from "src/assets/Steps.svg";

type Props = {
  nickname?: string | null;
  profileUrl?: string | null;
  isLocating: boolean;
  locationLabel: string;
  hallabong?: number | null;
  totalSteps?: number | null;
};

export function MainHero({ nickname, profileUrl, isLocating, locationLabel, hallabong, totalSteps }: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profileUrl]);

  return (
    <View style={styles.heroSection}>
      <View style={styles.heroTop}>
        <View style={styles.avatar}>
          {profileUrl && !imageFailed ? (
            <Image
              source={{ uri: profileUrl }}
              style={styles.avatarImage}
              onError={(e) => {
                console.warn("[MainHero] 프로필 이미지 로드 실패:", profileUrl, e.nativeEvent.error);
                setImageFailed(true);
              }}
            />
          ) : (
            <DefaultProfile width={40} height={40} />
          )}
        </View>

        <View style={styles.heroTopText}>
          <View style={styles.eyebrowPill}>
            <Text style={styles.eyebrowText}>JEJU DAY</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {nickname ? `${nickname}님, 오늘도 제주를 걸어볼까요?` : "오늘도 제주를 걸어볼까요?"}
          </Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <LocationIcon width={14} height={14} />
        <Text style={styles.description} numberOfLines={2}>
          {isLocating ? "현재 위치를 확인하는 중..." : `${locationLabel} 근처 스팟과 챌린지를 모아봤어요.`}
        </Text>
      </View>

      <View style={styles.heroStats}>
        <View style={styles.heroStat}>
          <View style={styles.heroStatLabelRow}>
            <HanlabongIcon width={16} height={16} />
            <Text style={styles.heroStatLabel}>보유 한라봉</Text>
          </View>
          <Text style={styles.heroStatValue}>{hallabong ?? 0}</Text>
        </View>
        <View style={styles.heroStat}>
          <View style={styles.heroStatLabelRow}>
            <StepsIcon width={16} height={16} />
            <Text style={styles.heroStatLabel}>누적 걸음수</Text>
          </View>
          <Text style={styles.heroStatValue}>{(totalSteps ?? 0).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: { padding: 20, borderRadius: 12, backgroundColor: colors.bg[0], ...shadow.card },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  avatarImage: { width: "100%", height: "100%" },
  heroTopText: { flex: 1, gap: 6 },
  eyebrowPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primary[100],
  },
  eyebrowText: { ...typography.caption1, color: colors.primary[400] },
  title: { ...typography.head3, color: colors.gray[800] },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  description: { ...typography.body4, color: colors.gray[600], flexShrink: 1 },
  heroStats: { flexDirection: "row", gap: 12, marginTop: 18 },
  heroStat: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: colors.bg[50] },
  heroStatLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroStatLabel: { ...typography.caption2, color: colors.gray[500] },
  heroStatValue: { ...typography.head3, color: colors.primary[400], marginTop: 8 },
});

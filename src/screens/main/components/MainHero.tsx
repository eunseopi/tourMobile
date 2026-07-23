import { StyleSheet, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";

type Props = {
  nickname?: string | null;
  isLocating: boolean;
  locationLabel: string;
  hallabong?: number | null;
  totalSteps?: number | null;
};

export function MainHero({ nickname, isLocating, locationLabel, hallabong, totalSteps }: Props) {
  return (
    <View style={styles.heroSection}>
      <Text style={styles.eyebrow}>JEJU DAY</Text>
      <Text style={styles.title}>
        {nickname ? `${nickname}님, 오늘도 제주를 걸어볼까요?` : "오늘도 제주를 걸어볼까요?"}
      </Text>
      <Text style={styles.description}>
        {isLocating ? "현재 위치를 확인하는 중..." : `${locationLabel} 근처 스팟과 챌린지를 모아봤어요.`}
      </Text>

      <View style={styles.heroStats}>
        <View style={styles.heroStat}>
          <Text style={styles.heroStatLabel}>보유 한라봉</Text>
          <Text style={styles.heroStatValue}>{hallabong ?? 0}</Text>
        </View>
        <View style={styles.heroStat}>
          <Text style={styles.heroStatLabel}>누적 걸음수</Text>
          <Text style={styles.heroStatValue}>{(totalSteps ?? 0).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: { padding: 20, borderRadius: 12, backgroundColor: colors.bg[0], ...shadow.card },
  eyebrow: { ...typography.caption1, color: colors.primary[400] },
  title: { ...typography.head2, color: colors.gray[800], marginTop: 8 },
  description: { ...typography.body4, color: colors.gray[600], marginTop: 10 },
  heroStats: { flexDirection: "row", gap: 12, marginTop: 18 },
  heroStat: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: colors.bg[50] },
  heroStatLabel: { ...typography.caption2, color: colors.gray[500] },
  heroStatValue: { ...typography.head3, color: colors.primary[400], marginTop: 8 },
});

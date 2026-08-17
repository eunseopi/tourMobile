import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import CheckInModal from "src/components/main/CheckInModal";
import { PressableScale } from "src/components/ui/PressableScale";
import { colors, shadow, typography } from "src/design/theme";
import { useAttendanceStatus, useCheckIn } from "src/features/main/useCheckIn";

type RewardState = { mode: "success" | "already"; day: number; reward: number; bonus: number };

// consecutiveDays/days는 연속 출석이 끊기지 않는 한 서버에서 계속 증가하는 값(8, 9, 15...)이라
// 7칸짜리 주간 스탬프 카드에 맞춰 표시하려면 프론트에서 직접 1~7로 매핑해야 한다.
function toStampDay(day: number) {
  if (day <= 0) return 0;
  return ((day - 1) % 7) + 1;
}

export function CheckInButton() {
  const { checkIn, isChecking } = useCheckIn();
  const { data: status } = useAttendanceStatus();
  const [reward, setReward] = useState<RewardState | null>(null);

  const checkedToday = status?.checkedToday ?? false;

  const handlePress = async () => {
    try {
      const result = await checkIn();
      if (result.status === "already") {
        setReward({
          mode: "already",
          day: toStampDay(status?.consecutiveDays ?? 0),
          reward: 0,
          bonus: 0,
        });
        return;
      }
      setReward({
        mode: "success",
        day: toStampDay(result.days ?? 0),
        reward: result.baseHallabong ?? 0,
        bonus: result.bonusHallabong ?? 0,
      });
    } catch (error: any) {
      Alert.alert(
        "출석체크 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  return (
    <>
      <PressableScale style={styles.card} onPress={handlePress} disabled={isChecking}>
        <View style={[styles.iconWrap, checkedToday && styles.iconWrapDone]}>
          <Text style={[styles.icon, checkedToday && styles.iconDone]}>
            {checkedToday ? "✓" : "🍊"}
          </Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{checkedToday ? "오늘 출석 완료" : "오늘 출석체크"}</Text>
          <Text style={styles.subtitle}>
            {checkedToday ? "내일 다시 눌러 스탬프를 채워보세요" : "눌러서 한라봉을 받아보세요"}
          </Text>
        </View>
        {isChecking ? (
          <ActivityIndicator color={colors.primary[400]} />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </PressableScale>

      <CheckInModal
        open={reward != null}
        mode={reward?.mode ?? "success"}
        day={reward?.day ?? 0}
        reward={reward?.reward ?? 0}
        bonus={reward?.bonus ?? 0}
        onClose={() => setReward(null)}
        onClaim={() => setReward(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[50],
  },
  iconWrapDone: {
    backgroundColor: colors.primary[400],
  },
  icon: {
    fontSize: 24,
  },
  iconDone: {
    color: colors.base[0],
    fontWeight: "700",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body1,
    color: colors.gray[800],
  },
  subtitle: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  chevron: {
    fontSize: 22,
    color: colors.gray[500],
  },
});

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { PressableScale } from "src/components/ui/PressableScale";
import { FadeSlideIn } from "src/components/ui/FadeSlideIn";
import { colors, shadow, typography } from "src/design/theme";
import { useMissionDetail } from "src/features/missions/useMissions";

type Props = NativeStackScreenProps<RootStackParamList, "MissionDetail">;

export default function MissionDetailScreen({ navigation, route }: Props) {
  const { mission } = route.params;
  const { data: steps, isLoading, isError, refetch } = useMissionDetail(mission.id);

  const sortedSteps = [...(steps ?? [])].sort((a, b) => a.order - b.order);
  const completedCount = steps?.filter((s) => s.completed).length ?? mission.completedSteps;
  const totalCount = steps?.length ?? mission.totalSteps;

  return (
    <View style={styles.screen}>
      <ScreenHeader title={mission.title} />
      <View style={styles.header}>
        <Text style={styles.description}>{mission.description}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount} 스탬프
          </Text>
          {mission.completed ? (
            <View style={styles.completeChip}>
              <Text style={styles.completeChipText}>완주 완료 · 한라봉 1000개 획득</Text>
            </View>
          ) : (
            <Text style={styles.rewardHint}>전부 모으면 한라봉 1000개!</Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.mutedText}>스탬프 정보를 불러오지 못했어요.</Text>
          <PressableScale style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </PressableScale>
        </View>
      ) : (
        <View style={styles.passportCard}>
          <View style={styles.passportHeader}>
            <Text style={styles.passportTitle}>스탬프 카드</Text>
            <View style={styles.passportCountChip}>
              <Text style={styles.passportCountText}>
                {completedCount}/{totalCount}
              </Text>
            </View>
          </View>

          {sortedSteps.map((step, index) => {
            const isLast = index === sortedSteps.length - 1;
            return (
              <FadeSlideIn key={step.spotId} delay={index * 60}>
                <View style={styles.pathRow}>
                  <View style={styles.pathLeft}>
                    <PressableScale
                      style={[styles.stamp, step.completed && styles.stampDone]}
                      onPress={() => navigation.navigate("SpotDetail", { spotId: step.spotId })}
                    >
                      <Text style={[styles.stampIcon, step.completed && styles.stampIconDone]}>
                        {step.completed ? "🍊" : String(index + 1)}
                      </Text>
                    </PressableScale>
                    {!isLast ? (
                      <View
                        style={[styles.connector, step.completed && styles.connectorDone]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.pathBody}>
                    <Text style={styles.stepOrderLabel}>{index + 1}번째 스탬프</Text>
                    <Text style={styles.stepLabel} numberOfLines={2}>
                      {step.stepLabel}
                    </Text>
                    <Text style={[styles.stepStatus, step.completed && styles.stepStatusDone]}>
                      {step.completed ? "✓ 방문 인증 완료" : "아직 방문 전이에요"}
                    </Text>
                  </View>
                </View>
              </FadeSlideIn>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg[50] },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 5,
  },
  description: {
    ...typography.body4,
    color: colors.gray[700],
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  progressText: {
    ...typography.body1,
    color: colors.gray[800],
  },
  rewardHint: {
    ...typography.caption1,
    color: colors.primary[400],
  },
  completeChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
  },
  completeChipText: {
    ...typography.caption1,
    color: colors.primary[500],
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 80,
  },
  mutedText: { ...typography.body4, color: colors.gray[600] },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.primary[400],
  },
  retryButtonText: { ...typography.caption1, color: colors.base[0] },
  passportCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.bg[0],
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    borderStyle: "dashed",
    ...shadow.card,
  },
  passportHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  passportTitle: {
    ...typography.head4,
    color: colors.gray[800],
  },
  passportCountChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
  },
  passportCountText: {
    ...typography.caption1,
    color: colors.primary[500],
    fontWeight: "700",
  },
  pathRow: {
    flexDirection: "row",
    gap: 7,
  },
  pathLeft: {
    alignItems: "center",
    width: 60,
  },
  stamp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: "dashed",
  },
  stampDone: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
    borderStyle: "solid",
  },
  stampIcon: {
    ...typography.head4,
    color: colors.gray[400],
  },
  stampIconDone: {
    fontSize: 24,
    color: colors.primary[500],
  },
  connector: {
    width: 2,
    height: 30,
    marginVertical: 4,
    backgroundColor: colors.gray[200],
  },
  connectorDone: {
    backgroundColor: colors.primary[300],
  },
  pathBody: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: 12,
    gap: 2,
  },
  stepOrderLabel: {
    ...typography.caption2,
    color: colors.gray[500],
  },
  stepLabel: {
    ...typography.body1,
    color: colors.gray[800],
  },
  stepStatus: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  stepStatusDone: {
    color: colors.primary[500],
    fontWeight: "700",
  },
});

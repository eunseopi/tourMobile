import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { PressableScale } from "src/components/ui/PressableScale";
import { FadeSlideIn } from "src/components/ui/FadeSlideIn";
import { colors, shadow, typography } from "src/design/theme";
import { useMissions } from "src/features/missions/useMissions";

type Props = NativeStackScreenProps<RootStackParamList, "MissionList">;

export default function MissionListScreen({ navigation }: Props) {
  const { data: missions, isLoading, isError, refetch } = useMissions();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="테마 미션" />
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.mutedText}>미션을 불러오지 못했어요.</Text>
          <PressableScale style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </PressableScale>
        </View>
      ) : (
        <FlatList
          data={missions ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <Text style={styles.intro}>
              스팟 여러 곳을 하나의 테마로 묶었어요. 전부 방문 인증하면 한라봉 1000개를
              추가로 받아요!
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.mutedText}>아직 준비된 미션이 없어요.</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const progress = item.totalSteps > 0 ? item.completedSteps / item.totalSteps : 0;
            return (
              <FadeSlideIn delay={Math.min(index, 8) * 40}>
                <PressableScale
                  style={styles.card}
                  onPress={() => navigation.navigate("MissionDetail", { mission: item })}
                >
                  <View style={styles.coverWrap}>
                    {item.coverImageUrl ? (
                      <Image
                        source={{ uri: item.coverImageUrl }}
                        style={styles.cover}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                      />
                    ) : (
                      <View style={[styles.cover, styles.coverPlaceholder]} />
                    )}
                    {item.completed ? (
                      <View style={styles.completeBadge}>
                        <Text style={styles.completeBadgeText}>완주!</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.progressRow}>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.round(progress * 100)}%` },
                            item.completed && styles.progressFillDone,
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {item.completedSteps}/{item.totalSteps}
                      </Text>
                    </View>
                  </View>
                </PressableScale>
              </FadeSlideIn>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg[50] },
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
  content: { padding: 10, gap: 8 },
  intro: {
    ...typography.body4,
    color: colors.gray[700],
    marginBottom: 2,
    lineHeight: 20,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  coverWrap: {
    width: "100%",
    height: 140,
    backgroundColor: colors.gray[100],
  },
  cover: { width: "100%", height: "100%" },
  coverPlaceholder: { backgroundColor: colors.gray[200] },
  completeBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.primary[400],
  },
  completeBadgeText: {
    ...typography.caption1,
    color: colors.base[0],
    fontWeight: "700",
  },
  cardBody: { padding: 8, gap: 3 },
  cardTitle: { ...typography.head4, color: colors.gray[800] },
  cardDescription: { ...typography.body4, color: colors.gray[600], lineHeight: 19 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[200],
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.primary[300],
  },
  progressFillDone: {
    backgroundColor: colors.primary[400],
  },
  progressText: {
    ...typography.caption1,
    color: colors.gray[700],
  },
});

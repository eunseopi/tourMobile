import { useEffect, useMemo, useRef, useState } from "react";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useScrollToTop } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  MainTabParamList,
  RootStackParamList,
} from "src/app/navigation/types";
import TrophyColor from "src/assets/trophyColor.svg";
import StampIcon from "src/assets/Stamp.svg";
import { NotificationBellButton } from "src/components/navigation/NotificationBellButton";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { Alert } from "src/components/ui/AppAlert";
import { FadeSlideIn } from "src/components/ui/FadeSlideIn";
import { PressableScale } from "src/components/ui/PressableScale";
import { colors, layout, typography } from "src/design/theme";
import { useRefreshUpcomingChallenges } from "src/features/challenges/useChallengeMutations";
import {
  useLoadCompletedChallenges,
  useLoadOngoingChallenges,
  useLoadUpcomingChallenges,
} from "src/features/challenges/useChallengeQueries";
import { useChallengeStore } from "src/stores/challengeStore";
import { useTabBarHeight } from "src/utils/lib/useTabBarHeight";
import { ChallengeCard } from "./components/ChallengeCard";
import { ChallengeTabs, type ChallengeTab } from "./components/ChallengeTabs";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Challenge">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ChallengeScreen({ navigation, route }: Props) {
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);
  const tabBarHeight = useTabBarHeight();
  const [tab, setTab] = useState<ChallengeTab>(
    route.params?.initialTab ?? "pre"
  );
  const upcomingQuery = useLoadUpcomingChallenges();
  const ongoingQuery = useLoadOngoingChallenges();
  const completedQuery = useLoadCompletedChallenges();
  const refreshUpcoming = useRefreshUpcomingChallenges();

  const ready = useChallengeStore((state) => state.ready);
  const doing = useChallengeStore((state) => state.doing);
  const done = useChallengeStore((state) => state.done);
  const highlightedId = route.params?.highlightId ?? null;

  useEffect(() => {
    const nextTab = route.params?.initialTab;
    if (nextTab) {
      setTab(nextTab);
    }
  }, [route.params?.initialTab]);

  const visible = tab === "pre" ? ready : tab === "doing" ? doing : done;
  const isLoading =
    upcomingQuery.isLoading ||
    ongoingQuery.isLoading ||
    completedQuery.isLoading;
  const isRefreshing =
    upcomingQuery.isRefetching ||
    ongoingQuery.isRefetching ||
    completedQuery.isRefetching ||
    refreshUpcoming.isPending;

  const emptyText = useMemo(() => {
    if (tab === "done") return "완료된 챌린지가 없어요!";
    if (tab === "doing") return "현재 진행중인 챌린지가 없어요!";
    return "추천 챌린지가 없어요!";
  }, [tab]);

  // pull-to-refresh는 데이터 동기화만 한다 - 여기서도 추천을 다시 뽑아버리면
  // 그냥 화면을 당겼을 뿐인데 예고 없이 다른 장소로 바뀌어버린다.
  const handleRefresh = () => {
    void upcomingQuery.refetch();
    void ongoingQuery.refetch();
    void completedQuery.refetch();
  };

  // "새로운 장소 보기"는 명시적으로 다른 곳을 요청하는 행동이므로 확인 후 진행한다.
  const handleRequestNewPlaces = () => {
    Alert.alert(
      "새로운 장소를 보시겠어요?",
      "지금 추천된 장소가 다른 곳으로 바뀌어요.",
      [
        { text: "취소", style: "cancel" },
        { text: "새로 보기", onPress: () => refreshUpcoming.mutate() },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="챌린지" showBack={false} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
          <Text style={styles.mutedText}>챌린지를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="챌린지"
        showBack={false}
        right={<NotificationBellButton />}
      />
      <View style={styles.header}>
        <ChallengeTabs value={tab} onChange={setTab} />
        {tab === "pre" ? (
          <PressableScale
            style={styles.refreshButton}
            onPress={handleRequestNewPlaces}
            disabled={refreshUpcoming.isPending}
          >
            {refreshUpcoming.isPending ? (
              <ActivityIndicator size="small" color={colors.primary[400]} />
            ) : (
              <Text style={styles.refreshButtonText}>새로운 장소 보기</Text>
            )}
          </PressableScale>
        ) : null}
      </View>

      <PressableScale
        style={styles.missionBanner}
        onPress={() => navigation.navigate("MissionList")}
      >
        <View style={styles.missionBannerIcon}>
          <StampIcon width={28} height={28} />
        </View>
        <View style={styles.missionBannerBody}>
          <Text style={styles.missionBannerTitle}>테마 미션</Text>
          <Text style={styles.missionBannerSubtitle}>
            스팟 여러 곳을 다 모으면 한라봉 1000개!
          </Text>
        </View>
        <Text style={styles.missionBannerChevron}>›</Text>
      </PressableScale>

      <FlatList
        key={tab}
        ref={listRef}
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight - 70 },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          if (tab === "done" && completedQuery.hasNextPage) {
            void completedQuery.fetchNextPage();
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <TrophyColor width={120} height={120} style={styles.emptyEmoji} />
            <Text style={styles.mutedText}>{emptyText}</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <FadeSlideIn delay={Math.min(index, 8) * 40}>
            <ChallengeCard
              item={item}
              highlighted={tab === "done" && highlightedId === item.id}
              onPress={() => {
                if (tab === "pre") {
                  navigation.navigate("ChallengeDetail", { challenge: item });
                } else if (tab === "doing") {
                  navigation.navigate("ChallengeComplete", { challenge: item });
                }
              }}
            />
          </FadeSlideIn>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  missionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: layout.screenPadding,
    marginBottom: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
  },
  missionBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  missionBannerBody: {
    flex: 1,
    gap: 2,
  },
  missionBannerTitle: {
    ...typography.body1,
    color: colors.gray[800],
  },
  missionBannerSubtitle: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  missionBannerChevron: {
    fontSize: 22,
    color: colors.gray[500],
  },
  header: {
    backgroundColor: colors.bg[0],
    paddingTop: 3,
  },
  refreshButton: {
    alignSelf: "center",
    minHeight: 34,
    paddingHorizontal: 14,
    marginVertical: 5,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[50],
  },
  refreshButtonText: {
    ...typography.caption1,
    color: colors.primary[400],
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    gap: 6,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[50],
  },
  emptyBox: {
    paddingVertical: 120,
    alignItems: "center",
  },
  emptyEmoji: {
    marginBottom: 40,
  },
  mutedText: {
    ...typography.body1,
    color: colors.gray[600],
  },
});

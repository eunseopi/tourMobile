import { useEffect, useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { colors, typography } from "src/design/theme";
import {
  useLoadCompletedChallenges,
  useLoadOngoingChallenges,
  useLoadUpcomingChallenges,
} from "src/features/challenges/useChallengeQueries";
import { useChallengeStore } from "src/stores/challengeStore";
import { ChallengeCard } from "./components/ChallengeCard";
import { ChallengeTabs, type ChallengeTab } from "./components/ChallengeTabs";

type Props = NativeStackScreenProps<RootStackParamList, "Challenge">;

export default function ChallengeScreen({ navigation, route }: Props) {
  const [tab, setTab] = useState<ChallengeTab>(route.params?.initialTab ?? "pre");
  const upcomingQuery = useLoadUpcomingChallenges();
  const ongoingQuery = useLoadOngoingChallenges();
  const completedQuery = useLoadCompletedChallenges();

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
    upcomingQuery.isLoading || ongoingQuery.isLoading || completedQuery.isLoading;
  const isRefreshing =
    upcomingQuery.isRefetching ||
    ongoingQuery.isRefetching ||
    completedQuery.isRefetching;

  const emptyText = useMemo(() => {
    if (tab === "done") return "완료된 챌린지가 없어요!";
    if (tab === "doing") return "현재 진행중인 챌린지가 없어요!";
    return "추천 챌린지가 없어요!";
  }, [tab]);

  const handleRefresh = () => {
    void upcomingQuery.refetch();
    void ongoingQuery.refetch();
    void completedQuery.refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>챌린지를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>챌린지</Text>
        <ChallengeTabs value={tab} onChange={setTab} />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
            <Text style={styles.mutedText}>{emptyText}</Text>
          </View>
        }
        renderItem={({ item }) => (
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
  header: {
    backgroundColor: colors.bg[0],
    paddingTop: 6,
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
    textAlign: "center",
    paddingTop: 6,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 14,
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
  mutedText: {
    ...typography.body1,
    color: colors.gray[500],
  },
});

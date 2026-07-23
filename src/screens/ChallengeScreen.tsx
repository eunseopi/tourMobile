import { useEffect, useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import {
  useLoadCompletedChallenges,
  useLoadOngoingChallenges,
  useLoadUpcomingChallenges,
} from "src/features/challenges/useChallengeQueries";
import type { ChallengeCardData } from "src/reducer/types";
import { useChallengeStore } from "src/stores/challengeStore";
import { colors, shadow, typography } from "src/design/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Challenge">;
type Tab = "pre" | "doing" | "done";

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "pre", label: "진행전" },
  { key: "doing", label: "진행중" },
  { key: "done", label: "완료" },
];

export default function ChallengeScreen({ navigation, route }: Props) {
  const [tab, setTab] = useState<Tab>(route.params?.initialTab ?? "pre");
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
    if (tab === "done") return "완료된 챌린지가 없어요.";
    if (tab === "doing") return "현재 진행중인 챌린지가 없어요.";
    return "추천 챌린지가 없어요.";
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
        <View style={styles.tabs}>
        {TABS.map((item) => {
          const active = item.key === tab;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => setTab(item.key)}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
          <View style={[styles.indicator, { left: `${TABS.findIndex((item) => item.key === tab) * 33.3333}%` }]} />
        </View>
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

function ChallengeCard({
  item,
  highlighted,
  onPress,
}: {
  item: ChallengeCardData;
  highlighted?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={[styles.card, highlighted && styles.cardHighlighted]} onPress={onPress}>
      <View style={styles.cardMedia}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : null}
        {item.statusLabel === "완료" ? <View style={styles.dim} /> : null}
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.category}>{item.categoryLabel}</Text>
        <View style={styles.bottomLeft}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.status}>{item.statusLabel}</Text>
          {highlighted ? <Text style={styles.highlightText}>방금 완료한 챌린지예요</Text> : null}
        </View>
        {item.dateText ? <Text style={styles.cardDate}>{item.dateText}</Text> : null}
      </View>
    </Pressable>
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
  tabs: {
    position: "relative",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {},
  tabText: {
    ...typography.body1,
    color: colors.gray[500],
    fontWeight: "400",
  },
  activeTabText: {
    color: colors.primary[400],
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    width: "33.3333%",
    height: 3,
    backgroundColor: colors.primary[400],
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    width: 335,
    maxWidth: "100%",
    height: 180,
    alignSelf: "center",
    padding: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  cardHighlighted: {
    borderWidth: 1.5,
    borderColor: colors.primary[400],
  },
  cardMedia: {
    flex: 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.gray[200],
  },
  image: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  trophy: {
    position: "absolute",
    right: 12,
    top: 12,
    fontSize: 22,
  },
  category: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    ...typography.body1,
    color: colors.base[0],
    backgroundColor: colors.gray[600],
  },
  bottomLeft: {
    position: "absolute",
    left: 16,
    bottom: 16,
    right: 96,
  },
  cardTitle: {
    ...typography.head3,
    fontWeight: "700",
    color: colors.base[0],
  },
  status: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.gray[100],
    marginTop: 2,
  },
  cardDate: {
    position: "absolute",
    right: 16,
    bottom: 16,
    ...typography.body4,
    fontWeight: "600",
    color: colors.gray[100],
  },
  highlightText: {
    ...typography.caption1,
    color: colors.primary[100],
    marginTop: 4,
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

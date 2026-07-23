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
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>챌린지를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      <View style={styles.thumbnail}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Challenge</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.badge}>{item.statusLabel}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {item.categoryLabel}
        </Text>
        {item.dateText ? <Text style={styles.cardDate}>{item.dateText}</Text> : null}
        {highlighted ? <Text style={styles.highlightText}>방금 완료한 챌린지예요</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#191919",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
  },
  activeTab: {
    backgroundColor: "#ff8b4c",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#777",
  },
  activeTabText: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#fafafa",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e8e8e8",
  },
  cardHighlighted: {
    borderWidth: 1.5,
    borderColor: "#ff8b4c",
    backgroundColor: "#fff8f3",
  },
  thumbnail: {
    width: 104,
    height: 104,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#fff4ec",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  cardBody: {
    flex: 1,
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#fff4ec",
    color: "#ff8b4c",
    fontSize: 12,
    fontWeight: "900",
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    color: "#222",
  },
  cardMeta: {
    marginTop: 5,
    fontSize: 13,
    color: "#666",
  },
  cardDate: {
    marginTop: 5,
    fontSize: 12,
    color: "#999",
  },
  highlightText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#d96b28",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  emptyBox: {
    paddingVertical: 100,
    alignItems: "center",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
});

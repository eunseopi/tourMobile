import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import type { SpotCommunityResult } from "src/api/community";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import ClearIcon from "src/assets/Clear.svg";
import { colors, layout, shadow, typography } from "src/design/theme";
import { useCommunitySearch } from "src/features/community/useCommunitySearch";
import { formatDate } from "src/utils/formDate";

type Props = NativeStackScreenProps<RootStackParamList, "CommunitySearch">;

export default function CommunitySearchScreen({ navigation, route }: Props) {
  const {
    query,
    setQuery,
    isSearching,
    results,
    isLoadingResults,
    isResultsError,
    refetchResults,
    history,
  } = useCommunitySearch(route.params?.initialQuery ?? "");

  const openResult = (item: SpotCommunityResult) => {
    if (item.type === "CHALLENGE") {
      navigation.navigate("Main", { screen: "Challenge" });
    } else if (item.type === "SPOT") {
      navigation.navigate("SpotDetail", { spotId: item.id });
    } else {
      navigation.navigate("PostDetail", { postId: item.id });
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="커뮤니티 검색" />
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="검색어를 입력해주세요"
          placeholderTextColor={colors.gray[400]}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable style={styles.clearButton} onPress={() => setQuery("")} hitSlop={8}>
            <ClearIcon width={18} height={18} />
          </Pressable>
        ) : null}
      </View>

      {!isSearching ? (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>최근 검색어</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>최근 검색어가 없어요.</Text>
          ) : (
            <View style={styles.historyChips}>
              {history.map((term) => (
                <Pressable key={term} style={styles.historyChip} onPress={() => setQuery(term)}>
                  <Text style={styles.historyChipText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : isLoadingResults ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
        </View>
      ) : isResultsError ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>검색에 실패했어요. 다시 시도해주세요.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetchResults()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={results.length === 0 ? styles.emptyContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>검색 결과가 없어요.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.resultCard} onPress={() => openResult(item)}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {item.title || item.name}
              </Text>
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.resultMetaRow}>
                <Text style={styles.resultMeta}>{item.authorNickname}</Text>
                <Text style={styles.resultMeta}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.resultMeta}>♡ {item.likeCount}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: layout.screenPadding,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingRight: 40,
    backgroundColor: colors.bg[0],
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...typography.body4,
    color: colors.gray[800],
  },
  clearButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  historySection: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 20,
  },
  historyTitle: {
    ...typography.body3,
    color: colors.gray[700],
    marginBottom: 10,
  },
  historyChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  historyChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.bg[0],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  historyChipText: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  emptyText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 80,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.primary[400],
  },
  retryButtonText: {
    ...typography.caption1,
    color: colors.base[0],
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 5,
  },
  emptyContent: {
    flexGrow: 1,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  resultTitle: {
    ...typography.body3,
    color: colors.gray[800],
    marginBottom: 4,
  },
  resultDescription: {
    ...typography.body4,
    color: colors.gray[600],
    marginBottom: 8,
  },
  resultMetaRow: {
    flexDirection: "row",
    gap: 12,
  },
  resultMeta: {
    ...typography.caption2,
    color: colors.gray[600],
  },
});

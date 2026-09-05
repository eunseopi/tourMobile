import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useScrollToTop } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type {
  MainTabParamList,
  RootStackParamList,
} from "src/app/navigation/types";
import { communityApi } from "src/api/community";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { NotificationBellButton } from "src/components/navigation/NotificationBellButton";
import { FadeSlideIn } from "src/components/ui/FadeSlideIn";
import { PressableScale } from "src/components/ui/PressableScale";
import { useCommunityBanners } from "src/features/community/useCommunityBanners";
import { useCommunityPosts } from "src/features/community/useCommunityPosts";
import type { SpotPage } from "src/reducer/types";
import { useCommunityStore } from "src/stores/communityStore";
import { useReportedContentStore } from "src/stores/reportedContentStore";
import { useTabBarHeight } from "src/utils/lib/useTabBarHeight";
import SearchIcon from "src/assets/Search.svg";
import WriteIcon from "src/assets/Icons.svg";
import { CommunityHeader } from "./components/CommunityHeader";
import { PostCard } from "./components/PostCard";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Community">,
  NativeStackScreenProps<RootStackParamList>
>;

type PostItem = SpotPage["content"][number];

export default function CommunityScreen({ navigation }: Props) {
  const listRef = useRef<FlatList<SpotPage["content"][number]>>(null);
  useScrollToTop(listRef);
  const tabBarHeight = useTabBarHeight();
  const queryClient = useQueryClient();
  const activeTab = useCommunityStore((state) => state.activeTab);
  const currentPage = useCommunityStore((state) => state.currentPage);
  const typeFilter = useCommunityStore((state) => state.typeFilter);
  const setActiveTab = useCommunityStore((state) => state.setActiveTab);
  const setTypeFilter = useCommunityStore((state) => state.setTypeFilter);

  const {
    data: postPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useCommunityPosts(activeTab, currentPage, 20, typeFilter);
  const { data: banners = [] } = useCommunityBanners();
  const reportedPostIds = useReportedContentStore(
    (state) => state.reportedPostIds
  );
  // /latest, /most-liked는 서버 쿼리에서 이미 관광공사(TourAPI) 데이터를 제외하고
  // 유저 작성 글만 내려준다.
  const posts = (postPage?.content ?? []).filter(
    (post) => !reportedPostIds.includes(post.id)
  );

  const likeMutation = useMutation({
    mutationFn: async ({ id, liked }: { id: number; liked: boolean }) => {
      if (liked) await communityApi.likeSpot(id);
      else await communityApi.unlikeSpot(id);
      return { id, liked };
    },
    onMutate: async ({ id, liked }) => {
      await queryClient.cancelQueries({ queryKey: ["GET /api/spots"] });
      const previous = queryClient.getQueriesData<SpotPage>({
        queryKey: ["GET /api/spots"],
      });

      queryClient.setQueriesData<SpotPage>(
        { queryKey: ["GET /api/spots"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((item) =>
              item.id === id
                ? {
                    ...item,
                    likedByMe: liked,
                    likeCount: liked
                      ? item.likeCount + 1
                      : Math.max(0, item.likeCount - 1),
                  }
                : item
            ),
          };
        }
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      Alert.alert("좋아요 실패", "잠시 후 다시 시도해주세요.");
    },
    onSettled: (_data, error) => {
      if (error) return;
      void queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          (query.queryKey[0] === "nearbySpots" ||
            query.queryKey[0] === "mapSearch"),
      });
    },
  });

  // PostCard를 memo로 감싸도, renderItem이 매번 새 화살표 함수를 넘기면 의미가 없다.
  // likeMutation은 매 렌더마다 새 객체일 수 있어 ref로 최신 값만 참조하고, 콜백 자체는
  // 고정된 참조를 유지해 변경되지 않은 카드는 리렌더를 건너뛰도록 한다.
  const likeMutationRef = useRef(likeMutation);
  likeMutationRef.current = likeMutation;

  const handlePostPress = useCallback(
    (post: PostItem) => {
      if (post.type === "CHALLENGE") {
        navigation.navigate("Main", { screen: "Challenge" });
      } else if (post.type === "SPOT") {
        navigation.navigate("SpotDetail", { spotId: post.id });
      } else {
        navigation.navigate("PostDetail", { postId: post.id });
      }
    },
    [navigation]
  );

  const handleToggleLike = useCallback((post: PostItem) => {
    const mutation = likeMutationRef.current;
    // 연타로 같은 게시글에 좋아요/취소가 겹쳐 들어가면 서버에서 충돌로
    // 실패하는 경우가 있어, 해당 게시글에 이미 요청이 진행 중이면 무시한다.
    if (mutation.isPending && mutation.variables?.id === post.id) return;
    mutation.mutate({ id: post.id, liked: !post.likedByMe });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: PostItem; index: number }) => (
      <FadeSlideIn delay={Math.min(index, 8) * 40}>
        <PostCard post={item} onPress={handlePostPress} onToggleLike={handleToggleLike} />
      </FadeSlideIn>
    ),
    [handlePostPress, handleToggleLike]
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="커뮤니티" showBack={false} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
          <Text style={styles.mutedText}>게시글을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="커뮤니티" showBack={false} />
        <View style={styles.center}>
          <Text style={styles.errorText}>게시글을 불러오지 못했어요.</Text>
          <PressableScale
            style={commonStyles.primaryButton}
            onPress={() => refetch()}
          >
            <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="커뮤니티"
        showBack={false}
        right={
          <View style={styles.headerActions}>
            <Pressable
              hitSlop={8}
              onPress={() => navigation.navigate("CommunitySearch")}
            >
              <SearchIcon width={22} height={22} />
            </Pressable>
            <NotificationBellButton />
          </View>
        }
      />
      <FlatList
        ref={listRef}
        style={styles.container}
        data={posts}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={styles.headerPadding}>
            <CommunityHeader
              activeTab={activeTab}
              banners={banners}
              typeFilter={typeFilter}
              onChangeTab={setActiveTab}
              onChangeTypeFilter={setTypeFilter}
            />
          </View>
        }
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight - 70 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.mutedText}>게시물이 없습니다.</Text>
          </View>
        }
        renderItem={renderItem}
      />

      <PressableScale
        style={[styles.fab]}
        onPress={() => navigation.navigate("PostWrite")}
      >
        <WriteIcon width={26} height={26} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  content: {},
  headerPadding: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
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
    paddingVertical: 80,
    alignItems: "center",
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
  fab: {
    position: "absolute",
    right: 17,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
    ...shadow.card,
  },
});

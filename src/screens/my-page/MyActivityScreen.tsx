import { useState, type ReactElement } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { communityApi } from "src/api/community";
import type { MyCommentItem } from "src/api/mypage";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { colors, layout, typography } from "src/design/theme";
import { useMyComments, useMyLikedSpots, useMyPosts } from "src/features/my-page/useMyActivity";
import type { Spot } from "src/reducer/types";
import { MyActivityCommentCard } from "./components/MyActivityCommentCard";
import { MyActivityPostCard } from "./components/MyActivityPostCard";

type ActivityTab = "posts" | "comments" | "liked";

const TAB_ITEMS: Array<{ key: ActivityTab; label: string }> = [
  { key: "posts", label: "내가 쓴 글" },
  { key: "comments", label: "내가 쓴 댓글" },
  { key: "liked", label: "좋아요한 글" },
];

type Props = NativeStackScreenProps<RootStackParamList, "MyActivity">;

export default function MyActivityScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<ActivityTab>("posts");

  const openPost = (post: Spot) => {
    if (post.type === "CHALLENGE") {
      navigation.navigate("Main", { screen: "Challenge" });
    } else if (post.type === "SPOT") {
      navigation.navigate("SpotDetail", { spotId: post.id });
    } else {
      navigation.navigate("PostDetail", { postId: post.id });
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="내 활동" />
      <View style={styles.tabs}>
        {TAB_ITEMS.map((item) => {
          const active = item.key === activeTab;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => setActiveTab(item.key)}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === "posts" ? (
        <PostsTab onOpenPost={openPost} />
      ) : activeTab === "liked" ? (
        <LikedTab onOpenPost={openPost} />
      ) : (
        <CommentsTab onOpenComment={(comment) => navigation.navigate("PostDetail", { postId: comment.contentId })} />
      )}
    </View>
  );
}

function PostsTab({ onOpenPost }: { onOpenPost: (post: Spot) => void }) {
  const { items, isLoading, isError, hasMore, isLoadingMore, loadMore, refetch, patchItem } =
    useMyPosts("latest");

  const handleToggleLike = (post: Spot) => {
    const nextLiked = !post.likedByMe;
    patchItem(post.id, (item) => ({
      ...item,
      likedByMe: nextLiked,
      likeCount: nextLiked ? item.likeCount + 1 : Math.max(0, item.likeCount - 1),
    }));
    void (nextLiked ? communityApi.likeSpot(post.id) : communityApi.unlikeSpot(post.id));
  };

  return (
    <ActivityList
      items={items}
      isLoading={isLoading}
      isError={isError}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMore}
      onRefresh={refetch}
      emptyText="아직 작성한 글이 없어요."
      keyExtractor={(item) => `post-${item.id}`}
      renderItem={(item) => (
        <MyActivityPostCard
          post={item}
          onPress={() => onOpenPost(item)}
          onToggleLike={() => handleToggleLike(item)}
        />
      )}
    />
  );
}

function LikedTab({ onOpenPost }: { onOpenPost: (post: Spot) => void }) {
  const { items, isLoading, isError, hasMore, isLoadingMore, loadMore, refetch, patchItem } =
    useMyLikedSpots();

  const handleToggleLike = (post: Spot) => {
    const nextLiked = !post.likedByMe;
    patchItem(post.id, (item) => ({
      ...item,
      likedByMe: nextLiked,
      likeCount: nextLiked ? item.likeCount + 1 : Math.max(0, item.likeCount - 1),
    }));
    void (nextLiked ? communityApi.likeSpot(post.id) : communityApi.unlikeSpot(post.id));
  };

  return (
    <ActivityList
      items={items}
      isLoading={isLoading}
      isError={isError}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMore}
      onRefresh={refetch}
      emptyText="좋아요한 글이 없어요."
      keyExtractor={(item) => `liked-${item.id}`}
      renderItem={(item) => (
        <MyActivityPostCard
          post={item}
          onPress={() => onOpenPost(item)}
          onToggleLike={() => handleToggleLike(item)}
        />
      )}
    />
  );
}

function CommentsTab({ onOpenComment }: { onOpenComment: (comment: MyCommentItem) => void }) {
  const { items, isLoading, isError, hasMore, isLoadingMore, loadMore, refetch } = useMyComments();

  return (
    <ActivityList
      items={items}
      isLoading={isLoading}
      isError={isError}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMore}
      onRefresh={refetch}
      emptyText="아직 작성한 댓글이 없어요."
      keyExtractor={(item) => `comment-${item.id}`}
      renderItem={(item) => <MyActivityCommentCard comment={item} onPress={() => onOpenComment(item)} />}
    />
  );
}

function ActivityList<T>({
  items,
  isLoading,
  isError,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onRefresh,
  emptyText,
  keyExtractor,
  renderItem,
}: {
  items: T[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  emptyText: string;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactElement;
}) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[400]} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>목록을 불러오지 못했어요.</Text>
        <Pressable style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      contentContainerStyle={items.length === 0 ? styles.emptyContent : styles.listContent}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      onEndReachedThreshold={0.4}
      onEndReached={onLoadMore}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={colors.primary[400]} />
          </View>
        ) : null
      }
      renderItem={({ item }) => renderItem(item)}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.bg[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.primary[400],
  },
  tabText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  activeTabText: {
    ...typography.body3,
    color: colors.primary[400],
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 10,
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  footerLoading: {
    paddingVertical: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
  retryButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  retryButtonText: {
    ...typography.body3,
    color: colors.base[0],
  },
});

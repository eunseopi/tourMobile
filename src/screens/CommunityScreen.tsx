import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { communityApi } from "src/api/community";
import { useCommunityBanners } from "src/features/community/useCommunityBanners";
import { useCommunityPosts } from "src/features/community/useCommunityPosts";
import type { Spot, SpotPage } from "src/reducer/types";
import { useCommunityStore } from "src/stores/communityStore";
import { formatDate } from "src/utils/formDate";

type Props = NativeStackScreenProps<RootStackParamList, "Community">;
type CommunityTab = "latest" | "popular";

const TAB_ITEMS: Array<{ key: CommunityTab; label: string }> = [
  { key: "latest", label: "최신순" },
  { key: "popular", label: "인기순" },
];

export default function CommunityScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const activeTab = useCommunityStore((state) => state.activeTab);
  const currentPage = useCommunityStore((state) => state.currentPage);
  const setActiveTab = useCommunityStore((state) => state.setActiveTab);

  const {
    data: postPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useCommunityPosts(activeTab, currentPage, 20);
  const { data: banners = [] } = useCommunityBanners();
  const posts = postPage?.content ?? [];

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
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots"] });
    },
  });

  const renderHeader = () => (
    <View>
      <Text style={styles.title}>커뮤니티</Text>

      {banners.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerList}
        >
          {banners.map((banner) => (
            <View key={String(banner.id)} style={styles.bannerCard}>
              {banner.imageUrl ? (
                <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
              ) : null}
              {banner.title ? (
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {banner.title}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.tabs}>
        {TAB_ITEMS.map((item) => {
          const active = item.key === activeTab;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => setActiveTab(item.key)}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>게시글을 불러오지 못했어요.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={posts}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.mutedText}>게시물이 없습니다.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
          onToggleLike={() =>
            likeMutation.mutate({ id: item.id, liked: !item.likedByMe })
          }
        />
      )}
    />
  );
}

function PostCard({
  post,
  onPress,
  onToggleLike,
}: {
  post: Spot;
  onPress: () => void;
  onToggleLike: () => void;
}) {
  const firstImage = post.imageUrls?.[0];

  return (
    <Pressable style={styles.postCard} onPress={onPress}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          {post.userProfile ? (
            <Image source={{ uri: post.userProfile }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {(post.userNickname || "제").slice(0, 1)}
            </Text>
          )}
        </View>
        <View style={styles.authorBox}>
          <Text style={styles.author}>{post.userNickname || "익명"}</Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>
      </View>

      {firstImage ? (
        <Image source={{ uri: firstImage }} style={styles.postImage} />
      ) : null}

      <Text style={styles.spotName} numberOfLines={1}>
        {post.name}
      </Text>
      <Text style={styles.description} numberOfLines={3}>
        {post.description}
      </Text>

      <Pressable style={styles.likeButton} onPress={onToggleLike}>
        <Text style={[styles.likeText, post.likedByMe && styles.likedText]}>
          {post.likedByMe ? "♥" : "♡"} 좋아요 {post.likeCount || 0}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#191919",
  },
  bannerList: {
    gap: 12,
    paddingVertical: 16,
  },
  bannerCard: {
    width: 280,
    height: 112,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff4ec",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerTitle: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    fontSize: 16,
    fontWeight: "900",
    color: "#fff",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
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
  postCard: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#fafafa",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e8e8e8",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#ffccaa",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  authorBox: {
    flex: 1,
    marginLeft: 10,
  },
  author: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
  },
  date: {
    marginTop: 3,
    fontSize: 12,
    color: "#888",
  },
  postImage: {
    width: "100%",
    aspectRatio: 1.45,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#eee",
  },
  spotName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "900",
    color: "#222",
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
  },
  likeButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e2e2",
  },
  likeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#555",
  },
  likedText: {
    color: "#ff8b4c",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  emptyBox: {
    paddingVertical: 80,
    alignItems: "center",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
  errorText: {
    color: "#d33",
  },
  retryButton: {
    marginTop: 14,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});

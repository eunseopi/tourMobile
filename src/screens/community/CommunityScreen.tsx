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
import type { RootStackParamList } from "src/app/navigation/types";
import { communityApi } from "src/api/community";
import { useCommunityBanners } from "src/features/community/useCommunityBanners";
import { useCommunityPosts } from "src/features/community/useCommunityPosts";
import type { Spot, SpotPage } from "src/reducer/types";
import { useCommunityStore } from "src/stores/communityStore";
import { formatDate } from "src/utils/formDate";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";

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
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>게시글을 불러오지 못했어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
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

      <Pressable style={styles.fab} onPress={() => navigation.navigate("PostWrite")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
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

      {post.imageUrls?.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageContainer}
        >
          {post.imageUrls.map((image, index) => (
            <Image key={`${image}-${index}`} source={{ uri: image }} style={styles.postImage} />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.contentSection}>
        <View style={styles.locationTag}>
          <Text style={styles.locationIcon}>⌖</Text>
          <Text style={styles.locationText} numberOfLines={1}>{post.name}</Text>
        </View>
        <Text style={styles.description} numberOfLines={3}>
          {post.description}
        </Text>
      </View>

      <View style={styles.actionSection}>
        <Pressable style={styles.actionButton} onPress={onToggleLike}>
          <Text style={[styles.actionText, post.likedByMe && styles.likedText]}>
            {post.likedByMe ? "♥" : "♡"} 좋아요 {post.likeCount || 0}
          </Text>
        </Pressable>
        <View style={styles.actionDivider} />
        <View style={styles.actionButton}>
          <Text style={styles.actionText}>댓글 보기</Text>
        </View>
      </View>
    </Pressable>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 96,
    gap: 20,
  },
  title: {
    ...typography.head2,
    color: colors.gray[800],
    marginBottom: 4,
  },
  bannerList: {
    gap: 12,
    paddingVertical: 16,
  },
  bannerCard: {
    width: 280,
    height: 112,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.primary[50],
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
    ...typography.body1,
    color: colors.base[0],
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.bg[0],
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  activeTab: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary[400],
  },
  tabText: {
    ...typography.body1,
    fontWeight: "400",
    color: colors.gray[500],
  },
  activeTabText: {
    fontWeight: "600",
    color: colors.primary[400],
  },
  postCard: {
    paddingTop: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[100],
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    ...typography.body3,
    color: colors.gray[500],
  },
  authorBox: {
    flex: 1,
    marginLeft: 9,
    gap: 2,
  },
  author: {
    ...typography.body3,
    color: colors.gray[800],
  },
  date: {
    ...typography.caption2,
    color: colors.gray[400],
  },
  imageContainer: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  postImage: {
    width: 130,
    height: 130,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[100],
  },
  contentSection: {
    gap: 12,
    paddingTop: 7,
    paddingBottom: 12,
  },
  locationTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: 50,
    backgroundColor: colors.gray[100],
  },
  locationIcon: {
    ...typography.caption1,
    color: colors.gray[400],
  },
  locationText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  description: {
    ...typography.body4,
    color: colors.gray[600],
  },
  actionSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
  },
  actionButton: {
    flex: 1,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDivider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    backgroundColor: colors.gray[200],
  },
  actionText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  likedText: {
    color: colors.primary[400],
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
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
  fab: {
    position: "absolute",
    right: 17,
    bottom: 96,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
    ...shadow.card,
  },
  fabText: {
    fontSize: 28,
    fontWeight: "400",
    color: colors.base[0],
    marginTop: -2,
  },
});

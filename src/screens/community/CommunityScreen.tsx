import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MainTabParamList, RootStackParamList } from "src/app/navigation/types";
import { communityApi } from "src/api/community";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { useCommunityBanners } from "src/features/community/useCommunityBanners";
import { useCommunityPosts } from "src/features/community/useCommunityPosts";
import type { SpotPage } from "src/reducer/types";
import { useCommunityStore } from "src/stores/communityStore";
import WriteIcon from "src/assets/Icons.svg";
import { CommunityHeader } from "./components/CommunityHeader";
import { PostCard } from "./components/PostCard";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Community">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CommunityScreen({ navigation }: Props) {
  const tabBarHeight = useBottomTabBarHeight();
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
    onSettled: (_data, error) => {
      if (error) return;
      void queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          (query.queryKey[0] === "nearbySpots" || query.queryKey[0] === "mapSearch"),
      });
    },
  });

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
          <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
            <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="커뮤니티" showBack={false} />
      <FlatList
        style={styles.container}
        data={posts}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <CommunityHeader
            activeTab={activeTab}
            banners={banners}
            onChangeTab={setActiveTab}
          />
        }
        contentContainerStyle={[styles.content, { paddingBottom: 24 + tabBarHeight }]}
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

      <Pressable style={[styles.fab, { bottom: 8 + tabBarHeight }]} onPress={() => navigation.navigate("PostWrite")}>
        <WriteIcon width={26} height={26} />
      </Pressable>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 96,
    gap: 20,
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
});

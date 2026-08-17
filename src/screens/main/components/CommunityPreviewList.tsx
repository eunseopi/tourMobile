import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import type { Spot } from "src/reducer/types";
import DefaultProfile from "src/assets/default_profile.svg";
import LocationIcon from "src/assets/Location.svg";
import { SectionState } from "./HomeSection";

type Props = {
  isLoading: boolean;
  posts: Spot[];
  onPressPost: (post: Spot) => void;
};

export function CommunityPreviewList({ isLoading, posts, onPressPost }: Props) {
  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.centerText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (posts.length === 0) return <SectionState>아직 게시글이 없어요.</SectionState>;

  return (
    <>
      {posts.map((post) => (
        <Pressable key={post.id} style={styles.postPreview} onPress={() => onPressPost(post)}>
          {post.imageUrls?.[0] ? (
            <Image
              source={{ uri: post.imageUrls[0] }}
              style={styles.postPreviewImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View style={[styles.postPreviewImage, styles.postPreviewFallback]}>
              <Text style={styles.postPreviewFallbackText}>POST</Text>
            </View>
          )}
          <View style={styles.postPreviewText}>
            <View style={styles.titleRow}>
              <LocationIcon width={12} height={12} />
              <Text style={styles.postPreviewTitle} numberOfLines={1}>{post.name}</Text>
            </View>
            <Text style={styles.postPreviewBody} numberOfLines={2}>
              {post.description || "제주 스팟 이야기를 확인해보세요."}
            </Text>
            <View style={styles.postPreviewFooter}>
              <View style={styles.avatar}>
                {post.userProfile ? (
                  <Image
                    source={{ uri: post.userProfile }}
                    style={styles.avatarImage}
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <DefaultProfile width={14} height={14} />
                )}
              </View>
              <Text style={styles.postPreviewMeta} numberOfLines={1}>
                {post.userNickname} · 좋아요 {post.likeCount}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  centerBox: { paddingVertical: 22, alignItems: "center", justifyContent: "center" },
  centerText: { ...typography.body4, color: colors.gray[600], marginTop: 10 },
  postPreview: { flexDirection: "row", marginTop: 12, minHeight: 92, gap: 12 },
  postPreviewImage: {
    width: 92,
    height: 92,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  postPreviewFallback: { alignItems: "center", justifyContent: "center" },
  postPreviewFallbackText: { ...typography.caption1, color: colors.gray[600] },
  postPreviewText: { flex: 1, justifyContent: "center", gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  postPreviewTitle: { ...typography.body3, color: colors.gray[800], flexShrink: 1 },
  postPreviewBody: { ...typography.caption2, color: colors.gray[600] },
  postPreviewFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  avatarImage: { width: "100%", height: "100%" },
  postPreviewMeta: { ...typography.caption2, color: colors.gray[600], flexShrink: 1 },
});

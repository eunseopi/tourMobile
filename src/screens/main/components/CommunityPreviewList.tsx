import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import type { Spot } from "src/reducer/types";
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
            <Image source={{ uri: post.imageUrls[0] }} style={styles.postPreviewImage} />
          ) : (
            <View style={[styles.postPreviewImage, styles.postPreviewFallback]}>
              <Text style={styles.postPreviewFallbackText}>POST</Text>
            </View>
          )}
          <View style={styles.postPreviewText}>
            <Text style={styles.postPreviewTitle} numberOfLines={1}>{post.name}</Text>
            <Text style={styles.postPreviewBody} numberOfLines={2}>
              {post.description || "제주 스팟 이야기를 확인해보세요."}
            </Text>
            <Text style={styles.postPreviewMeta}>
              {post.userNickname} · 좋아요 {post.likeCount}
            </Text>
          </View>
        </Pressable>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  centerBox: { paddingVertical: 22, alignItems: "center", justifyContent: "center" },
  centerText: { ...typography.body4, color: colors.gray[500], marginTop: 10 },
  postPreview: { flexDirection: "row", marginTop: 12, minHeight: 92, gap: 12 },
  postPreviewImage: { width: 92, height: 92, borderRadius: 8, backgroundColor: colors.gray[200] },
  postPreviewFallback: { alignItems: "center", justifyContent: "center" },
  postPreviewFallbackText: { ...typography.caption1, color: colors.gray[400] },
  postPreviewText: { flex: 1, justifyContent: "center" },
  postPreviewTitle: { ...typography.body3, color: colors.gray[800] },
  postPreviewBody: { ...typography.caption2, color: colors.gray[600], marginTop: 6 },
  postPreviewMeta: { ...typography.caption2, color: colors.gray[400], marginTop: 8 },
});

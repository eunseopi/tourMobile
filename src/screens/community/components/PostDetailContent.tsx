import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PostDetailProps } from "src/components/community/PostDetail/types";
import { colors, typography } from "src/design/theme";
import { formatDate } from "src/utils/formDate";

type Props = {
  post: PostDetailProps;
  isLiking: boolean;
  onToggleLike: () => void;
};

export function PostDetailContent({ post, isLiking, onToggleLike }: Props) {
  return (
    <>
      <Text style={styles.title}>{post.name}</Text>
      {post.imageUrls?.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sliderWrapper}>
          {post.imageUrls.map((image, index) => (
            <Image key={`${image}-${index}`} source={{ uri: image }} style={styles.slideImage} />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.postWrapper}>
        <Text style={styles.meta}>
          {post.userNickname || "익명"} · {formatDate(post.createdAt)}
        </Text>
        <Text style={styles.description}>{post.description}</Text>
        <Pressable style={styles.likeButton} onPress={onToggleLike} disabled={isLiking}>
          <Text style={[styles.likeText, post.likedByMe && styles.likedText]}>
            {post.likedByMe ? "♥" : "♡"} 좋아요 {post.likeCount ?? 0}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.head2,
    color: colors.gray[800],
    paddingLeft: 20,
    paddingTop: 10,
  },
  sliderWrapper: {
    gap: 10,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  slideImage: {
    width: 260,
    height: 260,
    borderRadius: 8,
    backgroundColor: colors.gray[300],
  },
  postWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
  meta: {
    ...typography.caption2,
    color: colors.gray[400],
  },
  description: {
    ...typography.body4,
    color: colors.gray[700],
    paddingVertical: 10,
  },
  likeButton: {
    alignSelf: "flex-start",
    minHeight: 36,
    justifyContent: "center",
  },
  likeText: {
    ...typography.body3,
    color: colors.gray[500],
  },
  likedText: {
    color: colors.primary[400],
  },
});

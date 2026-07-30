import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PostDetailProps } from "src/components/community/PostDetail/types";
import { colors, typography } from "src/design/theme";
import { formatDate } from "src/utils/formDate";
import DefaultProfile from "src/assets/default_profile.svg";

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
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            {post.userProfile ? (
              <Image source={{ uri: post.userProfile }} style={styles.avatarImage} />
            ) : (
              <DefaultProfile width={40} height={40} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.author}>{post.userNickname || "익명"}</Text>
            <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>
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
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
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
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 10,
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
  profileInfo: {
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

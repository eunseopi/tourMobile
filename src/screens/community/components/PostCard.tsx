import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";
import type { Spot } from "src/reducer/types";
import { formatDate } from "src/utils/formDate";

type Props = {
  post: Spot;
  onPress: () => void;
  onToggleLike: () => void;
};

export function PostCard({ post, onPress, onToggleLike }: Props) {
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
        <Pressable
          style={styles.actionButton}
          onPress={(event) => {
            event.stopPropagation();
            onToggleLike();
          }}
        >
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
});

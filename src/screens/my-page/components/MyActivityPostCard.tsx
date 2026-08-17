import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";
import type { Spot } from "src/reducer/types";
import { formatDate } from "src/utils/formDate";

type Props = {
  post: Spot;
  onPress: () => void;
  onToggleLike: () => void;
};

export function MyActivityPostCard({ post, onPress, onToggleLike }: Props) {
  const thumbnail = post.imageUrls?.[0];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {post.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {post.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
          <Pressable
            style={styles.likeButton}
            onPress={(event) => {
              event.stopPropagation();
              onToggleLike();
            }}
          >
            <Text style={[styles.likeText, post.likedByMe && styles.likedText]}>
              {post.likedByMe ? "♥" : "♡"} {post.likeCount || 0}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  thumbnailPlaceholder: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.body3,
    color: colors.gray[800],
  },
  description: {
    ...typography.body4,
    color: colors.gray[600],
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  date: {
    ...typography.caption2,
    color: colors.gray[600],
  },
  likeButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  likeText: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  likedText: {
    color: colors.primary[400],
  },
});

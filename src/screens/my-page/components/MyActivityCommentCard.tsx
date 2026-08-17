import { Pressable, StyleSheet, Text } from "react-native";
import type { MyCommentItem } from "src/api/mypage";
import { colors, shadow, typography } from "src/design/theme";

type Props = {
  comment: MyCommentItem;
  onPress: () => void;
};

export function MyActivityCommentCard({ comment, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.text} numberOfLines={3}>
        {comment.isDeleted ? "삭제된 댓글이에요." : comment.text}
      </Text>
      <Text style={styles.date}>
        {comment.depth > 0 ? "답글 · " : ""}
        {comment.relativeTime}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  text: {
    ...typography.body4,
    color: colors.gray[700],
    lineHeight: 20,
  },
  date: {
    ...typography.caption2,
    color: colors.gray[600],
  },
});

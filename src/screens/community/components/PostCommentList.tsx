import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { SpotComment } from "src/components/community/Comment/types";
import { colors, typography } from "src/design/theme";
import { formatDate } from "src/utils/formDate";

type Props = {
  comments: SpotComment[];
  isLoading: boolean;
  onRefresh: () => void;
  onReply: (comment: SpotComment) => void;
};

export function PostCommentList({ comments, isLoading, onRefresh, onReply }: Props) {
  return (
    <>
      <View style={styles.commentHeader}>
        <Text style={styles.commentTitle}>댓글 {comments.length}</Text>
        <Pressable onPress={onRefresh}>
          <Text style={styles.refreshText}>새로고침</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.commentsLoading}>
          <ActivityIndicator color={colors.primary[400]} />
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyComments}>
          <Text style={styles.mutedText}>아직 댓글이 없어요.</Text>
        </View>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={`${comment.parentReplyId ?? "root"}-${comment.id}`}
            comment={comment}
            onReply={() => onReply(comment)}
          />
        ))
      )}
    </>
  );
}

function CommentItem({ comment, onReply }: { comment: SpotComment; onReply: () => void }) {
  const isReply = comment.parentReplyId != null;

  return (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentAvatar}>
        {comment.userProfile ? (
          <Image source={{ uri: comment.userProfile }} style={styles.commentAvatarImage} />
        ) : (
          <Text style={styles.commentAvatarText}>{(comment.userNickname || "익").slice(0, 1)}</Text>
        )}
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentMetaRow}>
          <Text style={styles.commentAuthor}>{comment.userNickname || "익명"}</Text>
          {comment.createdAt ? <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text> : null}
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        {!isReply ? (
          <Pressable style={styles.replyButton} onPress={onReply}>
            <Text style={styles.replyButtonText}>답글</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg[50],
  },
  commentTitle: {
    ...typography.head4,
    color: colors.gray[800],
  },
  refreshText: {
    ...typography.caption1,
    color: colors.primary[400],
  },
  commentsLoading: {
    paddingVertical: 32,
  },
  emptyComments: {
    paddingVertical: 36,
    alignItems: "center",
    backgroundColor: colors.bg[50],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.bg[0],
  },
  replyItem: {
    paddingLeft: 62,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[100],
  },
  commentAvatarImage: {
    width: "100%",
    height: "100%",
  },
  commentAvatarText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  commentBody: {
    flex: 1,
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAuthor: {
    ...typography.body3,
    color: colors.gray[800],
  },
  commentDate: {
    ...typography.caption2,
    color: colors.gray[400],
  },
  commentText: {
    ...typography.body4,
    color: colors.gray[700],
    marginTop: 5,
  },
  replyButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  replyButtonText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
});

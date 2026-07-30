import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { SpotComment } from "src/components/community/Comment/types";
import { colors, typography } from "src/design/theme";
import { formatDate } from "src/utils/formDate";
import DefaultProfile from "src/assets/default_profile.svg";

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
          <DefaultProfile width={40} height={40} />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.bg[0],
  },
  commentTitle: {
    ...typography.body1,
    color: colors.gray[700],
  },
  refreshText: {
    ...typography.caption1,
    color: colors.primary[400],
  },
  commentsLoading: {
    paddingVertical: 32,
  },
  emptyComments: {
    minHeight: 292,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[400],
    textAlign: "center",
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.bg[0],
  },
  replyItem: {
    paddingLeft: 62,
  },
  commentAvatar: {
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
  commentAvatarImage: {
    width: "100%",
    height: "100%",
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

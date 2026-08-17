import { useState } from "react";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type { ReportReason } from "src/api/community";
import type { SpotComment } from "src/components/community/Comment/types";
import { colors, typography } from "src/design/theme";
import { useBlockUser } from "src/features/community/useBlockUser";
import DefaultProfile from "src/assets/default_profile.svg";
import { ReportModal } from "./ReportModal";

type Props = {
  comments: SpotComment[];
  isLoading: boolean;
  onRefresh: () => void;
  onReply: (comment: SpotComment) => void;
  onToggleLike: (comment: SpotComment) => void;
  isMyComment: (comment: SpotComment) => boolean;
  onDeleteComment: (comment: SpotComment) => void;
  onUpdateComment: (comment: SpotComment, text: string) => void;
  isUpdatingComment: boolean;
  onReportComment: (comment: SpotComment, reason: ReportReason, detail: string) => void;
  isReportingComment: boolean;
};

export function PostCommentList({
  comments,
  isLoading,
  onRefresh,
  onReply,
  onToggleLike,
  isMyComment,
  onDeleteComment,
  onUpdateComment,
  isUpdatingComment,
  onReportComment,
  isReportingComment,
}: Props) {
  const [reportTarget, setReportTarget] = useState<SpotComment | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const { block } = useBlockUser();

  const handleBlock = (comment: SpotComment) => {
    if (comment.userId == null) return;
    const nickname = comment.nickname || "이 사용자";
    Alert.alert(
      "사용자 차단",
      `${nickname}님을 차단할까요?\n차단하면 이 사용자의 글과 댓글이 더 이상 보이지 않아요.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "차단하기",
          style: "communityBlock",
          onPress: () => {
            block.mutate(comment.userId!, {
              onSuccess: () => Alert.alert("차단 완료", `${nickname}님을 차단했어요.`),
              onError: () => Alert.alert("차단 실패", "잠시 후 다시 시도해주세요."),
            });
          },
        },
      ]
    );
  };

  const handleDelete = (comment: SpotComment) => {
    Alert.alert("댓글 삭제", "댓글을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "communityDelete", onPress: () => onDeleteComment(comment) },
    ]);
  };

  const startEdit = (comment: SpotComment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = (comment: SpotComment) => {
    const value = editText.trim();
    if (!value) return;
    onUpdateComment(comment, value);
    setEditingId(null);
    setEditText("");
  };

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
            isMine={isMyComment(comment)}
            isEditing={editingId === comment.id}
            editText={editText}
            isSavingEdit={isUpdatingComment}
            onChangeEditText={setEditText}
            onStartEdit={() => startEdit(comment)}
            onCancelEdit={cancelEdit}
            onSaveEdit={() => saveEdit(comment)}
            onReply={() => onReply(comment)}
            onToggleLike={() => onToggleLike(comment)}
            onDelete={() => handleDelete(comment)}
            onReport={() => setReportTarget(comment)}
            onBlock={comment.userId != null ? () => handleBlock(comment) : undefined}
          />
        ))
      )}

      <ReportModal
        visible={!!reportTarget}
        targetLabel="댓글"
        isSubmitting={isReportingComment}
        onClose={() => setReportTarget(null)}
        onSubmit={(reason, detail) => {
          if (reportTarget) onReportComment(reportTarget, reason, detail);
          setReportTarget(null);
        }}
      />
    </>
  );
}

function CommentItem({
  comment,
  isMine,
  isEditing,
  editText,
  isSavingEdit,
  onChangeEditText,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onReply,
  onToggleLike,
  onDelete,
  onReport,
  onBlock,
}: {
  comment: SpotComment;
  isMine: boolean;
  isEditing: boolean;
  editText: string;
  isSavingEdit: boolean;
  onChangeEditText: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onReply: () => void;
  onToggleLike: () => void;
  onDelete: () => void;
  onReport: () => void;
  onBlock?: () => void;
}) {
  const isReply = comment.parentReplyId != null;

  return (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentAvatar}>
        {comment.profileImageUrl ? (
          <Image
            source={{ uri: comment.profileImageUrl }}
            style={styles.commentAvatarImage}
            cachePolicy="memory-disk"
            transition={150}
          />
        ) : (
          <DefaultProfile width={40} height={40} />
        )}
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentMetaRow}>
          <Text style={styles.commentAuthor}>{comment.nickname || "익명"}</Text>
          {comment.relativeTime ? <Text style={styles.commentDate}>{comment.relativeTime}</Text> : null}
        </View>

        {isEditing ? (
          <View style={styles.editBox}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={onChangeEditText}
              multiline
              autoFocus
            />
            <View style={styles.editActionRow}>
              <Pressable style={styles.replyButton} onPress={onCancelEdit} hitSlop={8}>
                <Text style={styles.replyButtonText}>취소</Text>
              </Pressable>
              <Pressable style={styles.replyButton} onPress={onSaveEdit} disabled={isSavingEdit} hitSlop={8}>
                <Text style={[styles.replyButtonText, styles.saveButtonText]}>
                  {isSavingEdit ? "저장 중..." : "저장"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.commentText}>{comment.isDeleted ? "삭제된 댓글이에요." : comment.text}</Text>
            {!comment.isDeleted ? (
              <View style={styles.commentActionRow}>
                <Pressable style={styles.commentLikeButton} onPress={onToggleLike} hitSlop={8}>
                  <Text style={[styles.commentLikeText, comment.likedByMe && styles.commentLikedText]}>
                    {comment.likedByMe ? "♥" : "♡"} {comment.likeCount ?? 0}
                  </Text>
                </Pressable>
                {!isReply ? (
                  <Pressable style={styles.replyButton} onPress={onReply} hitSlop={8}>
                    <Text style={styles.replyButtonText}>답글</Text>
                  </Pressable>
                ) : null}
                {isMine ? (
                  <>
                    <Pressable style={styles.replyButton} onPress={onStartEdit} hitSlop={8}>
                      <Text style={styles.replyButtonText}>수정</Text>
                    </Pressable>
                    <Pressable style={styles.replyButton} onPress={onDelete} hitSlop={8}>
                      <Text style={styles.replyButtonText}>삭제</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {onBlock ? (
                      <Pressable style={styles.replyButton} onPress={onBlock} hitSlop={8}>
                        <Text style={styles.replyButtonText}>차단</Text>
                      </Pressable>
                    ) : null}
                    <Pressable style={styles.replyButton} onPress={onReport} hitSlop={8}>
                      <Text style={styles.replyButtonText}>신고</Text>
                    </Pressable>
                  </>
                )}
              </View>
            ) : null}
          </>
        )}
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
    color: colors.gray[600],
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
    color: colors.gray[600],
  },
  commentText: {
    ...typography.body4,
    color: colors.gray[700],
    marginTop: 5,
  },
  commentActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  commentLikeButton: {
    minHeight: 20,
    justifyContent: "center",
  },
  commentLikeText: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  commentLikedText: {
    color: colors.primary[400],
  },
  replyButton: {
    alignSelf: "flex-start",
  },
  replyButtonText: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  editBox: {
    marginTop: 6,
    gap: 8,
  },
  editInput: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: 10,
    ...typography.body4,
    color: colors.gray[800],
    textAlignVertical: "top",
  },
  editActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  saveButtonText: {
    color: colors.primary[400],
  },
});

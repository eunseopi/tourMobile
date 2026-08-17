import { useMemo, useState } from "react";
import { Alert } from "src/components/ui/AppAlert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { communityApi, type ReportReason } from "src/api/community";
import type { SpotComment } from "src/components/community/Comment/types";
import type { PostDetailProps } from "src/components/community/PostDetail/types";
import {
  useAllComments,
  usePostComment,
  usePostReply,
  useToggleCommentLike,
} from "src/features/community/useComments";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useReportedContentStore } from "src/stores/reportedContentStore";
import { QK } from "src/utils/lib/queryKeys";

export function usePostDetailFlow(postId: number, onPostDeleted?: () => void) {
  const queryClient = useQueryClient();
  const { data: session } = useSessionMe();
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<SpotComment | null>(null);
  const markPostReported = useReportedContentStore((state) => state.reportPost);
  const markCommentReported = useReportedContentStore((state) => state.reportComment);
  const reportedCommentIds = useReportedContentStore((state) => state.reportedCommentIds);

  const postQuery = useQuery({
    queryKey: ["spotDetail", postId],
    queryFn: () => communityApi.getSpotDetail(postId).then((res) => res.data),
  });
  const commentsQuery = useAllComments(postId);
  const postComment = usePostComment(postId);
  const postReply = usePostReply();
  const toggleCommentLike = useToggleCommentLike(postId);

  const isSubmittingComment = postComment.isPending || postReply.isPending;

  const likeMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      if (liked) await communityApi.likeSpot(postId);
      else await communityApi.unlikeSpot(postId);
      return liked;
    },
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey: ["spotDetail", postId] });
      const previous = queryClient.getQueryData<PostDetailProps>(["spotDetail", postId]);

      queryClient.setQueryData<PostDetailProps>(["spotDetail", postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          likedByMe: liked,
          likeCount: liked ? (old.likeCount ?? 0) + 1 : Math.max(0, (old.likeCount ?? 0) - 1),
        };
      });

      return { previous };
    },
    onError: (_error, _liked, context) => {
      queryClient.setQueryData(["spotDetail", postId], context?.previous);
      Alert.alert("좋아요 실패", "잠시 후 다시 시도해주세요.");
    },
    onSettled: (_data, error) => {
      void queryClient.invalidateQueries({ queryKey: ["spotDetail", postId] });
      if (error) return;
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots"] });
      void queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          (query.queryKey[0] === "nearbySpots" || query.queryKey[0] === "mapSearch"),
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => communityApi.deleteSpot(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots"] });
      onPostDeleted?.();
    },
    onError: () => {
      Alert.alert("삭제 실패", "게시글을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
    },
  });

  const reportPostMutation = useMutation({
    mutationFn: ({ reason, detail }: { reason: ReportReason; detail: string }) =>
      communityApi.reportSpot(postId, reason, detail || undefined),
    onSuccess: () => {
      markPostReported(postId);
      Alert.alert("신고 접수", "신고가 접수됐어요. 검토 후 조치할게요.", [
        { text: "확인", onPress: () => onPostDeleted?.() },
      ]);
    },
    onError: () => {
      Alert.alert("신고 실패", "신고 접수에 실패했어요. 잠시 후 다시 시도해주세요.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (comment: SpotComment) => communityApi.deleteComment(postId, comment.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.allComments(postId) });
    },
    onError: () => {
      Alert.alert("삭제 실패", "댓글을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ comment, text }: { comment: SpotComment; text: string }) =>
      communityApi.updateComment(postId, comment.id, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.allComments(postId) });
    },
    onError: () => {
      Alert.alert("수정 실패", "댓글을 수정하지 못했어요. 잠시 후 다시 시도해주세요.");
    },
  });

  const reportCommentMutation = useMutation({
    mutationFn: ({
      comment,
      reason,
      detail,
    }: {
      comment: SpotComment;
      reason: ReportReason;
      detail: string;
    }) => communityApi.reportComment(postId, comment.id, reason, detail || undefined),
    onSuccess: (_data, variables) => {
      markCommentReported(variables.comment.id);
      Alert.alert("신고 접수", "신고가 접수됐어요. 검토 후 조치할게요.");
    },
    onError: () => {
      Alert.alert("신고 실패", "신고 접수에 실패했어요. 잠시 후 다시 시도해주세요.");
    },
  });

  const isMyPost = !!session && !!postQuery.data && Number(postQuery.data.userId) === session.userId;

  const handleToggleLike = () => {
    if (!postQuery.data || likeMutation.isPending) return;
    likeMutation.mutate(!postQuery.data.likedByMe);
  };

  const handleToggleCommentLike = (comment: SpotComment) => {
    toggleCommentLike.mutate({ commentId: comment.id, liked: !comment.likedByMe });
  };

  const handleSubmitComment = async () => {
    const value = commentText.trim();
    if (!value) return;

    try {
      if (replyTarget) {
        await postReply.mutateAsync({
          spotId: postId,
          parentReplyId: replyTarget.id,
          text: value,
        });
        setReplyTarget(null);
      } else {
        await postComment.mutateAsync(value);
      }
      setCommentText("");
      void commentsQuery.refetch();
    } catch (error: any) {
      Alert.alert(
        "댓글 작성 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요.",
      );
    }
  };

  const isMyComment = (comment: SpotComment) =>
    !!session &&
    (comment.userId != null
      ? comment.userId === session.userId
      : !!comment.nickname && comment.nickname === session.nickname);

  const handleDeletePost = () => deletePostMutation.mutate();
  const handleReportPost = (reason: ReportReason, detail: string) =>
    reportPostMutation.mutate({ reason, detail });
  const handleDeleteComment = (comment: SpotComment) => deleteCommentMutation.mutate(comment);
  const handleUpdateComment = (comment: SpotComment, text: string) =>
    updateCommentMutation.mutate({ comment, text });
  const handleReportComment = (comment: SpotComment, reason: ReportReason, detail: string) =>
    reportCommentMutation.mutate({ comment, reason, detail });

  const visibleComments = useMemo(
    () => (commentsQuery.data ?? []).filter((comment) => !reportedCommentIds.includes(comment.id)),
    [commentsQuery.data, reportedCommentIds]
  );

  return {
    post: postQuery.data,
    comments: visibleComments,
    commentText,
    replyTarget,
    isMyPost,
    isMyComment,
    isLoadingPost: postQuery.isLoading,
    isPostError: postQuery.isError,
    isLoadingComments: commentsQuery.isLoading,
    isLiking: likeMutation.isPending,
    isDeletingPost: deletePostMutation.isPending,
    isReportingPost: reportPostMutation.isPending,
    isReportingComment: reportCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isSubmittingComment,
    setCommentText,
    setReplyTarget,
    refetchPost: postQuery.refetch,
    refetchComments: commentsQuery.refetch,
    handleToggleLike,
    handleToggleCommentLike,
    handleSubmitComment,
    handleDeletePost,
    handleReportPost,
    handleDeleteComment,
    handleUpdateComment,
    handleReportComment,
  };
}

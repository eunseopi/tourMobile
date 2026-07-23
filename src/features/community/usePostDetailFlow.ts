import { useState } from "react";
import { Alert } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import type { SpotComment } from "src/components/community/Comment/types";
import type { PostDetailProps } from "src/components/community/PostDetail/types";
import {
  useAllComments,
  usePostComment,
  usePostReply,
} from "src/features/community/useComments";

export function usePostDetailFlow(postId: number) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<SpotComment | null>(null);

  const postQuery = useQuery({
    queryKey: ["spotDetail", postId],
    queryFn: () => communityApi.getSpotDetail(postId).then((res) => res.data),
  });
  const commentsQuery = useAllComments(postId);
  const postComment = usePostComment(postId);
  const postReply = usePostReply();

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
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["spotDetail", postId] });
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots"] });
      void queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          (query.queryKey[0] === "nearbySpots" || query.queryKey[0] === "mapSearch"),
      });
    },
  });

  const handleToggleLike = () => {
    if (!postQuery.data || likeMutation.isPending) return;
    likeMutation.mutate(!postQuery.data.likedByMe);
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

  return {
    post: postQuery.data,
    comments: commentsQuery.data ?? [],
    commentText,
    replyTarget,
    isLoadingPost: postQuery.isLoading,
    isPostError: postQuery.isError,
    isLoadingComments: commentsQuery.isLoading,
    isLiking: likeMutation.isPending,
    isSubmittingComment,
    setCommentText,
    setReplyTarget,
    refetchPost: postQuery.refetch,
    refetchComments: commentsQuery.refetch,
    handleToggleLike,
    handleSubmitComment,
  };
}

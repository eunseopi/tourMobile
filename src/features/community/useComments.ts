import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import type { SpotComment } from "src/components/community/Comment/types";
import { QK } from "src/utils/lib/queryKeys";

export function useAllComments(spotId: number) {
  return useQuery<SpotComment[]>({
    queryKey: QK.allComments(spotId),
    enabled: Number.isFinite(spotId) && spotId > 0,
    queryFn: async () => {
      const root = await communityApi.getComments(spotId);
      const replies = await Promise.all(
        root.content.map((comment) => communityApi.getReplies(spotId, comment.id))
      );

      const flat = root.content.flatMap((comment, index) => [
        comment,
        ...(replies[index]?.content ?? []),
      ]);

      const likeInfo = await Promise.all(
        flat.map((comment) =>
          Promise.all([
            communityApi.getCommentLikeCount(spotId, comment.id),
            communityApi.isCommentLikedByMe(spotId, comment.id),
          ])
        )
      );

      return flat.map((comment, index) => ({
        ...comment,
        likeCount: likeInfo[index][0],
        likedByMe: likeInfo[index][1],
      }));
    },
  });
}

export function useToggleCommentLike(spotId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, liked }: { commentId: number; liked: boolean }) => {
      if (liked) await communityApi.likeComment(spotId, commentId);
      else await communityApi.unlikeComment(spotId, commentId);
      return { commentId, liked };
    },
    onMutate: async ({ commentId, liked }) => {
      await queryClient.cancelQueries({ queryKey: QK.allComments(spotId) });
      const previous = queryClient.getQueryData<SpotComment[]>(QK.allComments(spotId));

      queryClient.setQueryData<SpotComment[]>(QK.allComments(spotId), (old) =>
        old?.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likedByMe: liked,
                likeCount: liked
                  ? (comment.likeCount ?? 0) + 1
                  : Math.max(0, (comment.likeCount ?? 0) - 1),
              }
            : comment
        )
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QK.allComments(spotId), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QK.allComments(spotId) });
    },
  });
}

export function usePostComment(spotId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => communityApi.postComment(spotId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.allComments(spotId) });
      void queryClient.invalidateQueries({ queryKey: ["spotDetail", spotId] });
    },
  });
}

export function usePostReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      spotId,
      parentReplyId,
      text,
    }: {
      spotId: number;
      parentReplyId: number;
      text: string;
    }) => communityApi.postReply(spotId, parentReplyId, text),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: QK.allComments(variables.spotId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["spotDetail", variables.spotId],
      });
    },
  });
}

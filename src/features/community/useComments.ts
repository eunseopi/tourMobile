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

      return root.content.flatMap((comment, index) => [
        comment,
        ...(replies[index]?.content ?? []),
      ]);
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

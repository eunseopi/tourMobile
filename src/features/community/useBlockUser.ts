import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userBlockApi } from "src/api/userBlock";

export function useBlockUser() {
  const queryClient = useQueryClient();

  const block = useMutation({
    mutationFn: (userId: number) => userBlockApi.block(userId),
    onSuccess: () => {
      // 차단하면 피드/검색/댓글에서 서버가 알아서 걸러주므로 관련 쿼리를 전부 새로고침한다.
      void queryClient.invalidateQueries();
    },
  });

  const unblock = useMutation({
    mutationFn: (userId: number) => userBlockApi.unblock(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });

  return { block, unblock };
}

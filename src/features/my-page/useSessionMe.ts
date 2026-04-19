import { useQuery } from "@tanstack/react-query";
import { userApi, type SessionMe } from "src/api/users";
import { QK } from "src/utils/lib/queryKeys";

export function useSessionMe() {
  return useQuery<SessionMe, Error>({
    queryKey: QK.sessionMe,
    queryFn: async () => {
      const res = await userApi.getSessionMe();
      if (!res.data?.success) throw new Error('세션 조회 실패');
      return res.data.data;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

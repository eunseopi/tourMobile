import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { userApi, type SessionMe } from "src/api/users";
import { QK } from "src/utils/lib/queryKeys";

function isUnauthorized(error: Error) {
  return (error as AxiosError).response?.status === 401;
}

export function useSessionMe() {
  return useQuery<SessionMe, Error>({
    queryKey: QK.sessionMe,
    queryFn: async () => {
      const res = await userApi.getSessionMe();
      if (!res.data?.success) throw new Error('세션 조회 실패');
      return res.data.data;
    },
    retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 1,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

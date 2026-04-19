// src/features/my-page/useMyGoods.ts
import { useQuery } from "@tanstack/react-query";
import { productApi, type OwnedProduct } from "src/api/product";
import { QK } from "src/utils/lib/queryKeys";

type ApiError = { errorCode?: string; message?: string };

export const useMyGoods = (
  userIdMaybe?: string | number,
  enabled = false
) => {
  return useQuery<OwnedProduct[], ApiError>({
    queryKey: QK.mMyGoods,                 // ✅ 단일 키
    enabled: enabled && userIdMaybe != null,
    queryFn: async ({ signal }) => {
      if (userIdMaybe == null) return []; // 안전 가드
      const userId = userIdMaybe as string | number; // TS 축소
      const res = await productApi.getMyGoods(userId, signal);
      if (!res.data?.success) throw new Error();
      return res.data.data ?? [];
    },
    staleTime: 60_000,
  });
};

import { useQuery } from "@tanstack/react-query";
import { type OwnedProduct, productApi } from "src/api/product";
import { QK } from "src/utils/lib/queryKeys";

export const useExchangeDetail = (exchangeId?: string | number, enabled = true) =>
    useQuery<OwnedProduct>({
        queryKey: QK.exchangeDetail(exchangeId ?? ''),
        enabled: Boolean(exchangeId) && enabled,
        queryFn: async ({ signal }) => {
            if (exchangeId == null) throw new Error('exchangeId가 없습니다.');
            const res = await productApi.getExchangeDetail(exchangeId, signal);
            return res.data.data;
        },
        retry: 0,
    });
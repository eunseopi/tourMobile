import { useQuery } from "@tanstack/react-query"
import { type OwnedProduct, productApi } from "src/api/product"
import { QK } from "src/utils/lib/queryKeys"

export const useMyProducts = (userId?: string, enabled = true) =>{
    return useQuery<OwnedProduct[]>({
        queryKey: QK.myProducts(userId ?? ''),
        enabled: Boolean(userId) && enabled,
        queryFn: async ({ signal }) => {
            if (userId == null) throw new Error('userId가 없습니다.');
            const res = await productApi.getMyProduct(userId, signal);
            return res.data.data;
        }
    })
};
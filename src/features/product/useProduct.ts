import { useQuery } from "@tanstack/react-query"
import { productApi } from "src/api/product";
import type { Product } from "src/types/ProductTypes"
import { QK } from "src/utils/lib/queryKeys";

export const useProduct = (productId: string | number, enabled= true) => {
    return useQuery<Product>({
        queryKey: QK.product(productId ?? ''),
        enabled: Boolean(productId) && enabled,
        queryFn: async () => {
            if (productId === null || String(productId) === '') throw new Error('productId가 없습니다.');
            const res = await productApi.getProductById(productId);
            return res.data.data;
        },
    });
};

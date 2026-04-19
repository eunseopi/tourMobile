import { useQuery } from "@tanstack/react-query";
import { productApi, type ProductCategory } from "src/api/product";
import type { Product } from "src/types/ProductTypes";
import { QK } from "src/utils/lib/queryKeys";

export function useProducts(category: ProductCategory, enabled = true) {
    const query = useQuery<Product[], Error>({
        queryKey: QK.products(category),
        enabled,
        queryFn: async ({ signal }) => {
            const { data } = await productApi.getProduct(category, signal);
            return data?.data ?? [];
        },
    });

    return {
        products: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error?.message ?? null,
        refetch: query.refetch
    }
};

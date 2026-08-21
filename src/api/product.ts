import type { Product, ProductCategory } from "src/types/ProductTypes";
import api from "./instance";

export type { ProductCategory };

export type OwnedProduct = {
    exchangeId: string | number;
    productId: string | number;
    name: string;
    imageUrl: string;
    category: ProductCategory;
    accepted: boolean; // 내 상품권 응답에 존재
    redeemCode?: string | null; // JEJU_TICON만 값이 있음(GOODS는 null)
}

type ApiRes<T> = { success: boolean; data: T };

export const productApi = {
    // 상품 조회
    getProduct: (category: ProductCategory, signal?: AbortSignal) =>
        api.get<ApiRes<Product[]>>('v1/products', { params: { category }, signal }),
    getProductById: (productId: string | number) => 
        api.get<ApiRes<Product>>(`v1/products/${productId}`),
    exchangeProduct: (productId: string | number, userId: number | string, signal?: AbortSignal) =>
        api.post<ApiRes<string>>(`v1/products/${productId}/exchange`, undefined, { params: { userId }, signal }),

    // 상품권 조회
    getMyProduct: (userId: string | number, signal?: AbortSignal) =>
        api.get<ApiRes<OwnedProduct[]>>('v1/products/my', { params: { userId }, signal }),
    getExchangeDetail: (exchangeId: string | number, signal?: AbortSignal) =>
        api.get<ApiRes<OwnedProduct>>(`v1/products/exchanges/${exchangeId}/detail`, { signal }),
    // 굿즈 조회
    getMyGoods : (userId: string | number, signal?: AbortSignal) =>
        api.get<ApiRes<OwnedProduct[]>>('v1/products/my/goods', {params: { userId }, signal }),
    
    // 상품 수령
    acceptToggle: (exchangeId: string | number, signal?: AbortSignal) =>
        api.post<ApiRes<string>>(`v1/products/${exchangeId}/accept-toggle`, undefined, { signal })
};

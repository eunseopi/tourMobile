import type { Product } from "src/components/my-page/product/type";
import api from "./instance";

export type ProductCategory = 'JEJU_TICON' | 'GOODS';

export type OwnedProduct = {
    exchangeId: string | number;
    productId: string | number;
    name: string;
    imageUrl: string;
    category: ProductCategory;
    accepted: boolean; // 내 상품권 응답에 존재
}

export type ConvertRes = {
  convertedPoints: number;        // 실제 전환된 포인트
  totalHallabong: number;         // 전환 후 보유 포인트
  currentGrade: string;           // 서버의 MoodGrade enum 문자열
  remainingToday: number;         // 오늘 남은 전환 가능 포인트
  remainingExchangeCount: number; // 남은 교환 횟수
  todayExchangeCount: number;     // 오늘 교환 횟수
};

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

export const stepsApi = {
  convert: (requestedPoints: number, signal?: AbortSignal) =>
    api.post<ApiRes<ConvertRes>>("/v1/steps/convert", { requestedPoints }, { signal }),
};
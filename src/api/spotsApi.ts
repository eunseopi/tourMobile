import api from "./instance";

// TourAPI content_type_id 기반 3분류. 유저가 직접 쓴 글은 content_type_id가 없어
// UNIQUE_SPOT으로 편입된다 (백엔드 SpotCategory.fromContentTypeId 참고).
export type SpotCategory = "TOURIST_SPOT" | "RESTAURANT" | "UNIQUE_SPOT";

export type NearbySpot = {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  likeCount: number;
  likedByMe: boolean;
  imageUrls?: string[];
  type?: "POST" | "SPOT" | "CHALLENGE"; // 서버가 채워주기 시작
  challengeOngoing?: boolean;
  category?: SpotCategory;
};

export interface SpotMapRes {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: "POST" | "SPOT" | "CHALLENGE" | string;
  category?: SpotCategory;
}

export type SpotRecommendation = {
  id: number;
  name: string;
  type: "SPOT" | "CHALLENGE";
  latitude: number;
  longitude: number;
  distanceMeters: number;
  imageUrls: string[] | null;
  overviewSnippet: string | null;
  categoryName: string | null;
  congestionScore: number | null;
};

type ApiRes<T> = { success: boolean; data: T };

export const spotsApi = {
  getNearby: (lat: number, lng: number, radiusKm: number, category?: SpotCategory | null) => {
    const safeLat = Number(lat.toFixed(6));
    const safeLng = Number(lng.toFixed(6));
    return api.get(`api/spots/nearby`, {
      params: { lat: safeLat, lng: safeLng, radiusKm, category: category ?? undefined },
    });
  },
  search: (query: string) =>
    api.get<{ success: boolean; data: SpotMapRes[] }>("api/spots/map/search", {
      params: { query },
    }),
  getNearbyRecommendations: (spotId: number | string) =>
    api.get<ApiRes<SpotRecommendation[]>>(`api/spots/${spotId}/nearby-recommendations`),
};

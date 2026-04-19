import api from "./instance";
import type { SpotCreate } from "src/types/SpotTypes";
import type { SpotPage } from "src/reducer/types";
import type { BannerItem } from "src/components/community/types";
import type { PostDetailProps } from "src/components/community/PostDetail/types";
import type { CommentRes, SpotComment } from "src/components/community/Comment/types";

type ApiRes<T> = {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  timestamp: string;
  failure: boolean;
};

export const communityApi = {
  // 생성
  createSpot: async (payload: SpotCreate): Promise<ApiRes<number>> => {
    const formData = new FormData();
    const { images, ...data } = payload;

    console.log("payload.images:", images); 

    // formData.append('data', JSON.stringify(data));
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/JSON' }));

    images.forEach((file) => {
      if (file instanceof File) {
        formData.append("images", file);
      }
    });

    const res = await api.post<ApiRes<number>>('/api/spots', formData);

    return res.data;
  },

  // 목록
  getLatest: async (page = 0, size = 20): Promise<SpotPage> => {
    const res = await api.get<SpotPage>("/api/spots/latest", {
      params: { page, size, sort: "createdAt,DESC" },
    });
    return res.data;
  },
  getPopular: async (page = 0, size = 20): Promise<SpotPage> => {
    const res = await api.get<SpotPage>("/api/spots/most-liked", {
      params: { page, size, sort: "likeCount,DESC" },
    });
    return res.data;
  },
  likeSpot: async (id: number): Promise<void> => {
    await api.post(`/api/spots/${id}/like`);
  },
  unlikeSpot: async (id: number): Promise<void> => {
    await api.delete(`/api/spots/${id}/like`);
  },
  getBanners: async (date?: string): Promise<BannerItem[]> => {
    const res = await api.get<BannerItem[]>("/api/community/events/banner", {
      params: date ? { date } : undefined,
    });
    const data = res.data;

    // 응답이 배열이 아니면 빈 배열
    return Array.isArray(data) ? data: [];
  },

  // 상세
  getSpotDetail: async (id: number): Promise<ApiRes<PostDetailProps>> => {
    const res = await api.get<ApiRes<PostDetailProps>>(`/api/spots/${id}`);
    return res.data;
  },
  getComments: async (spotId: number, page = 0, size = 15): Promise<CommentRes> => {
    const res = await api.get<CommentRes>(`/api/spots/${spotId}/comments`, {
      params: { page, size },
    });
    return res.data;
  },
  postComment: async (spotId: number, text: string): Promise<SpotComment> => {
    const res = await api.post<SpotComment>(`/api/spots/${spotId}/comments`, { text });
    return res.data;
  },
  getReplies: async (spotId: number, parentReplyId: number, page = 0, size = 10): Promise<CommentRes> => {
    const res = await api.get<CommentRes>(`/api/spots/${spotId}/comments/${parentReplyId}/replies`, {
      params: { page, size },
    });
    return res.data;
  },
  postReply: async (spotId: number, parentReplyId: number, text: string): Promise<SpotComment> => {
    const res = await api.post<SpotComment>(`/api/spots/${spotId}/comments/${parentReplyId}/replies`, { text });
    return res.data;
  },

}
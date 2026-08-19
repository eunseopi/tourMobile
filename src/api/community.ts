import api from "./instance";
import type { SpotCreate, UploadableImage } from "src/types/SpotTypes";
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

// POST /api/spots/{spotId}/report, POST /api/spots/{spotId}/comments/{replyId}/report 로
// { reason: ReportReason, description?: string } 바디를 보냅니다. (백엔드 Report.ReportReason과 값 일치)
export const REPORT_REASONS = [
  { value: "SPAM", label: "스팸/광고" },
  { value: "ABUSE", label: "욕설/혐오 표현" },
  { value: "ADULT_CONTENT", label: "음란물/선정적 콘텐츠" },
  { value: "MISINFORMATION", label: "허위 정보" },
  { value: "ETC", label: "기타" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export type SpotCommunityResult = {
  id: number;
  title?: string;
  name: string;
  description: string;
  likeCount: number;
  viewCount: number;
  type: "POST" | "SPOT" | "CHALLENGE";
  authorNickname: string;
  createdAt: string;
};

export type SpotCommunityResultPage = {
  content: SpotCommunityResult[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export type SpotUpdatePayload = {
  title: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  themeId?: number | null;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  keepImageUrls: string[];
};

export const communityApi = {
  // 생성
  createSpot: async (payload: SpotCreate): Promise<ApiRes<number>> => {
    const formData = new FormData();
    const { images, ...data } = payload;

    formData.append('data', JSON.stringify(data)); // Blob 제거

    images.forEach((file) => {
      formData.append("images", toReactNativeFile(file) as any);
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
  updateSpot: async (
    id: number,
    payload: SpotUpdatePayload,
    newImages: UploadableImage[]
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    newImages.forEach((file) => {
      formData.append("images", toReactNativeFile(file) as any);
    });
    await api.put(`/api/spots/${id}`, formData);
  },
  deleteSpot: async (id: number): Promise<void> => {
    await api.delete(`/api/spots/${id}`);
  },
  reportSpot: async (id: number, reason: ReportReason, description?: string): Promise<void> => {
    await api.post(`/api/spots/${id}/report`, { reason, description });
  },
  searchCommunity: async (
    query: string,
    page = 0,
    size = 10
  ): Promise<SpotCommunityResultPage> => {
    const res = await api.get<ApiRes<SpotCommunityResultPage>>("/api/spots/community/search", {
      params: { query, page, size },
    });
    return res.data.data;
  },
  getCommunitySearchHistory: async (): Promise<string[]> => {
    const res = await api.get<ApiRes<string[]>>("/api/spots/community/history");
    return res.data.data ?? [];
  },
  getBanners: async (date?: string): Promise<BannerItem[]> => {
    const res = await api.get<any[]>("/api/community/events/banner", {
      params: date ? { date } : undefined,
    });
    const data = res.data;
    if (!Array.isArray(data)) return [];

    // 백엔드가 snake_case(image_url/detailUrl)로 내려주므로 프론트 타입에 맞게 변환한다
    return data.map((item) => ({
      id: item.id,
      imageUrl: item.image_url ?? item.imageUrl ?? null,
      title: item.title,
      linkUrl: item.detailUrl ?? item.linkUrl,
    }));
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
  getCommentCount: async (spotId: number): Promise<number> => {
    const res = await api.get<CommentRes>(`/api/spots/${spotId}/comments`, {
      params: { page: 0, size: 1 },
    });
    return res.data.totalElements ?? 0;
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
  updateComment: async (spotId: number, replyId: number, text: string): Promise<SpotComment> => {
    const res = await api.put<SpotComment>(`/api/spots/${spotId}/comments/${replyId}`, { text });
    return res.data;
  },
  deleteComment: async (spotId: number, replyId: number): Promise<void> => {
    await api.delete(`/api/spots/${spotId}/comments/${replyId}`);
  },
  // 설계된 엔드포인트 (백엔드 미구현) — 댓글 신고 접수
  reportComment: async (
    spotId: number,
    replyId: number,
    reason: ReportReason,
    description?: string
  ): Promise<void> => {
    await api.post(`/api/spots/${spotId}/comments/${replyId}/report`, { reason, description });
  },

  // 댓글 좋아요
  likeComment: async (spotId: number, replyId: number): Promise<void> => {
    await api.post(`/api/spots/${spotId}/comments/${replyId}/likes`);
  },
  unlikeComment: async (spotId: number, replyId: number): Promise<void> => {
    await api.delete(`/api/spots/${spotId}/comments/${replyId}/likes`);
  },
  getCommentLikeCount: async (spotId: number, replyId: number): Promise<number> => {
    const res = await api.get<number>(`/api/spots/${spotId}/comments/${replyId}/likes/count`);
    return res.data;
  },
  isCommentLikedByMe: async (spotId: number, replyId: number): Promise<boolean> => {
    const res = await api.get<boolean>(`/api/spots/${spotId}/comments/${replyId}/likes/me`);
    return res.data;
  },

}

function toReactNativeFile(file: UploadableImage) {
  return {
    uri: file.uri,
    name: file.name ?? `spot-${Date.now()}.jpg`,
    type: file.type ?? "image/jpeg",
  };
}

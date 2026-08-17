import api from "./instance";
import type { SpotPage } from "src/reducer/types";

type ApiRes<T> = {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  timestamp: string;
  failure: boolean;
};

export type MyPostSort = "latest" | "views" | "comments";

export type MyCommentItem = {
  id: number;
  contentId: number; // Spot(게시글) ID
  depth: number; // 0 = 댓글, 그 외 = 답글
  parentReplyId: number | null;
  memberId: number;
  memberNickname: string;
  text: string;
  relativeTime: string; // e.g. "5분 전"
  isDeleted: boolean;
  createdAt: string;
};

export type MyCommentPage = {
  content: MyCommentItem[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export const myPageApi = {
  getMyPosts: async (page = 0, size = 20, sort: MyPostSort = "latest"): Promise<SpotPage> => {
    const res = await api.get<ApiRes<SpotPage>>("v1/mypage/posts", {
      params: { page, size, sort },
    });
    return res.data.data;
  },
  getMyComments: async (page = 0, size = 20): Promise<MyCommentPage> => {
    const res = await api.get<ApiRes<MyCommentPage>>("v1/mypage/comments", {
      params: { page, size },
    });
    return res.data.data;
  },
  getMyLikedSpots: async (page = 0, size = 20): Promise<SpotPage> => {
    const res = await api.get<ApiRes<SpotPage>>("v1/mypage/liked", {
      params: { page, size },
    });
    return res.data.data;
  },
};

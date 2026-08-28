import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const REPORTED_POSTS_KEY = "app:reportedPostIds";
const REPORTED_COMMENTS_KEY = "app:reportedCommentIds";

type ReportedContentState = {
  reportedPostIds: number[];
  reportedCommentIds: number[];
  hydrate: () => Promise<void>;
  reportPost: (id: number) => void;
  reportComment: (id: number) => void;
};

// 내가 신고한 게시글/댓글은 다시 보이지 않도록 로컬에 기억해둔다.
export const useReportedContentStore = create<ReportedContentState>((set, get) => ({
  reportedPostIds: [],
  reportedCommentIds: [],
  hydrate: async () => {
    const [posts, comments] = await Promise.all([
      AsyncStorage.getItem(REPORTED_POSTS_KEY),
      AsyncStorage.getItem(REPORTED_COMMENTS_KEY),
    ]);
    // 저장된 값이 손상되어 있어도(예: 강제 종료 중 쓰기 중단) 앱 시작이 막히지 않도록 개별적으로 방어한다.
    const safeParse = (value: string | null): number[] => {
      if (!value) return [];
      try {
        return JSON.parse(value) as number[];
      } catch {
        return [];
      }
    };
    set({
      reportedPostIds: safeParse(posts),
      reportedCommentIds: safeParse(comments),
    });
  },
  reportPost: (id) => {
    const next = [...new Set([...get().reportedPostIds, id])];
    set({ reportedPostIds: next });
    void AsyncStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(next));
  },
  reportComment: (id) => {
    const next = [...new Set([...get().reportedCommentIds, id])];
    set({ reportedCommentIds: next });
    void AsyncStorage.setItem(REPORTED_COMMENTS_KEY, JSON.stringify(next));
  },
}));

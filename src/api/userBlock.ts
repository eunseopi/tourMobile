import api from "./instance";

export type BlockedUser = {
  userId: number;
  nickname: string;
  profile: string | null;
  blockedAt: string;
};

type ApiRes<T> = { success: boolean; data: T };

export const userBlockApi = {
  block: (userId: number) => api.post<ApiRes<string>>(`api/users/${userId}/block`),
  unblock: (userId: number) => api.delete<ApiRes<string>>(`api/users/${userId}/block`),
  getBlocked: () => api.get<ApiRes<BlockedUser[]>>("api/users/blocked"),
};

import api from "./instance";

export type CompletedParams = {
  sort?: "latest" | "oldest"; // 기본 latest
  lastId?: number | string; // 페이지네이션
  size?: number; // 기본 20
};

export const challengeApi = {
  getUpcoming: () => api.get("api/challenges/upcoming"),
  getOngoing: () => api.get("api/challenges/ongoing"),
  getCompleted: (params: CompletedParams = {}) =>
    api.get("api/challenges/completed", {
      params: { sort: "latest", size: 20, ...params },
      withCredentials: true,
    }),
  start: (id: string | number, latitude: number, longitude: number) =>
    api.post(`api/challenges/${id}/start`, { latitude, longitude }),
  refreshUpcoming: () => api.post("api/challenges/upcoming/refresh"),
  complete: (
    id: string | number,
    latitude: number,
    longitude: number,
    proofUrl: string
  ) =>
    api.post(`api/challenges/${id}/complete`, {
      latitude,
      longitude,
      proofUrl, // TODO: 나중에 업로드 API 연동 시 업로드 URL로 교체
    }),
};

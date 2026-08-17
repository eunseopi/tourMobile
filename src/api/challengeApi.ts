import api from "./instance";

export type CompletedParams = {
  sort?: "latest" | "oldest"; // 기본 latest
  lastId?: number | string; // 페이지네이션
  size?: number; // 기본 20
};

export type ChallengeCompleteRes = {
  challengeId: number;
  withinThreshold: boolean;
  distanceMetersToTarget: number;
  awardedPoints: number;
  myHallabongAfter: number;
  completedAt: string;
  completedMissions?: { missionId: number; title: string }[];
};

export type ChallengeStartRes = {
  challengeId: number;
  spotLatitude: number;
  spotLongitude: number;
  distanceMetersToTarget: number;
  myStatus: string;
  point: number;
};

type ApiRes<T> = { success: boolean; data: T };

export const challengeApi = {
  getUpcoming: () => api.get("api/challenges/upcoming"),
  getOngoing: () => api.get("api/challenges/ongoing"),
  getCompleted: (params: CompletedParams = {}) =>
    api.get("api/challenges/completed", {
      params: { sort: "latest", size: 20, ...params },
      withCredentials: true,
    }),
  start: (id: string | number, latitude: number, longitude: number) =>
    api.post<ApiRes<ChallengeStartRes>>(`api/challenges/${id}/start`, { latitude, longitude }),
  refreshUpcoming: () => api.post("api/challenges/upcoming/refresh"),
  cancel: (id: string | number) => api.post(`api/challenges/${id}/cancel`),
  complete: (
    id: string | number,
    latitude: number,
    longitude: number,
    proofUrl: string
  ) =>
    api.post<ApiRes<ChallengeCompleteRes>>(`api/challenges/${id}/complete`, {
      latitude,
      longitude,
      proofUrl,
    }),
};

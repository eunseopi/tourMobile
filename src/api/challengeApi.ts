import api from "./instance";
import type { UploadableImage } from "src/types/SpotTypes";

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

export const challengeApi = {
  getUpcoming: () => api.get("api/challenges/upcoming"),
  getOngoing: () => api.get("api/challenges/ongoing"),
  getCompleted: (params: CompletedParams = {}) =>
    api.get("api/challenges/completed", {
      params: { sort: "latest", size: 20, ...params },
      withCredentials: true,
    }),
  start: (id: string | number, latitude: number, longitude: number) =>
    api.post<ChallengeStartRes>(`api/challenges/${id}/start`, { latitude, longitude }),
  uploadProofImage: (id: string | number, file: UploadableImage) => {
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: file.name ?? `challenge-proof-${Date.now()}.jpg`,
      type: file.type ?? "image/jpeg",
    } as any);
    return api.post<{ proofUrl: string }>(`api/challenges/${id}/proof-image`, form);
  },
  refreshUpcoming: () => api.post("api/challenges/upcoming/refresh"),
  cancel: (id: string | number) => api.post(`api/challenges/${id}/cancel`),
  complete: (
    id: string | number,
    latitude: number,
    longitude: number,
    proofUrl: string
  ) =>
    api.post<ChallengeCompleteRes>(`api/challenges/${id}/complete`, {
      latitude,
      longitude,
      proofUrl,
    }),
};

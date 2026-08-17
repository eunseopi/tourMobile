import api from "./instance";

export type MissionTheme = {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  totalSteps: number;
  completedSteps: number;
  // 백엔드 DTO는 boolean 필드 isCompleted에 Lombok+Jackson이 "is"를 지워서
  // 실제 JSON 키는 completed로 내려온다 (NotificationDto.isRead -> "read"와 동일 패턴).
  completed: boolean;
};

export type MissionStep = {
  spotId: number;
  stepLabel: string;
  order: number;
  completed: boolean;
};

type ApiRes<T> = { success: boolean; data: T };

export const missionsApi = {
  getMissions: () => api.get<ApiRes<MissionTheme[]>>("api/missions"),
  getMissionDetail: (id: number | string) =>
    api.get<ApiRes<MissionStep[]>>(`api/missions/${id}`),
};

import api from "./instance";

export type AttendanceCheckRes = {
  status: string;
  message: string;
  days: number | null;
  baseHallabong: number | null;
  bonusHallabong: number | null;
  totalHallabong: number | null;
};

export type AttendanceStatusRes = {
  checkedToday: boolean;
  consecutiveDays: number;
};

type ApiRes<T> = {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  timestamp: string;
};

export const attendanceApi = {
  check: () => api.post<ApiRes<AttendanceCheckRes>>("v1/attendance/check"),
  getStatus: () => api.get<ApiRes<AttendanceStatusRes>>("v1/attendance/status"),
};

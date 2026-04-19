import api from "./instance";

export type AttendanceCheckRes = {
  status: string;
  message: string;
  days: number;
  baseHallabong: number;
  bonusHallabong: number;
  totalHallabong: number;
};

export const attendanceApi = {
  check: () => api.post<AttendanceCheckRes>("v1/attendance/check"),
};

import api from "./instance";

export type ConvertRes = {
  convertedPoints: number;
  totalHallabong: number;
  currentGrade: string;
  remainingToday: number;
  remainingExchangeCount: number;
  todayExchangeCount: number;
};

type ApiRes<T> = { success: boolean; data: T };

export const stepsApi = {
  save: (stepCount: number) => api.post("v1/steps", { stepCount }),
  convert: (requestedPoints: number, signal?: AbortSignal) =>
    api.post<ApiRes<ConvertRes>>("/v1/steps/convert", { requestedPoints }, { signal }),
};

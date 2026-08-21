import api from "./instance";

export type ConvertRes = {
  convertedPoints: number;
  totalHallabong: number;
  currentGrade: string;
  remainingToday: number;
  remainingExchangeCount: number;
  todayExchangeCount: number;
};

export type ExchangeStatusRes = {
  remainingPoints: number;
  remainingExchangeCount: number;
  todayExchangeCount: number;
  maxDailyExchanges: number;
  maxSingleExchange: number;
};

type ApiRes<T> = { success: boolean; data: T };

export const stepsApi = {
  save: (stepCount: number) => api.post("v1/steps", { stepCount }),
  convert: (requestedPoints: number, requestId: string, signal?: AbortSignal) =>
    api.post<ApiRes<ConvertRes>>("/v1/steps/convert", { requestedPoints, requestId }, { signal }),
  getExchangeStatus: (signal?: AbortSignal) =>
    api.get<ApiRes<ExchangeStatusRes>>("/v1/steps/exchange/status", { signal }),
};

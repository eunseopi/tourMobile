import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { queryClient } from "src/app/queryClient";
import { resetToLogin } from "src/app/navigation/navigationRef";
import { authStorage } from "src/utils/lib/authStorage";
import { QK } from "src/utils/lib/queryKeys";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://jejuday.duckdns.org";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // headers: {
  //     'Content-Type': 'application/json'
  // },
  timeout: 15_000, // 요청 제한시간: 네트워크가 끊긴 채로 무한 대기하며 로딩이 멈추는 것을 방지
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _networkRetryCount?: number;
};

const NETWORK_RETRY_DELAY_MS = 500;

function isTransientNetworkError(error: AxiosError) {
  return (
    !error.response &&
    (error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.message === "Network Error")
  );
}

function handleSessionExpired() {
  void authStorage.clearLoginAt();
  queryClient.removeQueries({ queryKey: QK.sessionMe });
  resetToLogin();
}

// 로그인 후 1시간이 지나면 요청을 보내기 전에 강제로 로그아웃 처리
api.interceptors.request.use(async (config) => {
  const isExpired = await authStorage.isSessionExpired();
  if (isExpired) {
    handleSessionExpired();
    return Promise.reject(new Error("세션이 만료되었습니다."));
  }
  return config;
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const isForm =
      typeof FormData !== "undefined" && config.data instanceof FormData;
    const header = config.headers as
      | AxiosHeaders
      | Record<string, any>
      | undefined;

    if (isForm) {
      // Android의 React Native NetworkingModule은 FormData 본문인데 Content-Type이
      // 없으면 Axios 기본값(application/x-www-form-urlencoded)을 적용해 요청 전 실패한다.
      // boundary는 네이티브 네트워크 계층이 생성하므로 multipart 타입만 명시한다.
      if ((header as any)?.set) {
        (header as AxiosHeaders).set("Content-Type", "multipart/form-data");
      } else if (header) {
        (header as any)["Content-Type"] = "multipart/form-data";
      }
      // 이미지 업로드는 느린 네트워크에서 기본 15초를 넘길 수 있어 여유를 둔다.
      config.timeout = 40_000;
    } else {
      if ((header as any)?.set)
        (header as AxiosHeaders).set("Content-Type", "application/json");
      else (header as any)["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    // 중복 가입/메일 발송을 만들 수 있는 POST는 자동 재시도하지 않는다.
    // 응답을 받지 못한 일시적 장애에 한해 멱등인 조회 요청만 한 번 복구한다.
    if (
      config &&
      config.method?.toLowerCase() === "get" &&
      isTransientNetworkError(error) &&
      (config._networkRetryCount ?? 0) < 1
    ) {
      config._networkRetryCount = (config._networkRetryCount ?? 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, NETWORK_RETRY_DELAY_MS));
      return api.request(config);
    }

    if (error.response?.status == 401) {
      handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default api;

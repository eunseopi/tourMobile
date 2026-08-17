import axios, { AxiosHeaders } from "axios";
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
      if ((header as any)?.delete) {
        (header as AxiosHeaders).delete("Content-Type");
      }
      if (header) {
        delete (header as any)["Content-Type"];
        delete (header as any)["content-type"];
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
  (error) => {
    if (error.response?.status == 401) {
      handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default api;

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 화면 전환/재방문마다 즉시 리페치되어 매번 로딩 스피너가 뜨는 것을 방지
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      // 기본 재시도(최대 3회, 지수 백오프)는 네트워크가 불안정할 때 실패 응답이
      // 뜨기까지 수 초씩 걸려 "느리다"는 체감으로 이어짐
      retry: 1,
    },
  },
});

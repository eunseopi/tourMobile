import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "src/api/attendanceApi";
import { QK } from "src/utils/lib/queryKeys";

/**
 * 앱 켜자마자 자동으로 조용히 체크하던 이전 방식은 성공/실패를 눈으로 확인할 수 없어서
 * "출석이 되는지 안 되는지조차 모르겠다"는 문제가 있었다. 홈 화면의 "출석체크" 버튼을
 * 사용자가 직접 눌러서 매번 결과(보상 또는 "이미 완료")를 바로 확인하는 방식으로 바꿨다.
 */
export function useAttendanceStatus() {
  return useQuery({
    queryKey: QK.attendanceStatus,
    queryFn: async () => {
      const { data } = await attendanceApi.getStatus();
      return data.data;
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await attendanceApi.check();
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.sessionMe });
      void queryClient.invalidateQueries({ queryKey: QK.attendanceStatus });
    },
  });

  return {
    checkIn: mutation.mutateAsync,
    isChecking: mutation.isPending,
  };
}

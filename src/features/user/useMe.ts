import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type SessionMe } from "../../api/users";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { QK } from "src/utils/lib/queryKeys";

export type Me = {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  hallabong: number;
  totalSteps: number;
  moodGrade: string; // 원본 코드
  gradeName: string; // 등급 한글 이름
};

// 서버 코드 → 한글 등급명
const gradeNameOf = (code?: string) => {
  switch (code) {
    case "BALBADAK":
      return "발바닥";
    // TODO: 추가 코드 케이스들 정의
    default:
      return "발바닥";
  }
};

const mapMe = (dto?: SessionMe): Me | null => {
  if (!dto) return null;
  return {
    id: String(dto.userId),
    name: dto.name ?? "",
    nickname: dto.nickname ?? "",
    avatarUrl: dto.profile || "",
    hallabong: dto.hallabong ?? 0,
    totalSteps: dto.totalSteps ?? 0,
    moodGrade: dto.moodGrade ?? "",
    gradeName: gradeNameOf(dto.moodGrade),
  };
};

export function useMe() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useSessionMe();

  // 출석 수령/프로필 변경 등 외부에서 갱신 트리거
  useEffect(() => {
    const h = () => {
      void queryClient.invalidateQueries({ queryKey: QK.sessionMe });
    };
    window.addEventListener("me:refresh", h);
    return () => window.removeEventListener("me:refresh", h);
  }, [queryClient]);

  return {
    me: mapMe(data),
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

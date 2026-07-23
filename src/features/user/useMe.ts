import { type SessionMe } from "../../api/users";
import { useSessionMe } from "src/features/my-page/useSessionMe";

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
  const { data, isLoading, error, refetch } = useSessionMe();

  return {
    me: mapMe(data),
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

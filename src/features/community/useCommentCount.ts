import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";

// 목록(피드)용 댓글 수 — SpotResponse에 댓글 수 필드가 없어 spotId마다 개별 조회한다.
// 상세 화면은 이 훅을 쓰지 않고 실제로 불러온 댓글 배열 길이를 그대로 쓴다(N+1 낭비 방지 + 정확).
export function useCommentCount(spotId: number) {
  const { data } = useQuery({
    queryKey: ["GET /api/spots/:spotId/comments/count", spotId],
    queryFn: () => communityApi.getCommentCount(spotId),
    staleTime: 5 * 60 * 1000,
  });
  return data ?? 0;
}

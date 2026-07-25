import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import type { PostDetailProps } from "src/components/community/PostDetail/types";

export function useSpotDetail(spotId: number) {
  return useQuery<PostDetailProps>({
    queryKey: ["spotDetail", spotId],
    queryFn: () => communityApi.getSpotDetail(spotId).then((res) => res.data),
  });
}

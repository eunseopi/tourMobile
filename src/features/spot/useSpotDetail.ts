import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";

export function useSpotDetail(spotId: number) {
  return useQuery({
    queryKey: ["spotDetail", spotId],
    queryFn: () => communityApi.getSpotDetail(spotId).then((res) => res.data),
  });
}

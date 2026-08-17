import { useQuery } from "@tanstack/react-query";
import { spotsApi } from "src/api/spotsApi";

export function useNearbyRecommendations(spotId: number | string | undefined) {
  return useQuery({
    queryKey: ["nearbyRecommendations", spotId],
    queryFn: () => spotsApi.getNearbyRecommendations(spotId!).then((res) => res.data.data),
    enabled: spotId != null,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import type { SpotCreate } from "src/types/SpotTypes";

export function useCreateSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SpotCreate) => communityApi.createSpot(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots"] });
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots/latest"] });
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots/most-liked"] });
      void queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          (query.queryKey[0] === "nearbySpots" || query.queryKey[0] === "mapSearch"),
      });
    },
  });
}

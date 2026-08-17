import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi, type SpotUpdatePayload } from "src/api/community";
import type { UploadableImage } from "src/types/SpotTypes";

export function useUpdateSpot(spotId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, newImages }: { payload: SpotUpdatePayload; newImages: UploadableImage[] }) =>
      communityApi.updateSpot(spotId, payload, newImages),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["spotDetail", spotId] });
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots"] });
      void queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          (query.queryKey[0] === "nearbySpots" || query.queryKey[0] === "mapSearch"),
      });
    },
  });
}

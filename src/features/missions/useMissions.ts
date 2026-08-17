import { useQuery } from "@tanstack/react-query";
import { missionsApi } from "src/api/missions";

export function useMissions() {
  return useQuery({
    queryKey: ["GET /api/missions"],
    queryFn: () => missionsApi.getMissions().then((res) => res.data.data ?? []),
  });
}

export function useMissionDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: ["GET /api/missions", id],
    queryFn: () => missionsApi.getMissionDetail(id!).then((res) => res.data.data),
    enabled: id != null,
  });
}

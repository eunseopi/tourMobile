import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { spotsApi, type NearbySpot, type SpotCategory } from "src/api/spotsApi";

export function useNearbySpots(
  latitude?: number,
  longitude?: number,
  radiusKm = 3,
  category?: SpotCategory | null
) {
  const query = useQuery<NearbySpot[], Error>({
    queryKey: ["nearbySpots", latitude, longitude, radiusKm, category ?? null],
    enabled: latitude != null && longitude != null,
    queryFn: async () => {
      if (latitude == null || longitude == null) return [];
      const response = await spotsApi.getNearby(latitude, longitude, radiusKm, category);
      const payload = response.data?.data ?? response.data ?? [];
      return Array.isArray(payload) ? (payload as NearbySpot[]) : [];
    },
    staleTime: 60_000,
  });

  const items = useMemo(() => {
    return (query.data ?? []).map((item) => ({
      ...item,
      distanceKm:
        latitude != null && longitude != null
          ? haversineKm(latitude, longitude, Number(item.latitude), Number(item.longitude))
          : null,
    }));
  }, [latitude, longitude, query.data]);

  return {
    ...query,
    items,
  };
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

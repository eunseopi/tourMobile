import { colors } from "src/design/theme";
import type { MapMarkerItem } from "./types";

export function markerColor(type?: string) {
  switch (type) {
    case "CHALLENGE":
      return colors.primary[400];
    case "POST":
      return "#5B8DEF";
    case "SPOT":
      return "#37B26C";
    default:
      return colors.gray[400];
  }
}

export function markerDescription(type?: string, likeCount?: number) {
  return `${typeLabel(type)} · 좋아요 ${likeCount ?? 0}`;
}

export function typeLabel(type?: string) {
  switch (type) {
    case "CHALLENGE":
      return "챌린지";
    case "POST":
      return "커뮤니티";
    case "SPOT":
      return "스팟";
    default:
      return "추천";
  }
}

export function normalizeType(type?: string): "POST" | "SPOT" | "CHALLENGE" {
  if (type === "POST" || type === "SPOT" || type === "CHALLENGE") return type;
  return "SPOT";
}

export function markerIcon(type?: string) {
  switch (type) {
    case "CHALLENGE":
      return "C";
    case "POST":
      return "P";
    case "SPOT":
      return "S";
    default:
      return "•";
  }
}

export function pickDominantType(items: MapMarkerItem[]): "POST" | "SPOT" | "CHALLENGE" {
  const score = { POST: 0, SPOT: 0, CHALLENGE: 0 };
  items.forEach((item) => {
    const type = normalizeType(item.type);
    score[type] += 1;
  });

  if (score.CHALLENGE >= score.POST && score.CHALLENGE >= score.SPOT) return "CHALLENGE";
  if (score.POST >= score.SPOT) return "POST";
  return "SPOT";
}

export function formatDistance(distanceKm?: number | null) {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return "거리 정보 없음";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)}km`;
}

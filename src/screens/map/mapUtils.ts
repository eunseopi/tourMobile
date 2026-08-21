import { colors } from "src/design/theme";
import type { MapMarkerItem } from "./types";

export type ChallengeStatus = "available" | "ongoing" | "done";

// 스팟/미시작 챌린지(이용 가능)는 주황, 내가 진행중인 챌린지는 파랑, 완료한 챌린지는 회색으로 구분한다.
// "챌린지에 추가"로 SPOT 타입에서도 챌린지를 시작/완료할 수 있어(백엔드 start()가
// CHALLENGE/SPOT 둘 다 허용) type을 기준으로 걸러내지 않고 참여 여부만 본다.
export function getChallengeStatus(
  item: { id: string | number; type?: string },
  ongoingIds: Set<string>,
  completedIds: Set<string>
): ChallengeStatus {
  const id = String(item.id);
  if (completedIds.has(id)) return "done";
  if (ongoingIds.has(id)) return "ongoing";
  return "available";
}

export function markerColor(status: ChallengeStatus) {
  if (status === "ongoing") return "#3B82F6";
  if (status === "done") return colors.gray[400];
  return colors.primary[400];
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

export function pickDominantStatus(
  items: MapMarkerItem[],
  ongoingIds: Set<string>,
  completedIds: Set<string>
): ChallengeStatus {
  const score = { available: 0, ongoing: 0, done: 0 };
  items.forEach((item) => {
    score[getChallengeStatus(item, ongoingIds, completedIds)] += 1;
  });

  if (score.ongoing >= score.done && score.ongoing >= score.available) return "ongoing";
  if (score.done >= score.available) return "done";
  return "available";
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

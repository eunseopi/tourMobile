export type NotificationTarget =
  | { screen: "PostDetail"; postId: number }
  | { screen: "SpotDetail"; spotId: number }
  | { screen: "MissionList" };

// contextKey 형식: "post:123:reply" / "like:123:1" / "challenge-place:45" /
// "spot-promote:45" / "challenge-promote:45" / "challenge-complete:7" /
// "mission-complete:2" / "comment:45" / "step-goal:2026-08-16" 등
// (백엔드 NotificationFactory/SpotPromotionNotifier 기준). comment/step-goal/attendance는
// 이동시킬 화면을 특정할 정보(게시글 id 등)가 없어 바로 이동시킬 화면이 없다.
export function resolveNotificationTarget(
  contextKey?: string | null
): NotificationTarget | null {
  if (!contextKey) return null;
  const [kind, rawId] = contextKey.split(":");
  const id = Number(rawId);
  if (!Number.isFinite(id)) return null;

  switch (kind) {
    case "post":
    case "like":
      return { screen: "PostDetail", postId: id };
    case "challenge-place":
    case "spot-promote":
    case "challenge-promote":
    case "challenge-complete":
      return { screen: "SpotDetail", spotId: id };
    case "mission-complete":
      // 미션 상세 화면은 목록에서 넘겨준 MissionTheme 객체가 필요해서,
      // 알림 탭만으로는 특정 상세로 바로 못 들어가고 목록으로 보낸다.
      return { screen: "MissionList" };
    default:
      return null;
  }
}

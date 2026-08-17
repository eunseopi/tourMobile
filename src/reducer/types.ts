export type StatusLabel = "진행전" | "진행중" | "완료";

export interface ChallengeCardData {
  id: string;
  title: string;
  categoryLabel: string;
  statusLabel: StatusLabel;
  dateText: string;
  imageUrl: string;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  categoryTone?: "primary" | "neutral";
}

export interface ChallengeState {
  ready: ChallengeCardData[];
  doing: ChallengeCardData[];
  done: ChallengeCardData[];
}

export interface Spot {
  id: number;
  title: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  likeCount: number;
  likedByMe: boolean;
  imageUrls: string[];
  userId: number;
  userNickname: string;
  userProfile: string;
  type: "POST" | "SPOT" | "CHALLENGE";
  challengeOngoing: boolean;
  createdAt: string;
  // true: 관광공사 TourAPI 동기화 데이터, false: 유저 작성 글(승격되어도 유지됨)
  official: boolean;
}

export interface SpotPage {
  content: Spot[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

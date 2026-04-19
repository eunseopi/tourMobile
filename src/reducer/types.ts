export type StatusLabel = "진행전" | "진행중" | "완료";

export interface ChallengeCardData {
  id: string;
  title: string;
  categoryLabel: string;
  statusLabel: StatusLabel;
  dateText: string;
  imageUrl: string;
  categoryTone?: "primary" | "neutral";
}

export interface ChallengeState {
  ready: ChallengeCardData[];
  doing: ChallengeCardData[];
  done: ChallengeCardData[];
}

export interface Spot {
  id: number;
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
}

export interface SpotPage {
  content: Spot[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

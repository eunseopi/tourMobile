export type PostDetailProps = {
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
  createdAt: string;
};

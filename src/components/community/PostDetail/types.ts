export type PostDetailProps = {
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
  createdAt: string;
  themeId?: number | null;
  tags?: string[];
};

export type SpotComment = {
  id: number;
  contentId?: number;
  text: string;
  userId?: number | null;
  nickname?: string;
  profileImageUrl?: string;
  depth?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  relativeTime?: string;
  parentReplyId?: number | null;
  likeCount?: number;
  likedByMe?: boolean;
};

export type CommentRes = {
  content: SpotComment[];
  totalElements: number;
  hasNext?: boolean;
};

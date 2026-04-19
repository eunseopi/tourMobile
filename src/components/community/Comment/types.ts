export type SpotComment = {
  id: number;
  text: string;
  userId?: number;
  userNickname?: string;
  userProfile?: string;
  createdAt?: string;
  parentReplyId?: number | null;
};

export type CommentRes = {
  content: SpotComment[];
  totalElements: number;
  hasNext?: boolean;
};

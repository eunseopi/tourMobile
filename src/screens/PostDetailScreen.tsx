import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import { formatDate } from "src/utils/formDate";
import type { SpotComment } from "src/components/community/Comment/types";
import {
  useAllComments,
  usePostComment,
  usePostReply,
} from "src/features/community/useComments";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

export default function PostDetailScreen({ route }: Props) {
  const { postId } = route.params;
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [replyTarget, setReplyTarget] = useState<SpotComment | null>(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["spotDetail", postId],
    queryFn: () => communityApi.getSpotDetail(postId).then((res) => res.data),
  });
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useAllComments(postId);
  const postComment = usePostComment(postId);
  const postReply = usePostReply();

  const isSubmitting = postComment.isPending || postReply.isPending;

  const likeMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      if (liked) await communityApi.likeSpot(postId);
      else await communityApi.unlikeSpot(postId);
      return liked;
    },
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey: ["spotDetail", postId] });
      const previous = queryClient.getQueryData<typeof data>(["spotDetail", postId]);

      queryClient.setQueryData<typeof data>(["spotDetail", postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          likedByMe: liked,
          likeCount: liked ? (old.likeCount ?? 0) + 1 : Math.max(0, (old.likeCount ?? 0) - 1),
        };
      });

      return { previous };
    },
    onError: (_error, _liked, context) => {
      queryClient.setQueryData(["spotDetail", postId], context?.previous);
      Alert.alert("좋아요 실패", "잠시 후 다시 시도해주세요.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["spotDetail", postId] });
      void queryClient.invalidateQueries({ queryKey: ["GET /api/spots"] });
      void queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          (query.queryKey[0] === "nearbySpots" || query.queryKey[0] === "mapSearch"),
      });
    },
  });

  const handleToggleLike = () => {
    if (!data || likeMutation.isPending) return;
    likeMutation.mutate(!data.likedByMe);
  };

  const handleSubmit = async () => {
    const value = text.trim();
    if (!value) return;

    try {
      if (replyTarget) {
        await postReply.mutateAsync({
          spotId: postId,
          parentReplyId: replyTarget.id,
          text: value,
        });
        setReplyTarget(null);
      } else {
        await postComment.mutateAsync(value);
      }
      setText("");
      void refetchComments();
    } catch (error: any) {
      Alert.alert(
        "댓글 작성 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>게시글을 찾을 수 없어요.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  const firstImage = data.imageUrls?.[0];

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{data.name}</Text>
        {firstImage ? <Image source={{ uri: firstImage }} style={styles.heroImage} /> : null}
        <Text style={styles.meta}>
          {data.userNickname || "익명"} · {formatDate(data.createdAt)}
        </Text>
        <Text style={styles.description}>{data.description}</Text>
        <Pressable style={styles.likeButton} onPress={handleToggleLike} disabled={likeMutation.isPending}>
          <Text style={[styles.likeText, data.likedByMe && styles.likedText]}>
            {data.likedByMe ? "♥" : "♡"} 좋아요 {data.likeCount ?? 0}
          </Text>
        </Pressable>

        <View style={styles.commentHeader}>
          <Text style={styles.commentTitle}>댓글 {comments.length}</Text>
          <Pressable onPress={() => refetchComments()}>
            <Text style={styles.refreshText}>새로고침</Text>
          </Pressable>
        </View>

        {isLoadingComments ? (
          <View style={styles.commentsLoading}>
            <ActivityIndicator color="#ff8b4c" />
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyComments}>
            <Text style={styles.mutedText}>아직 댓글이 없어요.</Text>
          </View>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={`${comment.parentReplyId ?? "root"}-${comment.id}`}
              comment={comment}
              onReply={() => setReplyTarget(comment)}
            />
          ))
        )}
      </ScrollView>

      {replyTarget ? (
        <View style={styles.replyBanner}>
          <Text style={styles.replyBannerText} numberOfLines={1}>
            {replyTarget.userNickname || "댓글"}에게 답글 작성 중
          </Text>
          <Pressable onPress={() => setReplyTarget(null)}>
            <Text style={styles.cancelReplyText}>취소</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={replyTarget ? "답글을 입력하세요." : "댓글을 입력하세요."}
          placeholderTextColor="#aaa"
          multiline
          style={styles.input}
        />
        <Pressable
          style={[
            styles.submitButton,
            (!text.trim() || isSubmitting) && styles.disabledButton,
          ]}
          disabled={!text.trim() || isSubmitting}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "작성 중" : "등록"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: SpotComment;
  onReply: () => void;
}) {
  const isReply = comment.parentReplyId != null;

  return (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentAvatar}>
        {comment.userProfile ? (
          <Image source={{ uri: comment.userProfile }} style={styles.commentAvatarImage} />
        ) : (
          <Text style={styles.commentAvatarText}>
            {(comment.userNickname || "익").slice(0, 1)}
          </Text>
        )}
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentMetaRow}>
          <Text style={styles.commentAuthor}>{comment.userNickname || "익명"}</Text>
          {comment.createdAt ? (
            <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
          ) : null}
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        {!isReply ? (
          <Pressable style={styles.replyButton} onPress={onReply}>
            <Text style={styles.replyButtonText}>답글</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "900",
    color: "#191919",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 1.2,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#eee",
  },
  meta: {
    marginTop: 14,
    fontSize: 13,
    color: "#888",
  },
  description: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  likeButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    minHeight: 36,
    justifyContent: "center",
  },
  likeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  likedText: {
    color: "#e65050",
  },
  commentHeader: {
    marginTop: 28,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#222",
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  commentsLoading: {
    paddingVertical: 32,
  },
  emptyComments: {
    paddingVertical: 36,
    alignItems: "center",
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ededed",
  },
  replyItem: {
    marginLeft: 42,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#ffccaa",
  },
  commentAvatarImage: {
    width: "100%",
    height: "100%",
  },
  commentAvatarText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  commentBody: {
    flex: 1,
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "900",
    color: "#222",
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
  },
  commentText: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },
  replyButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#888",
  },
  replyBanner: {
    minHeight: 38,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff4ec",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ffd5bd",
  },
  replyBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#855234",
  },
  cancelReplyText: {
    marginLeft: 12,
    fontSize: 13,
    fontWeight: "900",
    color: "#ff8b4c",
  },
  inputBar: {
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    fontSize: 15,
    color: "#222",
  },
  submitButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
  errorText: {
    color: "#d33",
  },
  retryButton: {
    marginTop: 14,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});

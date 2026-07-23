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
import type { RootStackParamList } from "src/app/navigation/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import { formatDate } from "src/utils/formDate";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";
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
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>게시글을 찾을 수 없어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{data.name}</Text>
        {data.imageUrls?.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sliderWrapper}
          >
            {data.imageUrls.map((image, index) => (
              <Image key={`${image}-${index}`} source={{ uri: image }} style={styles.slideImage} />
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.postWrapper}>
          <Text style={styles.meta}>
            {data.userNickname || "익명"} · {formatDate(data.createdAt)}
          </Text>
          <Text style={styles.description}>{data.description}</Text>
          <Pressable style={styles.likeButton} onPress={handleToggleLike} disabled={likeMutation.isPending}>
            <Text style={[styles.likeText, data.likedByMe && styles.likedText]}>
              {data.likedByMe ? "♥" : "♡"} 좋아요 {data.likeCount ?? 0}
            </Text>
          </Pressable>
        </View>

        <View style={styles.commentHeader}>
          <Text style={styles.commentTitle}>댓글 {comments.length}</Text>
          <Pressable onPress={() => refetchComments()}>
            <Text style={styles.refreshText}>새로고침</Text>
          </Pressable>
        </View>

        {isLoadingComments ? (
          <View style={styles.commentsLoading}>
            <ActivityIndicator color={colors.primary[400]} />
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
    backgroundColor: colors.bg[0],
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  content: {
    paddingBottom: 120,
  },
  title: {
    ...typography.head2,
    color: colors.gray[800],
    paddingLeft: 20,
    paddingTop: 10,
  },
  sliderWrapper: {
    gap: 10,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  slideImage: {
    width: 260,
    height: 260,
    borderRadius: 8,
    backgroundColor: colors.gray[300],
  },
  postWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
  meta: {
    ...typography.caption2,
    color: colors.gray[400],
  },
  description: {
    ...typography.body4,
    color: colors.gray[700],
    paddingVertical: 10,
  },
  likeButton: {
    alignSelf: "flex-start",
    minHeight: 36,
    justifyContent: "center",
  },
  likeText: {
    ...typography.body3,
    color: colors.gray[500],
  },
  likedText: {
    color: colors.primary[400],
  },
  commentHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg[50],
  },
  commentTitle: {
    ...typography.head4,
    color: colors.gray[800],
  },
  refreshText: {
    ...typography.caption1,
    color: colors.primary[400],
  },
  commentsLoading: {
    paddingVertical: 32,
  },
  emptyComments: {
    paddingVertical: 36,
    alignItems: "center",
    backgroundColor: colors.bg[50],
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.bg[0],
  },
  replyItem: {
    paddingLeft: 62,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[100],
  },
  commentAvatarImage: {
    width: "100%",
    height: "100%",
  },
  commentAvatarText: {
    ...typography.caption1,
    color: colors.gray[500],
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
    ...typography.body3,
    color: colors.gray[800],
  },
  commentDate: {
    ...typography.caption2,
    color: colors.gray[400],
  },
  commentText: {
    ...typography.body4,
    color: colors.gray[700],
    marginTop: 5,
  },
  replyButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  replyButtonText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  replyBanner: {
    minHeight: 38,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary[50],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.primary[200],
  },
  replyBannerText: {
    flex: 1,
    ...typography.caption1,
    color: colors.primary[500],
  },
  cancelReplyText: {
    marginLeft: 12,
    ...typography.caption1,
    color: colors.primary[400],
  },
  inputBar: {
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: colors.bg[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    ...typography.body4,
    color: colors.gray[800],
  },
  submitButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  disabledButton: {
    backgroundColor: colors.gray[100],
  },
  submitButtonText: {
    ...typography.body3,
    color: colors.base[0],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[0],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});

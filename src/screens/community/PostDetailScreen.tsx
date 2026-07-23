import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { colors } from "src/design/theme";
import { usePostDetailFlow } from "src/features/community/usePostDetailFlow";
import { PostCommentComposer } from "./components/PostCommentComposer";
import { PostCommentList } from "./components/PostCommentList";
import { PostDetailContent } from "./components/PostDetailContent";
import { PostDetailStateView } from "./components/PostDetailStateView";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

export default function PostDetailScreen({ route }: Props) {
  const postDetail = usePostDetailFlow(route.params.postId);

  if (postDetail.isLoadingPost) {
    return <PostDetailStateView type="loading" />;
  }

  if (postDetail.isPostError || !postDetail.post) {
    return <PostDetailStateView type="error" onRetry={() => postDetail.refetchPost()} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <PostDetailContent
          post={postDetail.post}
          isLiking={postDetail.isLiking}
          onToggleLike={postDetail.handleToggleLike}
        />
        <PostCommentList
          comments={postDetail.comments}
          isLoading={postDetail.isLoadingComments}
          onRefresh={postDetail.refetchComments}
          onReply={postDetail.setReplyTarget}
        />
      </ScrollView>

      <PostCommentComposer
        text={postDetail.commentText}
        replyTarget={postDetail.replyTarget}
        isSubmitting={postDetail.isSubmittingComment}
        onChangeText={postDetail.setCommentText}
        onCancelReply={() => postDetail.setReplyTarget(null)}
        onSubmit={postDetail.handleSubmitComment}
      />
    </KeyboardAvoidingView>
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
});

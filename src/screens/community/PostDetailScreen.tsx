import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type { RootStackParamList } from "src/app/navigation/types";
import type { ReportReason } from "src/api/community";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { colors, typography } from "src/design/theme";
import { useBlockUser } from "src/features/community/useBlockUser";
import { usePostDetailFlow } from "src/features/community/usePostDetailFlow";
import { PostCommentComposer } from "./components/PostCommentComposer";
import { PostCommentList } from "./components/PostCommentList";
import { PostDetailContent } from "./components/PostDetailContent";
import { PostDetailStateView } from "./components/PostDetailStateView";
import { ReportModal } from "./components/ReportModal";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

export default function PostDetailScreen({ navigation, route }: Props) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { block } = useBlockUser();
  const goBackToFeed = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "Community" });
  };
  const postDetail = usePostDetailFlow(route.params.postId, goBackToFeed);

  if (postDetail.isLoadingPost) {
    return <PostDetailStateView type="loading" />;
  }

  if (postDetail.isPostError || !postDetail.post) {
    return <PostDetailStateView type="error" onRetry={() => postDetail.refetchPost()} />;
  }

  const handlePressMore = () => {
    if (postDetail.isMyPost) {
      Alert.alert("게시글 관리", undefined, [
        { text: "취소", style: "cancel" },
        {
          text: "수정",
          style: "communityEdit",
          onPress: () => navigation.navigate("PostEdit", { postId: route.params.postId }),
        },
        {
          text: "삭제",
          style: "communityDelete",
          onPress: () => {
            Alert.alert("게시글 삭제", "게시글을 삭제할까요? 삭제하면 복구할 수 없어요.", [
              { text: "취소", style: "cancel" },
              { text: "삭제", style: "communityDelete", onPress: postDetail.handleDeletePost },
            ]);
          },
        },
      ]);
      return;
    }

    Alert.alert("게시글", undefined, [
      { text: "취소", style: "cancel" },
      {
        text: "작성자 차단",
        style: "communityBlock",
        onPress: () => handleBlockAuthor(),
      },
      { text: "신고", style: "communityReport", onPress: () => setIsReportModalOpen(true) },
    ]);
  };

  const handleBlockAuthor = () => {
    if (!postDetail.post) return;
    const nickname = postDetail.post.userNickname || "이 사용자";
    Alert.alert(
      "사용자 차단",
      `${nickname}님을 차단할까요?\n차단하면 이 사용자의 글과 댓글이 더 이상 보이지 않아요.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "차단하기",
          style: "communityBlock",
          onPress: () => {
            block.mutate(postDetail.post!.userId, {
              onSuccess: () => {
                Alert.alert("차단 완료", `${nickname}님을 차단했어요.`);
                goBackToFeed();
              },
              onError: () => Alert.alert("차단 실패", "잠시 후 다시 시도해주세요."),
            });
          },
        },
      ]
    );
  };

  const handleSubmitReport = (reason: ReportReason, detail: string) => {
    postDetail.handleReportPost(reason, detail);
    setIsReportModalOpen(false);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="게시글"
        right={
          <Pressable accessibilityLabel="더보기" hitSlop={10} onPress={handlePressMore}>
            <Text style={styles.moreButtonText}>⋯</Text>
          </Pressable>
        }
      />
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <PostDetailContent
            post={postDetail.post}
            isLiking={postDetail.isLiking}
            onToggleLike={postDetail.handleToggleLike}
            onTagPress={(tag) => navigation.navigate("CommunitySearch", { initialQuery: tag })}
          />
          <PostCommentList
            comments={postDetail.comments}
            isLoading={postDetail.isLoadingComments}
            onRefresh={postDetail.refetchComments}
            onReply={postDetail.setReplyTarget}
            onToggleLike={postDetail.handleToggleCommentLike}
            isMyComment={postDetail.isMyComment}
            onDeleteComment={postDetail.handleDeleteComment}
            onUpdateComment={postDetail.handleUpdateComment}
            isUpdatingComment={postDetail.isUpdatingComment}
            onReportComment={postDetail.handleReportComment}
            isReportingComment={postDetail.isReportingComment}
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

      <ReportModal
        visible={isReportModalOpen}
        targetLabel="게시글"
        isSubmitting={postDetail.isReportingPost}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
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
  moreButtonText: {
    ...typography.head3,
    color: colors.gray[600],
    paddingHorizontal: 6,
  },
});

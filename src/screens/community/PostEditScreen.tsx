import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { ScreenStateView } from "src/components/ui/ScreenStateView";
import { colors } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { usePostEditFlow } from "src/features/community/usePostEditFlow";
import { PostWriteContentSection } from "./components/PostWriteContentSection";
import { PostWriteImageSection } from "./components/PostWriteImageSection";
import { PostWriteLocationSection } from "./components/PostWriteLocationSection";
import { PostWriteSubmitButton } from "./components/PostWriteSubmitButton";
import { PostWriteTagSection } from "./components/PostWriteTagSection";
import { PostWriteThemeSection } from "./components/PostWriteThemeSection";
import { PostWriteTitleSection } from "./components/PostWriteTitleSection";

type Props = NativeStackScreenProps<RootStackParamList, "PostEdit">;

export default function PostEditScreen({ navigation, route }: Props) {
  const postEdit = usePostEditFlow({
    postId: route.params.postId,
    onBack: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      navigation.navigate("Main", { screen: "Community" });
    },
    onSaved: () => {
      Alert.alert("수정 완료", "게시글이 수정됐어요.", [
        {
          text: "확인",
          onPress: () => navigation.replace("PostDetail", { postId: route.params.postId }),
        },
      ]);
    },
  });

  if (postEdit.isLoading) {
    return (
      <ScreenStateView
        type="loading"
        title="게시글 수정"
        loadingText="게시글을 불러오는 중..."
        errorText="게시글을 불러오지 못했어요."
      />
    );
  }

  if (postEdit.isError) {
    return (
      <ScreenStateView
        type="error"
        title="게시글 수정"
        loadingText="게시글을 불러오는 중..."
        errorText="게시글을 불러오지 못했어요."
        onRetry={() => postEdit.refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="게시글 수정" />
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <PostWriteImageSection
          images={postEdit.displayImages}
          onPickImages={postEdit.handlePickImages}
          onTakeImages={postEdit.handleTakeImages}
          onRemoveImage={postEdit.handleRemoveImage}
        />

        <PostWriteTitleSection
          title={postEdit.spot.title || ""}
          error={postEdit.errors.title}
          onChangeTitle={postEdit.handleChangeTitle}
        />

        <PostWriteLocationSection
          name={postEdit.spot.name || ""}
          error={postEdit.errors.name}
          onUseCurrentLocation={postEdit.handleUseCurrentLocation}
          onPickOnMap={() =>
            Alert.alert(
              "지도 선택 불가",
              "게시글 수정에서는 지도로 위치를 다시 고를 수 없어요. '현재 위치로 채우기'를 사용해주세요."
            )
          }
        />

        <PostWriteContentSection
          description={postEdit.spot.description ?? ""}
          error={postEdit.errors.description}
          onChangeDescription={postEdit.handleChangeDescription}
        />

        <PostWriteThemeSection
          themeId={postEdit.spot.themeId}
          onSelectTheme={postEdit.handleSelectTheme}
        />

        <PostWriteTagSection
          tagInput={postEdit.tagInput}
          tags={postEdit.tags}
          onChangeTagInput={postEdit.setTagInput}
          onAddTag={postEdit.handleAddTag}
          onRemoveTag={postEdit.handleRemoveTag}
        />
      </ScrollView>
      <View style={commonStyles.bottomAction}>
        <PostWriteSubmitButton
          label="수정 완료"
          isSubmitting={postEdit.isSubmitting}
          onSubmit={postEdit.handleSubmit}
        />
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  keyboardRoot: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 30,
    paddingBottom: 137,
  },
});

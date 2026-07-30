import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { commonStyles } from "src/design/commonStyles";
import { layout } from "src/design/theme";
import { useProfileEditFlow } from "src/features/user/useProfileEditFlow";
import { ProfileEditImagePicker } from "./components/ProfileEditImagePicker";
import { ProfileEditStateView } from "./components/ProfileEditStateView";
import { ProfileEditSubmitBar } from "./components/ProfileEditSubmitBar";
import { ProfileNicknameForm } from "./components/ProfileNicknameForm";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileEdit">;

export default function ProfileEditScreen({ navigation }: Props) {
  const profileEdit = useProfileEditFlow({
    onComplete: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      navigation.navigate("MyPage");
    },
  });

  if (profileEdit.isLoading) {
    return <ProfileEditStateView type="loading" />;
  }

  if (profileEdit.isError || !profileEdit.me) {
    return <ProfileEditStateView type="error" onRetry={() => profileEdit.refetch()} />;
  }

  return (
    <View style={commonStyles.screen}>
      <ScreenHeader title="프로필 수정" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ProfileEditImagePicker
          profileUri={profileEdit.profileUri}
          fallbackInitial={profileEdit.fallbackInitial}
          hasProfileImage={!!profileEdit.me.profile}
          hasSelectedImage={!!profileEdit.selectedImage}
          isDeletingImage={profileEdit.isDeletingImage}
          onPickImage={profileEdit.handlePickImage}
          onTakeImage={profileEdit.handleTakeImage}
          onDeleteImage={profileEdit.handleDeleteProfileImage}
        />

        <ProfileNicknameForm
          nickname={profileEdit.nickname}
          error={profileEdit.error}
          onChangeNickname={profileEdit.handleChangeNickname}
          onValidateNickname={profileEdit.handleValidateNickname}
        />
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <ProfileEditSubmitBar
          isSaving={profileEdit.isSaving}
          disabled={profileEdit.isSubmitDisabled}
          onSave={profileEdit.handleSave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 20,
    paddingBottom: 148,
  },
});

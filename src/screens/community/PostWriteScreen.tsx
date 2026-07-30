import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { colors } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { usePostWriteFlow } from "src/features/community/usePostWriteFlow";
import { PostWriteContentSection } from "./components/PostWriteContentSection";
import { PostWriteImageSection } from "./components/PostWriteImageSection";
import { PostWriteLocationSection } from "./components/PostWriteLocationSection";
import { PostWriteSubmitButton } from "./components/PostWriteSubmitButton";
import { PostWriteTagSection } from "./components/PostWriteTagSection";
import { PostWriteThemeSection } from "./components/PostWriteThemeSection";

type Props = NativeStackScreenProps<RootStackParamList, "PostWrite">;

export default function PostWriteScreen({ navigation, route }: Props) {
  const postWrite = usePostWriteFlow({
    routeParams: route.params,
    onBack: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      navigation.navigate("Community");
    },
    onOpenCreatedPost: (postId) => navigation.replace("PostDetail", { postId }),
    onOpenCreatedSpotOnMap: ({ spotId, latitude, longitude }) => {
      navigation.replace("Map", {
        focusId: spotId,
        latitude,
        longitude,
        type: "SPOT",
        filter: "SPOT",
      });
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <PostWriteImageSection
          images={postWrite.spot.images}
          onPickImages={postWrite.handlePickImages}
          onTakeImages={postWrite.handleTakeImages}
          onRemoveImage={postWrite.handleRemoveImage}
        />

        <PostWriteLocationSection
          name={postWrite.spot.name || ""}
          latitude={postWrite.spot.latitude}
          longitude={postWrite.spot.longitude}
          error={postWrite.errors.name}
          onChangeName={postWrite.handleChangeLocationText}
          onUseCurrentLocation={postWrite.handleUseCurrentLocation}
        />

        <PostWriteContentSection
          description={postWrite.spot.description ?? ""}
          error={postWrite.errors.description}
          onChangeDescription={postWrite.handleChangeDescription}
        />

        <PostWriteThemeSection
          themeId={postWrite.spot.themeId}
          onSelectTheme={postWrite.handleSelectTheme}
        />

        <PostWriteTagSection
          tagInput={postWrite.tagInput}
          tags={postWrite.tags}
          onChangeTagInput={postWrite.setTagInput}
          onAddTag={postWrite.handleAddTag}
          onRemoveTag={postWrite.handleRemoveTag}
        />
      </ScrollView>
      <View style={commonStyles.bottomAction}>
        <PostWriteSubmitButton
          isSubmitting={postWrite.isSubmitting}
          onSubmit={postWrite.handleSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

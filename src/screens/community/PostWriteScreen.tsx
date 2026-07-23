import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { colors, layout } from "src/design/theme";
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
      <View style={styles.bottomAction}>
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
    backgroundColor: colors.bg[50],
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 20,
    paddingBottom: 137,
  },
  bottomAction: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    paddingBottom: layout.bottomActionPaddingBottom,
    backgroundColor: colors.bg[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
    shadowColor: "#D2D2D2",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});

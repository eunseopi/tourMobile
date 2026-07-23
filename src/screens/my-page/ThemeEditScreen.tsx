import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { ScreenStateView } from "src/components/ui/ScreenStateView";
import { commonStyles } from "src/design/commonStyles";
import { layout } from "src/design/theme";
import { useThemeEditFlow } from "src/features/user/useThemeEditFlow";
import { ThemeSelectionGrid } from "./components/ThemeSelectionGrid";

type Props = NativeStackScreenProps<RootStackParamList, "ThemeEdit">;

export default function ThemeEditScreen({ navigation }: Props) {
  const themeEdit = useThemeEditFlow({
    onComplete: navigation.goBack,
  });

  if (themeEdit.isLoading) {
    return (
      <ScreenStateView
        type="loading"
        loadingText="관심 테마를 불러오는 중..."
        errorText="관심 테마를 불러오지 못했어요."
      />
    );
  }

  if (themeEdit.isError) {
    return (
      <ScreenStateView
        type="error"
        loadingText="관심 테마를 불러오는 중..."
        errorText="관심 테마를 불러오지 못했어요."
        onRetry={() => themeEdit.refetch()}
      />
    );
  }

  return (
    <View style={commonStyles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemeSelectionGrid selected={themeEdit.selected} onToggleTheme={themeEdit.toggleTheme} />
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <PrimaryActionButton
          label="수정하기"
          isLoading={themeEdit.isSaving}
          onPress={themeEdit.handleSave}
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
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 59,
    paddingBottom: 132,
  },
});

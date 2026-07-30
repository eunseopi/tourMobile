import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { commonStyles } from "src/design/commonStyles";
import { colors } from "src/design/theme";
import { useChallengeCompleteFlow } from "src/features/challenges/useChallengeCompleteFlow";
import { ChallengeCompleteButton } from "./components/ChallengeCompleteButton";
import { ChallengeCompleteSummary } from "./components/ChallengeCompleteSummary";
import { ChallengeProofPhotoSection } from "./components/ChallengeProofPhotoSection";

type Props = NativeStackScreenProps<RootStackParamList, "ChallengeComplete">;

export default function ChallengeCompleteScreen({ navigation, route }: Props) {
  const { challenge } = route.params;
  const challengeComplete = useChallengeCompleteFlow({
    challenge,
    onComplete: () =>
      navigation.replace("Challenge", {
        initialTab: "done",
        highlightId: challenge.id,
      }),
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="챌린지 인증" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ChallengeCompleteSummary challenge={challenge} />

        <ChallengeProofPhotoSection
          selectedPhoto={challengeComplete.selectedPhoto}
          onPickPhoto={challengeComplete.handlePickPhoto}
          onTakePhoto={challengeComplete.handleTakePhoto}
        />
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <ChallengeCompleteButton
          isSubmitting={challengeComplete.isSubmitting}
          onComplete={challengeComplete.handleComplete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },
});

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
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
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Challenge",
            params: {
              initialTab: "done",
              highlightId: challenge.id,
            },
          },
        ],
      }),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ChallengeCompleteSummary challenge={challenge} />

      <ChallengeProofPhotoSection
        selectedPhoto={challengeComplete.selectedPhoto}
        onPickPhoto={challengeComplete.handlePickPhoto}
        onTakePhoto={challengeComplete.handleTakePhoto}
      />

      <ChallengeCompleteButton
        isSubmitting={challengeComplete.isSubmitting}
        onComplete={challengeComplete.handleComplete}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
});

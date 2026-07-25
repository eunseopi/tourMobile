import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { colors } from "src/design/theme";
import { useChallengeStartFlow } from "src/features/challenges/useChallengeStartFlow";
import { ChallengeCompleteSummary } from "./components/ChallengeCompleteSummary";
import { ChallengeStartInfo } from "./components/ChallengeStartInfo";

type Props = NativeStackScreenProps<RootStackParamList, "ChallengeDetail">;

export default function ChallengeDetailScreen({ navigation, route }: Props) {
  const { challenge } = route.params;
  const challengeStart = useChallengeStartFlow({
    challenge,
    onStarted: () =>
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Challenge",
            params: {
              initialTab: "doing",
            },
          },
        ],
      }),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ChallengeCompleteSummary challenge={challenge} badgeLabel={challenge.categoryLabel} />
      <ChallengeStartInfo
        challenge={challenge}
        onOpenMap={
          challenge.latitude != null && challenge.longitude != null
            ? () =>
                navigation.navigate("Map", {
                  focusId: challenge.id,
                  latitude: challenge.latitude ?? undefined,
                  longitude: challenge.longitude ?? undefined,
                  type: "CHALLENGE",
                  filter: "CHALLENGE",
                })
            : undefined
        }
      />
      <View style={styles.bottomAction}>
        <PrimaryActionButton
          label="시작하기"
          loadingLabel="시작 중..."
          isLoading={challengeStart.isStarting}
          onPress={challengeStart.handleStart}
        />
      </View>
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
    paddingBottom: 120,
  },
  bottomAction: {
    marginTop: 24,
  },
});

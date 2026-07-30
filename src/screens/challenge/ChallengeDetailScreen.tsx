import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";
import { useChallengeStartFlow } from "src/features/challenges/useChallengeStartFlow";
import { ChallengeStartInfo } from "./components/ChallengeStartInfo";

type Props = NativeStackScreenProps<RootStackParamList, "ChallengeDetail">;

export default function ChallengeDetailScreen({ navigation, route }: Props) {
  const { challenge } = route.params;
  const challengeStart = useChallengeStartFlow({
    challenge,
    onStarted: () =>
      navigation.replace("Challenge", { initialTab: "doing" }),
  });

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{challenge.title}</Text>
          {challenge.description ? (
            <Text style={styles.description}>{challenge.description}</Text>
          ) : null}
        </View>

        <View style={styles.imageBox}>
          {challenge.imageUrl ? (
            <Image source={{ uri: challenge.imageUrl }} style={styles.image} />
          ) : null}
        </View>

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
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <PrimaryActionButton
          label="시작하기"
          loadingLabel="시작 중..."
          isLoading={challengeStart.isStarting}
          style={styles.startButton}
          onPress={challengeStart.handleStart}
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
  titleBlock: {
    marginBottom: 14,
  },
  title: {
    ...typography.head3,
    fontWeight: "700",
    color: colors.gray[800],
  },
  description: {
    marginTop: 6,
    ...typography.body4,
    color: colors.gray[500],
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1 / 0.66,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.gray[200],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  startButton: {
    minHeight: 52,
    borderRadius: 14,
    shadowColor: colors.primary[400],
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

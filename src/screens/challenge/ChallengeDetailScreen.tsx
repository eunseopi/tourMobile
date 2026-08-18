import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { ImageViewerModal } from "src/components/ui/ImageViewerModal";
import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";
import { commonStyles } from "src/design/commonStyles";
import { CHALLENGE_REWARD_POINT } from "src/config/challenge";
import { colors, typography } from "src/design/theme";
import { useChallengeStartFlow } from "src/features/challenges/useChallengeStartFlow";
import { SpotRecommendationsWidget } from "src/screens/map/components/SpotRecommendationsWidget";
import { ChallengeStartInfo } from "./components/ChallengeStartInfo";

type Props = NativeStackScreenProps<RootStackParamList, "ChallengeDetail">;

export default function ChallengeDetailScreen({ navigation, route }: Props) {
  const { challenge } = route.params;
  const [viewerOpen, setViewerOpen] = useState(false);
  const challengeStart = useChallengeStartFlow({
    challenge,
    onStarted: () => {
      navigation.goBack();
      navigation.navigate("Main", { screen: "Challenge", params: { initialTab: "doing" } });
    },
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="진행 전" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{challenge.title}</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>
              🍊 완료 보상 {CHALLENGE_REWARD_POINT.toLocaleString()} 한라봉
            </Text>
          </View>
          {challenge.description ? (
            <Text style={styles.description}>{challenge.description}</Text>
          ) : null}
        </View>

        <View style={styles.imageBox}>
          {challenge.imageUrl ? (
            <Pressable onPress={() => setViewerOpen(true)}>
              <Image source={{ uri: challenge.imageUrl }} style={styles.image} />
            </Pressable>
          ) : null}
        </View>
        {challenge.imageUrl ? (
          <ImageViewerModal
            visible={viewerOpen}
            images={[challenge.imageUrl]}
            onClose={() => setViewerOpen(false)}
          />
        ) : null}

        <ChallengeStartInfo
          challenge={challenge}
          onOpenMap={
            challenge.latitude != null && challenge.longitude != null
              ? () =>
                  navigation.navigate("Map", {
                    focusId: challenge.id,
                    latitude: challenge.latitude ?? undefined,
                    longitude: challenge.longitude ?? undefined,
                  })
              : undefined
          }
        />

        <SpotRecommendationsWidget
          spotId={challenge.id}
          onSelect={(item) => navigation.push("SpotDetail", { spotId: item.id })}
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
    color: colors.gray[600],
  },
  rewardBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
  },
  rewardText: {
    ...typography.body4,
    fontWeight: "700",
    color: colors.primary[500],
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

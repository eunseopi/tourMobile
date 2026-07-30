import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, layout, typography } from "src/design/theme";
import type { ChallengeCardData } from "src/reducer/types";
import NoneTrophy from "src/assets/noneTrophy.svg";
import Stamp from "src/assets/Stamp.svg";
import { SectionState } from "./HomeSection";

type Props = {
  challenge: ChallengeCardData | null;
  onPressDetail: (challenge: ChallengeCardData) => void;
  onPressMap: (challenge: ChallengeCardData) => void;
};

export function FeaturedChallenge({ challenge, onPressDetail, onPressMap }: Props) {
  if (!challenge) return <SectionState>지금 보여드릴 챌린지가 없어요.</SectionState>;

  const isDone = challenge.statusLabel === "완료";
  const tone = challenge.categoryTone ?? "neutral";

  return (
    <View style={styles.card}>
      <Pressable style={styles.media} onPress={() => onPressDetail(challenge)}>
        {challenge.imageUrl ? (
          <Image source={{ uri: challenge.imageUrl }} style={styles.image} />
        ) : null}

        {isDone ? (
          <>
            <View style={styles.dim} />
            <View style={styles.stampWrap}>
              <Stamp width={96} height={96} />
            </View>
          </>
        ) : null}

        <View style={styles.trophyWrap}>
          <NoneTrophy width={24} height={24} />
        </View>

        <View style={[styles.categoryTag, tone === "primary" ? styles.categoryPrimary : styles.categoryNeutral]}>
          <Text style={styles.categoryText}>{challenge.categoryLabel}</Text>
        </View>

        <View style={styles.bottomLeft}>
          <Text style={styles.title} numberOfLines={1}>{challenge.title}</Text>
          <Text style={styles.status}>{challenge.statusLabel}</Text>
        </View>

        {challenge.dateText ? <Text style={styles.dateText}>{challenge.dateText}</Text> : null}
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={styles.actionPrimary} onPress={() => onPressDetail(challenge)}>
          <Text style={styles.actionPrimaryText}>상세 보기</Text>
        </Pressable>
        <Pressable style={styles.actionGhost} onPress={() => onPressMap(challenge)}>
          <Text style={styles.actionGhostText}>지도에서 보기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  media: {
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.gray[200],
  },
  image: { ...StyleSheet.absoluteFillObject },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.28)" },
  stampWrap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  trophyWrap: {
    position: "absolute",
    right: 12,
    top: 12,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryTag: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomRightRadius: 12,
  },
  categoryPrimary: { backgroundColor: colors.primary[400] },
  categoryNeutral: { backgroundColor: colors.gray[600] },
  categoryText: { ...typography.body1, color: colors.base[0] },
  bottomLeft: { position: "absolute", left: 16, bottom: 16, right: 96 },
  title: {
    ...typography.head3,
    fontWeight: "700",
    color: colors.base[0],
    textShadowColor: "rgba(0,0,0,0.16)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  status: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.gray[100],
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.16)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateText: {
    position: "absolute",
    right: 16,
    bottom: 16,
    ...typography.body4,
    fontWeight: "600",
    color: colors.gray[100],
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 10, paddingHorizontal: 2 },
  actionPrimary: {
    flex: 1,
    minHeight: 40,
    borderRadius: layout.buttonRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  actionPrimaryText: { ...typography.caption1, color: colors.base[0] },
  actionGhost: {
    flex: 1,
    minHeight: 40,
    borderRadius: layout.buttonRadius,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  actionGhostText: { ...typography.caption1, color: colors.gray[700] },
});

import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import NoneTrophy from "src/assets/noneTrophy.svg";
import Stamp from "src/assets/Stamp.svg";
import { colors, shadow, typography } from "src/design/theme";
import type { ChallengeCardData } from "src/reducer/types";
import { CHALLENGE_REWARD_POINT } from "src/config/challenge";
import { ChallengeImage } from "./ChallengeImage";

type Props = {
  item: ChallengeCardData;
  highlighted?: boolean;
  onPress?: () => void;
};

export function ChallengeCard({ item, highlighted, onPress }: Props) {
  const isDone = item.statusLabel === "완료";
  const isPrimaryTone = (item.categoryTone ?? "neutral") === "primary";
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.card, highlighted && styles.cardHighlighted]}
        onPress={onPress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
      >
      <View style={styles.cardMedia}>
        <ChallengeImage imageUrl={item.imageUrl} style={styles.image} />

        {isDone ? (
          <>
            <View style={styles.dim} />
            <Stamp width={140} height={140} style={styles.stamp} />
          </>
        ) : null}

        <NoneTrophy width={24} height={24} style={styles.trophy} />

        <View style={[styles.category, isPrimaryTone ? styles.categoryPrimary : styles.categoryNeutral]}>
          <Text style={styles.categoryText}>{item.categoryLabel}</Text>
        </View>

        <View style={styles.bottomLeft}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.status}>{item.statusLabel}</Text>
          {item.recommendReason === "PREF_THEME" && item.categoryLabel ? (
            <Text style={styles.reasonText} numberOfLines={1}>{item.categoryLabel} 테마 선호</Text>
          ) : null}
          <Text style={styles.reward}>🍊 {CHALLENGE_REWARD_POINT.toLocaleString()} 한라봉</Text>
          {highlighted ? <Text style={styles.highlightText}>방금 완료한 챌린지예요</Text> : null}
        </View>
        {item.dateText ? <Text style={styles.cardDate}>{item.dateText}</Text> : null}
      </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 180,
    padding: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  cardHighlighted: {
    borderWidth: 1.5,
    borderColor: colors.primary[400],
  },
  cardMedia: {
    flex: 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.gray[200],
  },
  image: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  stamp: {
    position: "absolute",
    top: 20,
    left: "50%",
    marginLeft: -70,
  },
  trophy: {
    position: "absolute",
    right: 12,
    top: 12,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  category: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  categoryPrimary: {
    backgroundColor: colors.primary[400],
  },
  categoryNeutral: {
    backgroundColor: colors.gray[600],
  },
  categoryText: {
    ...typography.body1,
    color: colors.base[0],
  },
  bottomLeft: {
    position: "absolute",
    left: 16,
    bottom: 16,
    right: 96,
  },
  cardTitle: {
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
  reasonText: {
    ...typography.caption2,
    color: colors.gray[100],
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.16)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  reward: {
    ...typography.caption1,
    fontWeight: "700",
    color: colors.primary[100],
    marginTop: 3,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDate: {
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
  highlightText: {
    ...typography.caption1,
    color: colors.primary[100],
    marginTop: 4,
  },
});

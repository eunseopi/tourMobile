import { StyleSheet, Text, View } from "react-native";
import type { ChallengeCardData } from "src/reducer/types";
import { colors, shadow, typography } from "src/design/theme";
import { ChallengeImage } from "./ChallengeImage";

type Props = {
  challenge: ChallengeCardData;
  badgeLabel?: string;
};

export function ChallengeCompleteSummary({ challenge, badgeLabel }: Props) {
  const isPrimaryTone = (challenge.categoryTone ?? "neutral") === "primary";
  const label = badgeLabel ?? challenge.categoryLabel ?? challenge.statusLabel;

  return (
    <>
      <View style={styles.imageBox}>
        <ChallengeImage imageUrl={challenge.imageUrl} style={styles.image} />
      </View>

      <Text style={[styles.badge, isPrimaryTone ? styles.badgePrimary : styles.badgeNeutral]}>
        {label}
      </Text>
      <Text style={styles.title}>{challenge.title}</Text>
      {challenge.dateText ? <Text style={styles.date}>{challenge.dateText}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    width: "100%",
    aspectRatio: 335 / 180,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    ...typography.body1,
    color: colors.base[0],
  },
  badgePrimary: {
    backgroundColor: colors.primary[400],
  },
  badgeNeutral: {
    backgroundColor: colors.gray[600],
  },
  title: {
    ...typography.head2,
    color: colors.gray[800],
    marginTop: 10,
  },
  date: {
    ...typography.body4,
    color: colors.gray[600],
    marginTop: 8,
  },
});

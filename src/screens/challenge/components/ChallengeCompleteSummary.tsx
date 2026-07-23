import { Image, StyleSheet, Text, View } from "react-native";
import type { ChallengeCardData } from "src/reducer/types";
import { colors, shadow, typography } from "src/design/theme";

type Props = {
  challenge: ChallengeCardData;
  badgeLabel?: string;
};

export function ChallengeCompleteSummary({ challenge, badgeLabel = "진행중" }: Props) {
  return (
    <>
      <View style={styles.imageBox}>
        {challenge.imageUrl ? (
          <Image source={{ uri: challenge.imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Challenge</Text>
        )}
      </View>

      <Text style={styles.badge}>{badgeLabel}</Text>
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
  placeholderText: {
    ...typography.body1,
    color: colors.primary[400],
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.primary[400],
    ...typography.body1,
    color: colors.base[0],
  },
  title: {
    ...typography.head2,
    color: colors.gray[800],
    marginTop: 10,
  },
  date: {
    ...typography.body4,
    color: colors.gray[500],
    marginTop: 8,
  },
});

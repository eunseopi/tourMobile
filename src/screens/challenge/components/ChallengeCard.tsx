import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";
import type { ChallengeCardData } from "src/reducer/types";

type Props = {
  item: ChallengeCardData;
  highlighted?: boolean;
  onPress?: () => void;
};

export function ChallengeCard({ item, highlighted, onPress }: Props) {
  return (
    <Pressable style={[styles.card, highlighted && styles.cardHighlighted]} onPress={onPress}>
      <View style={styles.cardMedia}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : null}
        {item.statusLabel === "완료" ? <View style={styles.dim} /> : null}
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.category}>{item.categoryLabel}</Text>
        <View style={styles.bottomLeft}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.status}>{item.statusLabel}</Text>
          {highlighted ? <Text style={styles.highlightText}>방금 완료한 챌린지예요</Text> : null}
        </View>
        {item.dateText ? <Text style={styles.cardDate}>{item.dateText}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 335,
    maxWidth: "100%",
    height: 180,
    alignSelf: "center",
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
  trophy: {
    position: "absolute",
    right: 12,
    top: 12,
    fontSize: 22,
  },
  category: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    ...typography.body1,
    color: colors.base[0],
    backgroundColor: colors.gray[600],
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
  },
  status: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.gray[100],
    marginTop: 2,
  },
  cardDate: {
    position: "absolute",
    right: 16,
    bottom: 16,
    ...typography.body4,
    fontWeight: "600",
    color: colors.gray[100],
  },
  highlightText: {
    ...typography.caption1,
    color: colors.primary[100],
    marginTop: 4,
  },
});

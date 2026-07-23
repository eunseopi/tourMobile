import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import type { ChallengeCardData } from "src/reducer/types";
import { SectionState } from "./HomeSection";

type Props = {
  challenge: ChallengeCardData | null;
  onPressDetail: (challenge: ChallengeCardData) => void;
  onPressMap: () => void;
};

export function FeaturedChallenge({ challenge, onPressDetail, onPressMap }: Props) {
  if (!challenge) return <SectionState>지금 보여드릴 챌린지가 없어요.</SectionState>;

  return (
    <View style={styles.challengeFeature}>
      <View style={styles.challengeTextBox}>
        <Text style={styles.challengeStatus}>{challenge.statusLabel}</Text>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <Text style={styles.challengeMeta}>{challenge.dateText || challenge.categoryLabel}</Text>
        <View style={styles.challengeActions}>
          <Pressable style={styles.challengeActionPrimary} onPress={() => onPressDetail(challenge)}>
            <Text style={styles.challengeActionPrimaryText}>상세 보기</Text>
          </Pressable>
          <Pressable style={styles.challengeActionGhost} onPress={onPressMap}>
            <Text style={styles.challengeActionGhostText}>지도에서 보기</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.challengeArrow}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  challengeFeature: { marginTop: 12, minHeight: 104, padding: 18, borderRadius: 12, flexDirection: "row", alignItems: "center", backgroundColor: colors.gray[800] },
  challengeTextBox: { flex: 1, paddingRight: 12 },
  challengeStatus: { ...typography.caption1, color: colors.primary[300] },
  challengeTitle: { ...typography.head4, color: colors.base[0], marginTop: 8 },
  challengeMeta: { ...typography.caption2, color: colors.gray[200], marginTop: 8 },
  challengeActions: { flexDirection: "row", gap: 8, marginTop: 14 },
  challengeActionPrimary: { minHeight: 38, paddingHorizontal: 14, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary[400] },
  challengeActionPrimaryText: { ...typography.caption1, color: colors.base[0] },
  challengeActionGhost: { minHeight: 38, paddingHorizontal: 14, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.gray[700], borderWidth: 1, borderColor: colors.gray[600] },
  challengeActionGhostText: { ...typography.caption1, color: colors.gray[100] },
  challengeArrow: { fontSize: 28, color: colors.gray[400] },
});

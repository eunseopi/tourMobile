import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

export function ChallengeStartInfo() {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoTitle}>챌린지 위치</Text>
      <View style={styles.mapPreview} />
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
  },
  infoTitle: {
    ...typography.head4,
    color: colors.gray[800],
  },
  mapPreview: {
    width: "100%",
    minHeight: 180,
    borderRadius: 16,
    marginTop: 12,
    backgroundColor: colors.gray[200],
  },
});

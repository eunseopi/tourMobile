import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

export function ChallengeStartInfo() {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoTitle}>챌린지 위치</Text>
      <Text style={styles.infoText}>
        지도 연동 전까지는 현재 위치 권한을 확인한 뒤 서버에 시작 요청을 보냅니다.
      </Text>
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
  infoText: {
    ...typography.body4,
    color: colors.gray[600],
    marginTop: 8,
  },
});

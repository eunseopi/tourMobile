import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ChallengeCardData } from "src/reducer/types";
import { colors, typography } from "src/design/theme";

type Props = {
  challenge: ChallengeCardData;
  onOpenMap?: () => void;
};

export function ChallengeStartInfo({ challenge, onOpenMap }: Props) {
  const hasCoords = challenge.latitude != null && challenge.longitude != null;

  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoTitle}>챌린지 위치</Text>
      {hasCoords ? (
        <Pressable style={styles.mapPreview} onPress={onOpenMap}>
          <Text style={styles.mapPreviewTitle}>지도에서 위치 확인하기</Text>
          <Text style={styles.mapPreviewMeta}>
            {Number(challenge.latitude).toFixed(5)}, {Number(challenge.longitude).toFixed(5)}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.mapPreview}>
          <Text style={styles.mapPreviewTitle}>위치 정보 확인 중</Text>
          <Text style={styles.mapPreviewMeta}>챌린지를 시작하면 현재 위치를 기준으로 진행돼요.</Text>
        </View>
      )}
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
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.primary[50],
  },
  mapPreviewTitle: {
    ...typography.body1,
    color: colors.gray[800],
    textAlign: "center",
  },
  mapPreviewMeta: {
    ...typography.caption2,
    color: colors.gray[600],
    marginTop: 8,
    textAlign: "center",
  },
});

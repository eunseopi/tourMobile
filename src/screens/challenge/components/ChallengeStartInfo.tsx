import { Pressable, StyleSheet, Text, View } from "react-native";
import ChallengePosIcon from "src/assets/challengePos.svg";
import LocationPin from "src/assets/Location.svg";
import type { ChallengeCardData } from "src/reducer/types";
import { colors, typography } from "src/design/theme";

type Props = {
  challenge: ChallengeCardData;
  onOpenMap?: () => void;
};

export function ChallengeStartInfo({ challenge, onOpenMap }: Props) {
  const hasCoords = challenge.latitude != null && challenge.longitude != null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <ChallengePosIcon width={18} height={18} />
        <Text style={styles.infoTitle}>챌린지 위치</Text>
      </View>

      {hasCoords ? (
        <Pressable style={styles.mapPreview} onPress={onOpenMap}>
          <LocationPin width={40} height={40} />
          <Text style={styles.mapPreviewTitle}>지도에서 위치 확인하기</Text>
        </Pressable>
      ) : (
        <View style={styles.mapPreview}>
          <LocationPin width={40} height={40} />
          <Text style={styles.mapPreviewTitle}>위치 정보 확인 중</Text>
          <Text style={styles.mapPreviewMeta}>
            챌린지를 시작하면 현재 위치를 기준으로 진행돼요.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    ...typography.head4,
    color: colors.gray[800],
  },
  mapPreview: {
    width: "100%",
    minHeight: 180,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
    backgroundColor: colors.gray[100],
    overflow: "hidden",
  },
  mapPreviewTitle: {
    ...typography.body1,
    color: colors.gray[800],
    textAlign: "center",
  },
  mapPreviewMeta: {
    ...typography.caption2,
    color: colors.gray[600],
    textAlign: "center",
  },
});

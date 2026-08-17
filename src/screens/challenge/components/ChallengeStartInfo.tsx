import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import ChallengePosIcon from "src/assets/challengePos.svg";
import LocationPin from "src/assets/Location.svg";
import SpotMarker from "src/assets/spot.svg";
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
          <MapView
            style={StyleSheet.absoluteFillObject}
            region={{
              latitude: Number(challenge.latitude),
              longitude: Number(challenge.longitude),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            pointerEvents="none"
          >
            <Marker
              coordinate={{ latitude: Number(challenge.latitude), longitude: Number(challenge.longitude) }}
            >
              <SpotMarker width={30} height={31} />
            </Marker>
          </MapView>
          <View style={styles.mapPreviewOverlay}>
            <Text style={styles.mapPreviewOverlayText}>지도에서 크게 보기</Text>
          </View>
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
  mapPreviewOverlay: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  mapPreviewOverlayText: {
    ...typography.caption1,
    color: colors.gray[700],
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

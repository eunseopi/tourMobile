import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import ChallengeOngoingMarker from "src/assets/challengeOngoingMarker.svg";
import IsDoneMarker from "src/assets/isDoneMarker.svg";
import SpotMarker from "src/assets/spot.svg";
import { colors } from "src/design/theme";
import type { ClusteredMarker, MapMarkerItem } from "../types";
import { getChallengeStatus, markerColor, markerDescription, pickDominantStatus } from "../mapUtils";

type Props = {
  markers: ClusteredMarker[];
  selectedId: string | number | null;
  ongoingIds: Set<string>;
  completedIds: Set<string>;
  onMarkerPress: (id: string | number) => void;
  onClusterPress: (cluster: Extract<ClusteredMarker, { kind: "cluster" }>) => void;
};

const PIN_WIDTH = 36;
const PIN_HEIGHT = 37;

// 스팟/미시작 챌린지(이용 가능)는 주황 핀, 내가 진행중인 챌린지는 파란 핀,
// 인증까지 끝낸 챌린지는 회색 핀으로 구분한다.
function MarkerPin({ item, ongoingIds, completedIds }: { item: MapMarkerItem; ongoingIds: Set<string>; completedIds: Set<string> }) {
  const status = getChallengeStatus(item, ongoingIds, completedIds);
  if (status === "done") return <IsDoneMarker width={PIN_WIDTH} height={PIN_HEIGHT} />;
  if (status === "ongoing") return <ChallengeOngoingMarker width={PIN_WIDTH} height={PIN_HEIGHT} />;
  return <SpotMarker width={PIN_WIDTH} height={PIN_HEIGHT} />;
}

export function MarkerLayer({ markers, selectedId, ongoingIds, completedIds, onMarkerPress, onClusterPress }: Props) {
  return (
    <>
      {markers.map((entry) =>
        entry.kind === "item" ? (
          <Marker
            key={String(entry.item.id)}
            coordinate={{
              latitude: Number(entry.item.latitude),
              longitude: Number(entry.item.longitude),
            }}
            title={entry.item.name}
            description={markerDescription(entry.item.type, entry.item.likeCount)}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => onMarkerPress(entry.item.id)}
          >
            <View
              style={[
                styles.markerWrap,
                String(selectedId) === String(entry.item.id) && styles.markerWrapSelected,
              ]}
            >
              <MarkerPin item={entry.item} ongoingIds={ongoingIds} completedIds={completedIds} />
            </View>
          </Marker>
        ) : (
          <Marker
            key={entry.id}
            coordinate={{ latitude: entry.latitude, longitude: entry.longitude }}
            onPress={() => onClusterPress(entry)}
          >
            <View style={styles.clusterWrap}>
              <View
                style={[
                  styles.clusterBubble,
                  {
                    backgroundColor: markerColor(
                      entry.dominantType === "CHALLENGE"
                        ? pickDominantStatus(entry.items, ongoingIds, completedIds)
                        : "available"
                    ),
                  },
                ]}
              >
                <Text style={styles.clusterCount}>{entry.count}</Text>
              </View>
            </View>
          </Marker>
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  markerWrap: { alignItems: "center", justifyContent: "flex-end" },
  markerWrapSelected: { transform: [{ scale: 1.12 }] },
  clusterWrap: { alignItems: "center", justifyContent: "center" },
  clusterBubble: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.base[0],
  },
  clusterCount: { color: colors.base[0], fontSize: 14, fontWeight: "700" },
});

import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import ChallengeMarker from "src/assets/challenge.svg";
import IsDoneMarker from "src/assets/isDoneMarker.svg";
import SpotMarker from "src/assets/spot.svg";
import { colors } from "src/design/theme";
import type { ClusteredMarker, MapMarkerItem } from "../types";
import { markerColor, markerDescription } from "../mapUtils";

type Props = {
  markers: ClusteredMarker[];
  selectedId: string | number | null;
  onMarkerPress: (id: string | number) => void;
  onClusterPress: (cluster: Extract<ClusteredMarker, { kind: "cluster" }>) => void;
};

const PIN_WIDTH = 36;
const PIN_HEIGHT = 37;

function MarkerPin({ item }: { item: MapMarkerItem }) {
  if (item.type === "CHALLENGE") {
    return item.challengeOngoing === false ? (
      <IsDoneMarker width={PIN_WIDTH} height={PIN_HEIGHT} />
    ) : (
      <ChallengeMarker width={PIN_WIDTH} height={PIN_HEIGHT} />
    );
  }
  return <SpotMarker width={PIN_WIDTH} height={PIN_HEIGHT} />;
}

export function MarkerLayer({ markers, selectedId, onMarkerPress, onClusterPress }: Props) {
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
              <MarkerPin item={entry.item} />
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
                  { backgroundColor: markerColor(entry.dominantType) },
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

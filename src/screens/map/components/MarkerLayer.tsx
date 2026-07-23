import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import { colors } from "src/design/theme";
import type { ClusteredMarker } from "../types";
import { markerColor, markerDescription, markerIcon } from "../mapUtils";

type Props = {
  markers: ClusteredMarker[];
  selectedId: string | number | null;
  onMarkerPress: (id: string | number) => void;
  onClusterPress: (cluster: Extract<ClusteredMarker, { kind: "cluster" }>) => void;
};

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
            onPress={() => onMarkerPress(entry.item.id)}
          >
            <View style={styles.markerWrap}>
              <View
                style={[
                  styles.markerBubble,
                  { backgroundColor: markerColor(entry.item.type) },
                  String(selectedId) === String(entry.item.id) && styles.markerBubbleSelected,
                ]}
              >
                <Text style={styles.markerIcon}>{markerIcon(entry.item.type)}</Text>
              </View>
              <View
                style={[
                  styles.markerStem,
                  { backgroundColor: markerColor(entry.item.type) },
                  String(selectedId) === String(entry.item.id) && styles.markerStemSelected,
                ]}
              />
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
  markerWrap: { alignItems: "center" },
  clusterWrap: { alignItems: "center", justifyContent: "center" },
  markerBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.base[0],
  },
  markerBubbleSelected: { transform: [{ scale: 1.12 }] },
  markerIcon: { color: colors.base[0], fontWeight: "700", fontSize: 14 },
  markerStem: {
    width: 4,
    height: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: -2,
  },
  markerStemSelected: { height: 12 },
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

import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import BlackPig from "src/assets/BlackPig.svg";

type Props = {
  latitude: number;
  longitude: number;
};

const PIG_WIDTH = 44;
const PIG_HEIGHT = 54;

export function UserLocationMarker({ latitude, longitude }: Props) {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.92 }}
      tracksViewChanges={false}
      zIndex={10}
    >
      <View style={styles.wrap}>
        <BlackPig width={PIG_WIDTH} height={PIG_HEIGHT} />
        <View style={styles.shadow} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "flex-end" },
  shadow: {
    width: 26,
    height: 8,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.22)",
    marginTop: -4,
  },
});

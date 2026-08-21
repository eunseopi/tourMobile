import { Image } from "react-native";
import { Marker } from "react-native-maps";

const PIG_WIDTH = 20;
const PIG_HEIGHT = 25;

type Props = {
  latitude: number;
  longitude: number;
};

export function UserLocationMarker({ latitude, longitude }: Props) {
  return (
    <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.92 }} zIndex={10}>
      <Image
        source={require("src/assets/BlackPigMarker.png")}
        style={{ width: PIG_WIDTH, height: PIG_HEIGHT }}
        resizeMode="contain"
      />
    </Marker>
  );
}

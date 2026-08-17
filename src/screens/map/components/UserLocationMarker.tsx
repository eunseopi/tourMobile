import { Marker } from "react-native-maps";

type Props = {
  latitude: number;
  longitude: number;
};

export function UserLocationMarker({ latitude, longitude }: Props) {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.92 }}
      zIndex={10}
      image={require("src/assets/BlackPigMarker.png")}
    />
  );
}

import { Linking, Platform } from "react-native";
import { Alert } from "src/components/ui/AppAlert";

export function openDirections(latitude: number, longitude: number, label?: string) {
  const destination = `${latitude},${longitude}`;
  const query = label ? encodeURIComponent(label) : destination;
  const webFallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  const nativeUrl =
    Platform.OS === "ios"
      ? `maps://app?daddr=${destination}&q=${query}`
      : `geo:${destination}?q=${destination}(${query})`;

  Linking.openURL(nativeUrl).catch(() => {
    Linking.openURL(webFallbackUrl).catch(() => {
      Alert.alert("길찾기", "지도 앱을 열지 못했어요.");
    });
  });
}

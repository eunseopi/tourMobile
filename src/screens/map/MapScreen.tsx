import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import type { RootStackParamList } from "src/app/navigation/types";
import { useKeyboardHeight } from "src/utils/lib/useKeyboardHeight";
import { MapBottomSheet } from "./components/MapBottomSheet";
import { MapHud } from "./components/MapHud";
import { MapLocationPicker } from "./components/MapLocationPicker";
import { MarkerLayer } from "./components/MarkerLayer";
import { MapPreviewRail } from "./components/MapRails";
import { UserLocationMarker } from "./components/UserLocationMarker";
import { useMapScreenFlow } from "./useMapScreenFlow";

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation, route }: Props) {
  const map = useMapScreenFlow(navigation, route.params);
  const keyboardHeight = useKeyboardHeight();

  return (
    <View style={styles.container}>
      <MapView
        ref={map.mapRef}
        style={styles.map}
        initialRegion={map.region}
        onRegionChangeComplete={map.handleRegionChangeComplete}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <MarkerLayer
          markers={map.clusteredMarkers}
          selectedId={map.selectedId}
          ongoingIds={map.ongoingIds}
          completedIds={map.completedIds}
          onMarkerPress={map.handleMarkerPress}
          onClusterPress={map.handleClusterPress}
        />

        {map.currentLocation && (
          <UserLocationMarker
            latitude={map.currentLocation.latitude}
            longitude={map.currentLocation.longitude}
          />
        )}
      </MapView>

      {map.pickMode ? null : (
        <MapPreviewRail
          items={map.filteredMarkers}
          selectedItem={map.selectedItem}
          onFocusItem={map.handleFocusItem}
        />
      )}

      <MapHud
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        isLocating={map.isLocating}
        markerCount={map.filteredMarkers.length}
        searchText={map.searchText}
        activeFilter={map.activeFilter}
        radiusKm={map.radiusKm}
        onChangeSearchText={map.setSearchText}
        onChangeFilter={map.setActiveFilter}
        onChangeRadius={map.handleRadiusChange}
        onRecenter={map.recenter}
      />

      {map.pickMode ? (
        <MapLocationPicker isConfirming={map.isConfirmingLocation} onConfirm={map.handleConfirmLocation} />
      ) : (
        <MapBottomSheet
          style={keyboardHeight > 0 ? { bottom: 18 + keyboardHeight } : undefined}
          isLoading={map.nearby.isLoading || map.search.isLoading}
          selectedItem={map.selectedItem}
          searchText={map.searchText}
          filteredMarkers={map.filteredMarkers}
          ongoingIds={map.ongoingIds}
          completedIds={map.completedIds}
          onOpenSelected={map.handleOpenSelected}
          onWriteSpot={map.handleWriteSpot}
          onFocusItem={map.handleFocusItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

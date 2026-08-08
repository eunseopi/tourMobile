import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import type { RootStackParamList } from "src/app/navigation/types";
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

  return (
    <View style={styles.container}>
      <MapView
        ref={map.mapRef}
        style={styles.map}
        initialRegion={map.region}
        onRegionChangeComplete={map.setRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <MarkerLayer
          markers={map.clusteredMarkers}
          selectedId={map.selectedId}
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
        stepsText={map.pathStats.formatSteps()}
        searchText={map.searchText}
        activeFilter={map.activeFilter}
        radiusKm={map.radiusKm}
        onChangeSearchText={map.setSearchText}
        onChangeFilter={map.setActiveFilter}
        onChangeRadius={map.setRadiusKm}
        onRecenter={map.recenter}
      />

      {map.pickMode ? (
        <MapLocationPicker isConfirming={map.isConfirmingLocation} onConfirm={map.handleConfirmLocation} />
      ) : (
        <MapBottomSheet
          isLoading={map.nearby.isLoading || map.search.isLoading}
          selectedItem={map.selectedItem}
          searchText={map.searchText}
          filteredMarkers={map.filteredMarkers}
          onOpenSelected={map.handleOpenSelected}
          onWriteSpot={map.handleWriteSpot}
          onGoHome={() => navigation.navigate("Main")}
          onGoCommunity={() => navigation.navigate("Main", { screen: "Community" })}
          onGoChallenge={() => navigation.navigate("Main", { screen: "Challenge" })}
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

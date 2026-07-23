import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import type { RootStackParamList } from "src/app/navigation/types";
import { MapBottomSheet } from "./components/MapBottomSheet";
import { MapHud } from "./components/MapHud";
import { MarkerLayer } from "./components/MarkerLayer";
import { MapCardRail, MapPreviewRail } from "./components/MapRails";
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
        showsUserLocation
        showsMyLocationButton={false}
      >
        <MarkerLayer
          markers={map.clusteredMarkers}
          selectedId={map.selectedId}
          onMarkerPress={map.handleMarkerPress}
          onClusterPress={map.handleClusterPress}
        />
      </MapView>

      <MapPreviewRail
        items={map.filteredMarkers}
        selectedItem={map.selectedItem}
        onFocusItem={map.handleFocusItem}
      />

      <MapCardRail
        items={map.filteredMarkers}
        selectedId={map.selectedId}
        listRef={map.cardListRef}
        onFocusItem={map.handleFocusItem}
      />

      <MapHud
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

      <MapBottomSheet
        isLoading={map.nearby.isLoading || map.search.isLoading}
        selectedItem={map.selectedItem}
        searchText={map.searchText}
        filteredMarkers={map.filteredMarkers}
        onOpenSelected={map.handleOpenSelected}
        onWriteSpot={map.handleWriteSpot}
        onGoHome={() => navigation.navigate("Main")}
        onGoCommunity={() => navigation.navigate("Community")}
        onGoChallenge={() => navigation.navigate("Challenge")}
        onFocusItem={map.handleFocusItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

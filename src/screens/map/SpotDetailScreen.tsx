import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { colors } from "src/design/theme";
import { useSpotDetail } from "src/features/spot/useSpotDetail";
import { SpotDetailActions } from "./components/SpotDetailActions";
import { SpotDetailContent } from "./components/SpotDetailContent";
import { SpotDetailStateView } from "./components/SpotDetailStateView";

type Props = NativeStackScreenProps<RootStackParamList, "SpotDetail">;

export default function SpotDetailScreen({ route, navigation }: Props) {
  const { spotId } = route.params;
  const { data: spot, isLoading, isError, refetch, isRefetching } = useSpotDetail(spotId);

  if (isLoading) {
    return <SpotDetailStateView type="loading" />;
  }

  if (isError || !spot) {
    return <SpotDetailStateView type="error" onRetry={() => refetch()} />;
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="스팟 상세" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      >
        <SpotDetailContent spot={spot} />
        <SpotDetailActions
          onOpenMap={() =>
            navigation.navigate("Map", {
              focusId: String(spot.id),
              latitude: spot.latitude,
              longitude: spot.longitude,
              type: "SPOT",
            })
          }
          onOpenCommunity={() => navigation.navigate("Community")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  content: {
    paddingBottom: 32,
  },
});

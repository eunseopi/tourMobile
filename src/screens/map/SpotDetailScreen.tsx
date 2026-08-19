import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { colors } from "src/design/theme";
import { useStartChallenge } from "src/features/challenges/useChallengeMutations";
import { useSpotDetail } from "src/features/spot/useSpotDetail";
import { SpotDetailActions } from "./components/SpotDetailActions";
import { SpotDetailContent } from "./components/SpotDetailContent";
import { SpotDetailStateView } from "./components/SpotDetailStateView";
import { SpotRecommendationsWidget } from "./components/SpotRecommendationsWidget";

type Props = NativeStackScreenProps<RootStackParamList, "SpotDetail">;

export default function SpotDetailScreen({ route, navigation }: Props) {
  const { spotId } = route.params;
  const { data: spot, isLoading, isError, refetch, isRefetching } = useSpotDetail(spotId);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const startChallenge = useStartChallenge();

  useEffect(() => {
    (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") return;
      const current = await Location.getCurrentPositionAsync({});
      setMyLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    })();
  }, []);

  if (isLoading) {
    return <SpotDetailStateView type="loading" />;
  }

  if (isError || !spot) {
    return <SpotDetailStateView type="error" onRetry={() => refetch()} />;
  }

  const handleAddChallenge = () => {
    Alert.alert("챌린지에 추가", `'${spot.name}'을(를) 진행중인 챌린지로 추가할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "추가하기",
        onPress: async () => {
          try {
            const permission = await Location.requestForegroundPermissionsAsync();
            let latitude = Number(spot.latitude);
            let longitude = Number(spot.longitude);

            if (permission.status === "granted") {
              const current = await Location.getCurrentPositionAsync({});
              latitude = current.coords.latitude;
              longitude = current.coords.longitude;
            }

            await startChallenge.mutateAsync({ id: spot.id, latitude, longitude });
            Alert.alert("추가 완료", "챌린지 탭의 '진행중'에서 확인할 수 있어요.", [
              { text: "계속 둘러보기", style: "cancel" },
              {
                text: "확인하러 가기",
                onPress: () =>
                  navigation.navigate("Main", {
                    screen: "Challenge",
                    params: {
                      initialTab: "doing",
                      highlightId: String(spot.id),
                    },
                  }),
              },
            ]);
          } catch (error: any) {
            Alert.alert(
              "추가 실패",
              error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="스팟 상세" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      >
        <SpotDetailContent spot={spot} myLocation={myLocation} />
        <SpotDetailActions
          onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Main"))}
          onAddChallenge={handleAddChallenge}
          isAddingChallenge={startChallenge.isPending}
        />
        <SpotRecommendationsWidget
          spotId={spot.id}
          onSelect={(item) => navigation.push("SpotDetail", { spotId: item.id })}
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

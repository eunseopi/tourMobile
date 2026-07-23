import { useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { useStartChallenge } from "src/features/challenges/useChallengeMutations";
import type { ChallengeCardData } from "src/reducer/types";

type UseChallengeStartFlowOptions = {
  challenge: ChallengeCardData;
  onStarted: () => void;
};

export function useChallengeStartFlow({ challenge, onStarted }: UseChallengeStartFlowOptions) {
  const [locating, setLocating] = useState(false);
  const startChallenge = useStartChallenge();
  const isStarting = locating || startChallenge.isPending;

  const handleStart = async () => {
    try {
      setLocating(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      let latitude = 33.24083;
      let longitude = 126.605983;

      if (permission.status === "granted") {
        const current = await Location.getCurrentPositionAsync({});
        latitude = current.coords.latitude;
        longitude = current.coords.longitude;
      }

      await startChallenge.mutateAsync({
        id: challenge.id,
        latitude,
        longitude,
      });

      Alert.alert("챌린지 시작", "진행중 탭에서 확인할 수 있어요.");
      onStarted();
    } catch (error: any) {
      Alert.alert(
        "시작 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요.",
      );
    } finally {
      setLocating(false);
    }
  };

  return {
    isStarting,
    handleStart,
  };
}

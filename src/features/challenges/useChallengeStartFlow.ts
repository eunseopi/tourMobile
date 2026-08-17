import { useState } from "react";
import { Alert } from "src/components/ui/AppAlert";
import * as Location from "expo-location";
import { useStartChallenge } from "src/features/challenges/useChallengeMutations";
import type { ChallengeCardData } from "src/reducer/types";
import { getCurrentPositionWithFallback } from "src/utils/lib/location";

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
        try {
          const current = await getCurrentPositionWithFallback();
          latitude = current.coords.latitude;
          longitude = current.coords.longitude;
        } catch {
          // 위치를 못 가져와도 기본 좌표로 챌린지 시작 자체는 계속 진행한다.
        }
      }

      const res = await startChallenge.mutateAsync({
        id: challenge.id,
        latitude,
        longitude,
      });

      const point = res.data.data.point;
      const message =
        point > 0
          ? `진행중 탭에서 확인할 수 있어요.\n완료하면 한라봉 ${point}개를 받아요! 🍊`
          : "진행중 탭에서 확인할 수 있어요.";

      Alert.alert("챌린지 시작", message);
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

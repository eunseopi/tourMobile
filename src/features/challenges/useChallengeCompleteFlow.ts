import { useState } from "react";
import { Alert } from "src/components/ui/AppAlert";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useCancelChallenge, useCompleteChallenge } from "src/features/challenges/useChallengeMutations";
import { challengeApi } from "src/api/challengeApi";
import type { ChallengeCardData } from "src/reducer/types";
import { toJpeg } from "src/utils/lib/image";
import { getCurrentPositionWithFallback } from "src/utils/lib/location";

type UseChallengeCompleteFlowOptions = {
  challenge: ChallengeCardData;
  onComplete: () => void;
  onCancel: () => void;
};

export function useChallengeCompleteFlow({
  challenge,
  onComplete,
  onCancel,
}: UseChallengeCompleteFlowOptions) {
  const completeChallenge = useCompleteChallenge();
  const cancelChallenge = useCancelChallenge();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<{ uri: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = submitting || completeChallenge.isPending;

  const toProofPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    const { uri } = await toJpeg(asset.uri, {
      width: asset.width,
      height: asset.height,
    });
    return { uri };
  };

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "인증 사진을 선택하려면 사진 보관함 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      setSelectedPhoto(await toProofPhoto(asset));
    } catch {
      Alert.alert("선택 실패", "사진을 가져오지 못했어요.");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "인증 사진을 촬영하려면 카메라 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      setSelectedPhoto(await toProofPhoto(asset));
    } catch {
      Alert.alert("촬영 실패", "사진을 촬영하지 못했어요.");
    }
  };

  const handleComplete = async () => {
    if (!selectedPhoto) {
      Alert.alert("인증 사진 필요", "완료 전에 인증 사진을 선택해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      let latitude = 33.24083;
      let longitude = 126.605983;

      if (permission.status === "granted") {
        try {
          const current = await getCurrentPositionWithFallback();
          latitude = current.coords.latitude;
          longitude = current.coords.longitude;
        } catch {
          // 위치를 못 가져와도 기본 좌표로 완료 처리 자체는 계속 진행한다.
        }
      }

      const upload = await challengeApi.uploadProofImage(challenge.id, {
        uri: selectedPhoto.uri,
        name: `challenge-proof-${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      const res = await completeChallenge.mutateAsync({
        id: challenge.id,
        latitude,
        longitude,
        proofUrl: upload.data.proofUrl,
        dateText: new Date().toISOString(),
      });

      const awardedPoints = res.data.awardedPoints;
      const completedMissions = res.data.completedMissions ?? [];

      let message = awardedPoints > 0
        ? `챌린지가 완료되었어요.\n한라봉 ${awardedPoints}개를 획득했어요! 🍊`
        : "챌린지가 완료되었어요.";

      if (completedMissions.length > 0) {
        const missionNames = completedMissions.map((m) => `'${m.title}'`).join(", ");
        message += `\n\n🎉 미션 완주! ${missionNames}\n한라봉 1000개를 추가로 받았어요!`;
      }

      if (completedMissions.length > 0) {
        void queryClient.invalidateQueries({ queryKey: ["GET /api/missions"] });
      }

      Alert.alert(completedMissions.length > 0 ? "미션 완주!" : "인증 완료", message, [
        {
          text: "확인",
          onPress: onComplete,
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "완료 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("챌린지 취소", "진행중인 챌린지를 취소할까요?", [
      { text: "아니요", style: "cancel" },
      {
        text: "취소하기",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelChallenge.mutateAsync(challenge.id);
            onCancel();
          } catch (error: any) {
            Alert.alert(
              "취소 실패",
              error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요.",
            );
          }
        },
      },
    ]);
  };

  return {
    selectedPhoto: selectedPhoto?.uri ?? null,
    isSubmitting,
    isCancelling: cancelChallenge.isPending,
    handlePickPhoto,
    handleTakePhoto,
    handleComplete,
    handleCancel,
  };
}

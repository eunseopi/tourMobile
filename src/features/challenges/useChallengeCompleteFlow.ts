import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useCompleteChallenge } from "src/features/challenges/useChallengeMutations";
import type { ChallengeCardData } from "src/reducer/types";

type UseChallengeCompleteFlowOptions = {
  challenge: ChallengeCardData;
  onComplete: () => void;
};

export function useChallengeCompleteFlow({
  challenge,
  onComplete,
}: UseChallengeCompleteFlowOptions) {
  const completeChallenge = useCompleteChallenge();
  const [selectedPhoto, setSelectedPhoto] = useState<{ uri: string; proofUrl: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = submitting || completeChallenge.isPending;

  const toProofPhoto = (asset: ImagePicker.ImagePickerAsset) => {
    const mimeType = asset.mimeType ?? "image/jpeg";
    return {
      uri: asset.uri,
      proofUrl: asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri,
    };
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
        base64: true,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      setSelectedPhoto(toProofPhoto(asset));
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
        base64: true,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      setSelectedPhoto(toProofPhoto(asset));
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
        const current = await Location.getCurrentPositionAsync({});
        latitude = current.coords.latitude;
        longitude = current.coords.longitude;
      }

      await completeChallenge.mutateAsync({
        id: challenge.id,
        latitude,
        longitude,
        proofUrl: selectedPhoto.proofUrl,
        dateText: new Date().toISOString(),
      });

      Alert.alert("인증 완료", "챌린지가 완료되었어요.", [
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

  return {
    selectedPhoto: selectedPhoto?.uri ?? null,
    isSubmitting,
    handlePickPhoto,
    handleTakePhoto,
    handleComplete,
  };
}

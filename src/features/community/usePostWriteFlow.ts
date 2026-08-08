import { useEffect, useReducer, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import type { RootStackParamList } from "src/app/navigation/types";
import { useCreateSpot } from "src/features/spot/useCreateSpot";
import { initialSpot, spotReducer } from "src/reducer/SpotReducer";
import type { SpotCreate } from "src/types/SpotTypes";
import { buildSpotErrorMessage, getSpotErrors } from "src/utils/validation/spotValidation";
import { joinUniqueParts } from "src/utils/lib/location";
import { toJpeg } from "src/utils/lib/image";

type PostWriteParams = RootStackParamList["PostWrite"];
type FieldErrors = { name?: string; description?: string };

type UsePostWriteFlowOptions = {
  routeParams: PostWriteParams;
  onBack: () => void;
  onOpenCreatedPost: (postId: number) => void;
  onOpenCreatedSpotOnMap: (params: {
    spotId: number;
    latitude: number;
    longitude: number;
  }) => void;
};

export const POST_THEME_OPTIONS = [
  { id: 1, label: "데이트" },
  { id: 2, label: "힐링" },
  { id: 3, label: "반려동물" },
  { id: 4, label: "사진 명소" },
  { id: 5, label: "가족 여행" },
  { id: 6, label: "자연" },
  { id: 7, label: "한달 살이" },
  { id: 8, label: "나홀로 여행" },
  { id: 9, label: "맛집 탐방" },
] as const;

async function toUploadableImage(asset: ImagePicker.ImagePickerAsset) {
  const { uri } = await toJpeg(asset.uri);
  return {
    uri,
    name: `spot-${Date.now()}.jpg`,
    type: "image/jpeg",
  };
}

function setTags(dispatch: React.Dispatch<Parameters<typeof spotReducer>[1]>, tags: string[]) {
  dispatch({ type: "SET_FIELD", field: "tag1", value: tags[0] ?? "" });
  dispatch({ type: "SET_FIELD", field: "tag2", value: tags[1] ?? "" });
  dispatch({ type: "SET_FIELD", field: "tag3", value: tags[2] ?? "" });
}

export function usePostWriteFlow({
  routeParams,
  onBack,
  onOpenCreatedPost,
  onOpenCreatedSpotOnMap,
}: UsePostWriteFlowOptions) {
  const createSpot = useCreateSpot();
  const [spot, dispatch] = useReducer(spotReducer, initialSpot as SpotCreate);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [tagInput, setTagInput] = useState("");
  const tags = [spot.tag1, spot.tag2, spot.tag3].filter(Boolean) as string[];
  const openedFromMap = routeParams?.openedFromMap === true;

  useEffect(() => {
    const preset = routeParams?.initialLocation;
    if (!preset) return;

    dispatch({
      type: "SET_COORDS",
      latitude: preset.latitude,
      longitude: preset.longitude,
    });
    if (preset.name) {
      dispatch({ type: "SET_LOCATION_TEXT", value: preset.name });
    }
  }, [routeParams]);

  const handleChangeLocationText = (value: string) => {
    dispatch({ type: "SET_LOCATION_TEXT", value });
    if (errors.name && value.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleChangeDescription = (value: string) => {
    dispatch({ type: "SET_FIELD", field: "description", value });
    if (errors.description && value.trim()) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleSelectTheme = (themeId: number) => {
    dispatch({ type: "SET_FIELD", field: "themeId", value: themeId });
  };

  const handleUseCurrentLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("위치 권한 필요", "현재 위치를 가져오려면 위치 권한이 필요해요.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      dispatch({
        type: "SET_COORDS",
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

      const places = await Location.reverseGeocodeAsync({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
      const place = places[0];
      const name =
        joinUniqueParts([place?.region, place?.district, place?.street, place?.name]) ||
        `제주 스팟 ${current.coords.latitude.toFixed(3)}, ${current.coords.longitude.toFixed(3)}`;

      dispatch({ type: "SET_LOCATION_TEXT", value: name });
      setErrors((prev) => ({ ...prev, name: undefined }));
    } catch {
      Alert.alert("위치 확인 실패", "현재 위치를 가져오지 못했어요.");
    }
  };

  const handlePickImages = async () => {
    try {
      if (spot.images.length >= 5) {
        Alert.alert("입력 제한", "이미지는 최대 5장까지 등록할 수 있어요.");
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "사진을 선택하려면 사진 보관함 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: Math.max(1, 5 - spot.images.length),
      });

      if (result.canceled) return;

      const picked = await Promise.all(result.assets.map(toUploadableImage));
      const merged = [...spot.images, ...picked].slice(0, 5);
      dispatch({ type: "SET_FIELD", field: "images", value: merged });
    } catch {
      Alert.alert("선택 실패", "이미지를 가져오지 못했어요.");
    }
  };

  const handleTakeImages = async () => {
    try {
      if (spot.images.length >= 5) {
        Alert.alert("입력 제한", "이미지는 최대 5장까지 등록할 수 있어요.");
        return;
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "사진을 촬영하려면 카메라 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;

      const merged = [...spot.images, await toUploadableImage(asset)].slice(0, 5);
      dispatch({ type: "SET_FIELD", field: "images", value: merged });
    } catch {
      Alert.alert("촬영 실패", "이미지를 촬영하지 못했어요.");
    }
  };

  const handleRemoveImage = (index: number) => {
    dispatch({ type: "REMOVE_IMAGE", index });
  };

  const handleAddTag = () => {
    const next = tagInput.trim();
    if (!next) return;
    if (tags.length >= 3) {
      Alert.alert("입력 제한", "해시태그는 최대 3개까지 가능해요.");
      return;
    }
    if (tags.includes(next)) {
      setTagInput("");
      return;
    }

    setTags(dispatch, [...tags, next]);
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    setTags(
      dispatch,
      tags.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleSubmit = async () => {
    const nextErrors = getSpotErrors({
      name: spot.name,
      description: spot.description ?? "",
    });
    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.description) {
      Alert.alert("입력 확인", buildSpotErrorMessage(nextErrors));
      return;
    }

    if (!spot.latitude || !spot.longitude) {
      Alert.alert("위치 필요", "현재 위치를 먼저 선택해주세요.");
      return;
    }

    try {
      const created = await createSpot.mutateAsync(spot);
      const createdSpotId = Number(created.data);
      const createdLatitude = Number(spot.latitude);
      const createdLongitude = Number(spot.longitude);

      Alert.alert("등록 완료", "새 스팟이 등록됐어요.", [
        ...(openedFromMap
          ? [
              {
                text: "지도에서 보기",
                onPress: () => {
                  dispatch({ type: "RESET" });
                  onOpenCreatedSpotOnMap({
                    spotId: createdSpotId,
                    latitude: createdLatitude,
                    longitude: createdLongitude,
                  });
                },
              } as const,
            ]
          : []),
        {
          text: "바로 보기",
          onPress: () => {
            dispatch({ type: "RESET" });
            onOpenCreatedPost(createdSpotId);
          },
        },
        {
          text: "닫기",
          onPress: () => {
            dispatch({ type: "RESET" });
            onBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "등록 실패",
        error?.response?.data?.message ?? error?.message ?? "스팟 등록에 실패했어요.",
      );
    }
  };

  return {
    spot,
    errors,
    tags,
    tagInput,
    isSubmitting: createSpot.isPending,
    setTagInput,
    handleChangeLocationText,
    handleChangeDescription,
    handleSelectTheme,
    handleUseCurrentLocation,
    handlePickImages,
    handleTakeImages,
    handleRemoveImage,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
  };
}

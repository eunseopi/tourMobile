import { useEffect, useReducer, useState } from "react";
import { Alert } from "src/components/ui/AppAlert";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import { useUpdateSpot } from "src/features/spot/useUpdateSpot";
import { toUploadableImage } from "src/features/community/usePostWriteFlow";
import { initialSpot, spotReducer } from "src/reducer/SpotReducer";
import type { SpotCreate, UploadableImage } from "src/types/SpotTypes";
import { getCurrentPositionWithFallback, getLocationErrorMessage, joinUniqueParts } from "src/utils/lib/location";
import { buildSpotErrorMessage, getSpotErrors } from "src/utils/validation/spotValidation";

type FieldErrors = { title?: string; name?: string; description?: string };
const MAX_POST_IMAGES = 3;

type UsePostEditFlowOptions = {
  postId: number;
  onBack: () => void;
  onSaved: () => void;
};

function setTags(dispatch: React.Dispatch<Parameters<typeof spotReducer>[1]>, tags: string[]) {
  dispatch({ type: "SET_FIELD", field: "tag1", value: tags[0] ?? "" });
  dispatch({ type: "SET_FIELD", field: "tag2", value: tags[1] ?? "" });
  dispatch({ type: "SET_FIELD", field: "tag3", value: tags[2] ?? "" });
}

export function usePostEditFlow({ postId, onBack, onSaved }: UsePostEditFlowOptions) {
  const updateSpot = useUpdateSpot(postId);
  const [spot, dispatch] = useReducer(spotReducer, initialSpot as SpotCreate);
  const [keepImageUrls, setKeepImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [tagInput, setTagInput] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const tags = [spot.tag1, spot.tag2, spot.tag3].filter(Boolean) as string[];
  const totalImageCount = keepImageUrls.length + spot.images.length;

  const detailQuery = useQuery({
    queryKey: ["spotDetail", postId],
    queryFn: () => communityApi.getSpotDetail(postId).then((res) => res.data),
  });

  useEffect(() => {
    if (!detailQuery.data || isHydrated) return;
    const post = detailQuery.data;

    dispatch({ type: "SET_FIELD", field: "title", value: post.title });
    dispatch({ type: "SET_FIELD", field: "name", value: post.name });
    dispatch({ type: "SET_FIELD", field: "description", value: post.description ?? "" });
    dispatch({ type: "SET_COORDS", latitude: post.latitude, longitude: post.longitude });
    dispatch({ type: "SET_FIELD", field: "themeId", value: post.themeId ?? 0 });
    setTags(dispatch, post.tags ?? []);
    setKeepImageUrls(post.imageUrls ?? []);
    setIsHydrated(true);
  }, [detailQuery.data, isHydrated]);

  const handleChangeTitle = (value: string) => {
    dispatch({ type: "SET_FIELD", field: "title", value });
    if (errors.title && value.trim()) {
      setErrors((prev) => ({ ...prev, title: undefined }));
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

      const current = await getCurrentPositionWithFallback();
      dispatch({
        type: "SET_COORDS",
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

      let name = `선택한 위치 ${current.coords.latitude.toFixed(5)}, ${current.coords.longitude.toFixed(5)}`;
      try {
        const places = await Location.reverseGeocodeAsync({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
        const place = places[0];
        name =
          joinUniqueParts([place?.region, place?.district, place?.street, place?.name]) || name;
      } catch {
        // 주소 변환이 실패해도 이미 확보한 좌표는 유지한다.
      }

      dispatch({ type: "SET_LOCATION_TEXT", value: name });
      setErrors((prev) => ({ ...prev, name: undefined }));
    } catch (error) {
      Alert.alert("위치 확인 실패", getLocationErrorMessage(error));
    }
  };

  const handlePickImages = async () => {
    try {
      if (totalImageCount >= MAX_POST_IMAGES) {
        Alert.alert("입력 제한", `이미지는 최대 ${MAX_POST_IMAGES}장까지 등록할 수 있어요.`);
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
        selectionLimit: Math.max(1, MAX_POST_IMAGES - totalImageCount),
      });

      if (result.canceled) return;

      const picked = await Promise.all(result.assets.map(toUploadableImage));
      const merged = [...spot.images, ...picked].slice(
        0,
        Math.max(0, MAX_POST_IMAGES - keepImageUrls.length)
      );
      dispatch({ type: "SET_FIELD", field: "images", value: merged });
    } catch {
      Alert.alert("선택 실패", "이미지를 가져오지 못했어요.");
    }
  };

  const handleTakeImages = async () => {
    try {
      if (totalImageCount >= MAX_POST_IMAGES) {
        Alert.alert("입력 제한", `이미지는 최대 ${MAX_POST_IMAGES}장까지 등록할 수 있어요.`);
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

      const merged = [...spot.images, await toUploadableImage(asset)].slice(
        0,
        Math.max(0, MAX_POST_IMAGES - keepImageUrls.length)
      );
      dispatch({ type: "SET_FIELD", field: "images", value: merged });
    } catch {
      Alert.alert("촬영 실패", "이미지를 촬영하지 못했어요.");
    }
  };

  // 기존(원격) 이미지 + 새로 추가한(로컬) 이미지를 하나의 목록으로 합쳐 보여준다.
  const displayImages: UploadableImage[] = [
    ...keepImageUrls.map((uri) => ({ uri })),
    ...spot.images,
  ];

  const handleRemoveImage = (index: number) => {
    if (index < keepImageUrls.length) {
      setKeepImageUrls((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    dispatch({ type: "REMOVE_IMAGE", index: index - keepImageUrls.length });
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
      tags.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const handleSubmit = async () => {
    const nextErrors = getSpotErrors({
      title: spot.title,
      name: spot.name,
      description: spot.description ?? "",
    });
    setErrors(nextErrors);

    if (nextErrors.title || nextErrors.name || nextErrors.description) {
      Alert.alert("입력 확인", buildSpotErrorMessage(nextErrors));
      return;
    }

    if (!spot.latitude || !spot.longitude) {
      Alert.alert("위치 필요", "위치 정보가 없어요.");
      return;
    }

    try {
      await updateSpot.mutateAsync({
        payload: {
          title: spot.title,
          name: spot.name,
          description: spot.description,
          latitude: spot.latitude,
          longitude: spot.longitude,
          themeId: spot.themeId || null,
          tag1: spot.tag1,
          tag2: spot.tag2,
          tag3: spot.tag3,
          keepImageUrls,
        },
        newImages: spot.images,
      });
      onSaved();
    } catch (error: any) {
      Alert.alert(
        "수정 실패",
        error?.response?.data?.message ?? error?.message ?? "게시글 수정에 실패했어요."
      );
    }
  };

  return {
    spot,
    displayImages,
    errors,
    tags,
    tagInput,
    isLoading: detailQuery.isLoading || !isHydrated,
    isError: detailQuery.isError,
    isSubmitting: updateSpot.isPending,
    setTagInput,
    handleChangeTitle,
    handleChangeDescription,
    handleSelectTheme,
    handleUseCurrentLocation,
    handlePickImages,
    handleTakeImages,
    handleRemoveImage,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
    refetch: detailQuery.refetch,
    onBack,
  };
}

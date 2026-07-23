import { useEffect, useReducer, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { useCreateSpot } from "src/features/spot/useCreateSpot";
import { initialSpot, spotReducer } from "src/reducer/SpotReducer";
import type { SpotCreate } from "src/types/SpotTypes";
import { buildSpotErrorMessage, getSpotErrors } from "src/utils/validation/spotValidation";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";

type Props = NativeStackScreenProps<RootStackParamList, "PostWrite">;

const THEME_OPTIONS = [
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

export default function PostWriteScreen({ navigation, route }: Props) {
  const createSpot = useCreateSpot();
  const [spot, dispatch] = useReducer(spotReducer, initialSpot as SpotCreate);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [tagInput, setTagInput] = useState("");
  const tags = [spot.tag1, spot.tag2, spot.tag3].filter(Boolean) as string[];
  const openedFromMap = route.params?.openedFromMap === true;

  useEffect(() => {
    const preset = route.params?.initialLocation;
    if (!preset) return;

    dispatch({
      type: "SET_COORDS",
      latitude: preset.latitude,
      longitude: preset.longitude,
    });
    if (preset.name) {
      dispatch({ type: "SET_LOCATION_TEXT", value: preset.name });
    }
  }, [route.params]);

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
        [place?.district, place?.street, place?.name].filter(Boolean).join(" ") ||
        `제주 스팟 ${current.coords.latitude.toFixed(3)}, ${current.coords.longitude.toFixed(3)}`;

      dispatch({ type: "SET_LOCATION_TEXT", value: name });
    } catch {
      Alert.alert("위치 확인 실패", "현재 위치를 가져오지 못했어요.");
    }
  };

  const handlePickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "사진을 선택하려면 사진 보관함 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: Math.max(1, 5 - spot.images.length),
      });

      if (result.canceled) return;

      const picked = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName ?? `spot-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      }));

      const merged = [...spot.images, ...picked].slice(0, 5);
      dispatch({ type: "SET_FIELD", field: "images", value: merged });
    } catch {
      Alert.alert("선택 실패", "이미지를 가져오지 못했어요.");
    }
  };

  const handleTakeImages = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "사진을 촬영하려면 카메라 권한이 필요해요.");
        return;
      }

      const remaining = Math.max(1, 5 - spot.images.length);
      if (remaining <= 0) {
        Alert.alert("입력 제한", "이미지는 최대 5장까지 등록할 수 있어요.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      const nextImage = {
        uri: asset.uri,
        name: asset.fileName ?? `spot-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      };

      const merged = [...spot.images, nextImage].slice(0, 5);
      dispatch({ type: "SET_FIELD", field: "images", value: merged });
    } catch {
      Alert.alert("촬영 실패", "이미지를 촬영하지 못했어요.");
    }
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

    const merged = [...tags, next];
    dispatch({ type: "SET_FIELD", field: "tag1", value: merged[0] ?? "" });
    dispatch({ type: "SET_FIELD", field: "tag2", value: merged[1] ?? "" });
    dispatch({ type: "SET_FIELD", field: "tag3", value: merged[2] ?? "" });
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    const merged = tags.filter((_, currentIndex) => currentIndex !== index);
    dispatch({ type: "SET_FIELD", field: "tag1", value: merged[0] ?? "" });
    dispatch({ type: "SET_FIELD", field: "tag2", value: merged[1] ?? "" });
    dispatch({ type: "SET_FIELD", field: "tag3", value: merged[2] ?? "" });
  };

  const handleRemoveImage = (index: number) => {
    dispatch({ type: "REMOVE_IMAGE", index });
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
                  navigation.replace("Map", {
                    focusId: createdSpotId,
                    latitude: createdLatitude,
                    longitude: createdLongitude,
                    type: "SPOT",
                    filter: "SPOT",
                  });
                },
              } as const,
            ]
          : []),
        {
          text: "바로 보기",
          onPress: () => {
            dispatch({ type: "RESET" });
            navigation.replace("PostDetail", { postId: createdSpotId });
          },
        },
        {
          text: "닫기",
          onPress: () => {
            dispatch({ type: "RESET" });
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "등록 실패",
        error?.response?.data?.message ?? error?.message ?? "스팟 등록에 실패했어요."
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>사진 업로드</Text>
        <Text style={styles.helperText}>최대 5장까지 선택할 수 있어요.</Text>
        <Pressable style={styles.secondaryButton} onPress={handlePickImages}>
          <Text style={styles.secondaryButtonText}>사진 선택하기</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleTakeImages}>
          <Text style={styles.secondaryButtonText}>지금 촬영하기</Text>
        </Pressable>

        {spot.images.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageRow}
          >
            {spot.images.map((image, index) => (
              <View key={`${image.uri}-${index}`} style={styles.imageCard}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <Pressable style={styles.imageRemoveButton} onPress={() => handleRemoveImage(index)}>
                  <Text style={styles.imageRemoveButtonText}>×</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>위치</Text>
        <TextInput
          value={spot.name || ""}
          onChangeText={(value) => dispatch({ type: "SET_LOCATION_TEXT", value })}
          placeholder="장소명을 입력해주세요."
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
        {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Pressable style={styles.secondaryButton} onPress={handleUseCurrentLocation}>
          <Text style={styles.secondaryButtonText}>현재 위치로 채우기</Text>
        </Pressable>

        {spot.latitude !== 0 && spot.longitude !== 0 ? (
          <Text style={styles.coordinateText}>
            좌표: {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내용</Text>
        <TextInput
          value={spot.description ?? ""}
          onChangeText={(value) => {
            dispatch({ type: "SET_FIELD", field: "description", value });
            if (errors.description && value.trim()) {
              setErrors((prev) => ({ ...prev, description: undefined }));
            }
          }}
          placeholder="메시지를 입력해 주세요."
          placeholderTextColor={colors.gray[400]}
          multiline
          textAlignVertical="top"
          maxLength={200}
          style={styles.textarea}
        />
        {!!errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>테마</Text>
        <View style={styles.themeGrid}>
          {THEME_OPTIONS.map((item) => {
            const active = spot.themeId === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.themeChip, active && styles.themeChipActive]}
                onPress={() => dispatch({ type: "SET_FIELD", field: "themeId", value: item.id })}
              >
                <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>해시태그</Text>
        <View style={styles.tagInputRow}>
          <TextInput
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="해시태그 입력"
            placeholderTextColor={colors.gray[400]}
            style={styles.tagInput}
            onSubmitEditing={handleAddTag}
          />
          <Pressable style={styles.tagAddButton} onPress={handleAddTag}>
            <Text style={styles.tagAddButtonText}>추가</Text>
          </Pressable>
        </View>

        <View style={styles.tagList}>
          {tags.map((tag, index) => (
            <Pressable key={`${tag}-${index}`} style={styles.tagChip} onPress={() => handleRemoveTag(index)}>
              <Text style={styles.tagChipText}>#{tag}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.primaryButton, createSpot.isPending && styles.primaryButtonDisabled]}
        onPress={handleSubmit}
        disabled={createSpot.isPending}
      >
        {createSpot.isPending ? (
          <ActivityIndicator color={colors.base[0]} />
        ) : (
          <Text style={styles.primaryButtonText}>등록하기</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[50],
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 20,
    paddingBottom: 36,
  },
  section: {
    marginBottom: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
  },
  imageRow: {
    gap: 10,
    marginTop: 12,
  },
  imageCard: {
    position: "relative",
  },
  imagePreview: {
    width: 112,
    height: 112,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  imageRemoveButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,31,31,0.65)",
  },
  imageRemoveButtonText: {
    color: colors.base[0],
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "700",
  },
  sectionTitle: {
    ...typography.head4,
    color: colors.gray[800],
    marginBottom: 10,
  },
  helperText: {
    ...typography.caption2,
    color: colors.gray[500],
  },
  input: {
    ...commonStyles.input,
  },
  textarea: {
    minHeight: 136,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
    ...typography.body2,
    color: colors.gray[800],
  },
  errorText: {
    ...typography.caption2,
    color: colors.error[100],
    marginTop: 6,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
  coordinateText: {
    ...typography.caption2,
    color: colors.gray[500],
    marginTop: 10,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  themeChip: {
    width: "30.8%",
    minHeight: 68,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  themeChipActive: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  themeChipText: {
    ...typography.body3,
    color: colors.gray[500],
    textAlign: "center",
  },
  themeChipTextActive: {
    color: colors.primary[400],
  },
  tagInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  tagInput: {
    ...commonStyles.input,
    flex: 1,
  },
  tagAddButton: {
    minWidth: 72,
    minHeight: layout.buttonHeight,
    paddingHorizontal: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  tagAddButtonText: {
    ...typography.body3,
    color: colors.gray[500],
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[50],
  },
  tagChipText: {
    ...typography.caption1,
    color: colors.primary[500],
  },
  primaryButton: {
    ...commonStyles.primaryButton,
  },
  primaryButtonDisabled: {
    ...commonStyles.primaryButtonDisabled,
  },
  primaryButtonText: {
    ...commonStyles.primaryButtonText,
  },
});

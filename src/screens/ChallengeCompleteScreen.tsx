import { useState } from "react";
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
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useCompleteChallenge } from "src/features/challenges/useChallengeMutations";

type Props = NativeStackScreenProps<RootStackParamList, "ChallengeComplete">;

export default function ChallengeCompleteScreen({ navigation, route }: Props) {
  const { challenge } = route.params;
  const completeChallenge = useCompleteChallenge();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "인증 사진을 선택하려면 사진 보관함 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      setSelectedPhoto(asset.uri);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      setSelectedPhoto(asset.uri);
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
        proofUrl: selectedPhoto,
        dateText: new Date().toISOString(),
      });

      Alert.alert("인증 완료", "챌린지가 완료되었어요.", [
        {
          text: "확인",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "Challenge",
                  params: {
                    initialTab: "done",
                    highlightId: challenge.id,
                  },
                },
              ],
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "완료 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imageBox}>
        {challenge.imageUrl ? (
          <Image source={{ uri: challenge.imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Challenge</Text>
        )}
      </View>

      <Text style={styles.badge}>진행중</Text>
      <Text style={styles.title}>{challenge.title}</Text>
      {challenge.dateText ? <Text style={styles.date}>{challenge.dateText}</Text> : null}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>인증 사진</Text>
        <Text style={styles.infoText}>
          챌린지를 완료했다는 걸 보여줄 사진을 업로드해주세요.
        </Text>

        <Pressable style={styles.secondaryButton} onPress={handlePickPhoto}>
          <Text style={styles.secondaryButtonText}>사진 선택하기</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleTakePhoto}>
          <Text style={styles.secondaryButtonText}>지금 촬영하기</Text>
        </Pressable>

        {selectedPhoto ? (
          <Image source={{ uri: selectedPhoto }} style={styles.proofImage} />
        ) : (
          <View style={styles.proofPlaceholder}>
            <Text style={styles.proofPlaceholderText}>선택한 사진이 여기에 보여요.</Text>
          </View>
        )}
      </View>

      <Pressable
        style={[styles.primaryButton, (submitting || completeChallenge.isPending) && styles.disabledButton]}
        disabled={submitting || completeChallenge.isPending}
        onPress={handleComplete}
      >
        {(submitting || completeChallenge.isPending) ? <ActivityIndicator color="#fff" /> : null}
        <Text style={styles.primaryButtonText}>
          {(submitting || completeChallenge.isPending) ? "완료 처리 중..." : "챌린지 완료하기"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1.25,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#fff4ec",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ff8b4c",
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#fff4ec",
    color: "#ff8b4c",
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "900",
    color: "#191919",
  },
  date: {
    marginTop: 8,
    fontSize: 14,
    color: "#777",
  },
  infoBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f8f8f8",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#222",
  },
  infoText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#666",
  },
  secondaryButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4ec",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8b532f",
  },
  proofImage: {
    width: "100%",
    aspectRatio: 1.1,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  proofPlaceholder: {
    width: "100%",
    aspectRatio: 1.1,
    marginTop: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#efefef",
  },
  proofPlaceholderText: {
    fontSize: 13,
    color: "#777",
  },
  primaryButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 15,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});

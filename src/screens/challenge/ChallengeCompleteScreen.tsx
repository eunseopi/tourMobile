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
import type { RootStackParamList } from "src/app/navigation/types";
import { useCompleteChallenge } from "src/features/challenges/useChallengeMutations";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";

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
        {(submitting || completeChallenge.isPending) ? <ActivityIndicator color={colors.base[0]} /> : null}
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
    backgroundColor: colors.bg[50],
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 335 / 180,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderText: {
    ...typography.body1,
    color: colors.primary[400],
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.primary[400],
    ...typography.body1,
    color: colors.base[0],
  },
  title: {
    ...typography.head2,
    color: colors.gray[800],
    marginTop: 10,
  },
  date: {
    ...typography.body4,
    color: colors.gray[500],
    marginTop: 8,
  },
  infoBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
  },
  infoTitle: {
    ...typography.head4,
    color: colors.gray[800],
  },
  infoText: {
    ...typography.body4,
    color: colors.gray[600],
    marginTop: 8,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    marginTop: 16,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
  proofImage: {
    width: "100%",
    aspectRatio: 1.1,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  proofPlaceholder: {
    width: "100%",
    aspectRatio: 1.1,
    marginTop: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[200],
  },
  proofPlaceholderText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  primaryButton: {
    ...commonStyles.primaryButton,
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
  },
  disabledButton: {
    ...commonStyles.primaryButtonDisabled,
  },
  primaryButtonText: {
    ...commonStyles.primaryButtonText,
  },
});

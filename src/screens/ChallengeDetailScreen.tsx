import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { useStartChallenge } from "src/features/challenges/useChallengeMutations";

type Props = NativeStackScreenProps<RootStackParamList, "ChallengeDetail">;

export default function ChallengeDetailScreen({ navigation, route }: Props) {
  const { challenge } = route.params;
  const [locating, setLocating] = useState(false);
  const startChallenge = useStartChallenge();
  const busy = locating || startChallenge.isPending;

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
      navigation.navigate("Challenge");
    } catch (error: any) {
      Alert.alert(
        "시작 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
      );
    } finally {
      setLocating(false);
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

      <Text style={styles.badge}>{challenge.categoryLabel}</Text>
      <Text style={styles.title}>{challenge.title}</Text>
      {challenge.dateText ? <Text style={styles.date}>{challenge.dateText}</Text> : null}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>챌린지 위치</Text>
        <Text style={styles.infoText}>
          지도 연동 전까지는 현재 위치 권한을 확인한 뒤 서버에 시작 요청을 보냅니다.
        </Text>
      </View>

      <Pressable
        style={[styles.primaryButton, busy && styles.disabledButton]}
        disabled={busy}
        onPress={handleStart}
      >
        {busy ? <ActivityIndicator color="#fff" /> : null}
        <Text style={styles.primaryButtonText}>
          {busy ? "시작 중..." : "시작하기"}
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

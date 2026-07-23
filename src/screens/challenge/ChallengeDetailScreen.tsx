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
import type { RootStackParamList } from "src/app/navigation/types";
import { useStartChallenge } from "src/features/challenges/useChallengeMutations";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";

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
        {busy ? <ActivityIndicator color={colors.base[0]} /> : null}
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

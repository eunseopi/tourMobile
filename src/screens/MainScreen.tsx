import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

export default function MainScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>제주데이</Text>
      <Text style={styles.description}>
        React Native 포팅을 화면 단위로 진행 중입니다.
      </Text>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Shop")}>
        <Text style={styles.primaryButtonText}>상점 화면 보기</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("MyPage")}>
        <Text style={styles.secondaryButtonText}>마이페이지 보기</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Community")}>
        <Text style={styles.secondaryButtonText}>커뮤니티 보기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#191919",
  },
  description: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  primaryButton: {
    marginTop: 28,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
  },
});

import { useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useConvertSteps } from "src/features/product/useConvertSteps";

type Props = NativeStackScreenProps<RootStackParamList, "PointConvert">;

export default function PointConvertScreen({ navigation }: Props) {
  const { data: me, refetch } = useSessionMe();
  const convertSteps = useConvertSteps();
  const [value, setValue] = useState("");

  const validation = useMemo(() => {
    if (!value) return { ok: false, message: "한 번에 최대 100개까지 교환할 수 있어요." };
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      return { ok: false, message: "1~100 사이의 정수를 입력해주세요." };
    }
    return { ok: true, message: "전환 가능한 값이에요." };
  }, [value]);

  const handleConvert = async () => {
    if (!validation.ok) return;

    try {
      const result = await convertSteps.mutateAsync(Number(value));
      await refetch();
      Alert.alert(
        "전환 완료",
        `${result.convertedPoints}포인트가 한라봉으로 전환됐어요.`,
        [{ text: "확인", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert(
        "전환 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>포인트 전환</Text>
      <Text style={styles.description}>걸음수 포인트를 한라봉으로 바꿔 상품 구매에 사용할 수 있어요.</Text>

      <View style={styles.balanceRow}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>누적 걸음수</Text>
          <Text style={styles.balanceValue}>{(me?.totalSteps ?? 0).toLocaleString()}</Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>보유 한라봉</Text>
          <Text style={styles.balanceValue}>{me?.hallabong ?? 0}</Text>
        </View>
      </View>

      <View style={styles.convertBox}>
        <View style={styles.convertItem}>
          <Text style={styles.convertCaption}>걸음수</Text>
          <Text style={styles.convertValue}>10</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.convertItem}>
          <Text style={styles.convertCaption}>한라봉</Text>
          <Text style={styles.convertValue}>1</Text>
        </View>
      </View>

      <Text style={styles.label}>전환할 포인트</Text>
      <TextInput
        value={value}
        onChangeText={(next) => setValue(next.replace(/\D/g, ""))}
        placeholder="1~100 입력"
        placeholderTextColor="#aaa"
        keyboardType="number-pad"
        style={styles.input}
      />
      <Text style={[styles.helperText, validation.ok && styles.helperTextPositive]}>
        {validation.message}
      </Text>

      <Pressable
        style={[styles.primaryButton, (!validation.ok || convertSteps.isPending) && styles.primaryButtonDisabled]}
        disabled={!validation.ok || convertSteps.isPending}
        onPress={handleConvert}
      >
        {convertSteps.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>포인트 전환하기</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 36 },
  title: { fontSize: 26, fontWeight: "900", color: "#191919" },
  description: { marginTop: 8, fontSize: 14, lineHeight: 21, color: "#666" },
  balanceRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  balanceCard: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: "#f8f8f8" },
  balanceLabel: { fontSize: 13, color: "#777" },
  balanceValue: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#ff8b4c" },
  convertBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff4ec",
  },
  convertItem: { flex: 1, alignItems: "center" },
  convertCaption: { fontSize: 13, color: "#855234" },
  convertValue: { marginTop: 6, fontSize: 22, fontWeight: "900", color: "#ff8b4c" },
  arrow: { fontSize: 24, fontWeight: "900", color: "#b6612c" },
  label: { marginTop: 22, fontSize: 14, fontWeight: "800", color: "#333" },
  input: {
    minHeight: 52,
    marginTop: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    backgroundColor: "#fffdfc",
    fontSize: 15,
    color: "#222",
  },
  helperText: { marginTop: 8, fontSize: 13, color: "#d14b4b" },
  helperTextPositive: { color: "#338a57" },
  primaryButton: {
    marginTop: 24,
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { fontSize: 15, fontWeight: "800", color: "#fff" },
});

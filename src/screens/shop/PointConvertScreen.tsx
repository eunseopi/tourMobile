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
import type { RootStackParamList } from "src/app/navigation/types";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useConvertSteps } from "src/features/product/useConvertSteps";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";

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
        [
          {
            text: "확인",
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
                return;
              }
              navigation.navigate("Shop");
            },
          },
        ]
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
        placeholderTextColor={colors.gray[400]}
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
          <ActivityIndicator color={colors.base[0]} />
        ) : (
          <Text style={styles.primaryButtonText}>포인트 전환하기</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg[0] },
  content: { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 44 },
  title: { ...typography.head4, color: colors.gray[800], textAlign: "center", paddingVertical: 13 },
  description: { ...typography.body4, color: colors.gray[600], textAlign: "center", marginTop: 8 },
  balanceRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  balanceCard: { flex: 1, padding: 10, borderRadius: 100, borderWidth: 1, borderColor: colors.primary[100], backgroundColor: colors.primary[50] },
  balanceLabel: { ...typography.caption1, color: colors.gray[600], textAlign: "center" },
  balanceValue: { ...typography.body1, color: colors.primary[400], textAlign: "center", marginTop: 4 },
  convertBox: {
    marginTop: 13,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 75,
    backgroundColor: colors.gray[100],
  },
  convertItem: { flex: 1, maxWidth: 100, alignItems: "center", gap: 4 },
  convertCaption: { ...typography.head4, fontWeight: "600", color: colors.gray[700] },
  convertValue: { ...typography.body1, color: colors.gray[500] },
  arrow: { position: "absolute", fontSize: 24, fontWeight: "700", color: colors.gray[400] },
  label: { ...typography.body3, color: colors.gray[700], marginTop: 20, marginBottom: 8 },
  input: { ...commonStyles.input },
  helperText: { ...typography.caption2, color: colors.error[100], marginTop: 8 },
  helperTextPositive: { color: colors.primary[400] },
  primaryButton: { ...commonStyles.primaryButton, marginTop: 24 },
  primaryButtonDisabled: { ...commonStyles.primaryButtonDisabled },
  primaryButtonText: { ...commonStyles.primaryButtonText },
});

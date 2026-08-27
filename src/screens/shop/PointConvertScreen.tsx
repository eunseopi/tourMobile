import { useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useConvertSteps } from "src/features/product/useConvertSteps";
import { useExchangeStatus } from "src/features/product/useExchangeStatus";
import { usePedometerSteps } from "src/features/steps/usePedometerSteps";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";
import Steps from "src/assets/Steps.svg";
import Hanlabong from "src/assets/hanlabong.svg";
import Arrow from "src/assets/Arrow.svg";
import Clear from "src/assets/Clear.svg";

type Props = NativeStackScreenProps<RootStackParamList, "PointConvert">;

export default function PointConvertScreen(_props: Props) {
  const { data: me, refetch } = useSessionMe();
  const exchangeStatus = useExchangeStatus();
  const convertSteps = useConvertSteps();
  const todaySteps = usePedometerSteps();
  const [value, setValue] = useState("");

  const maxSingleExchange = exchangeStatus.data?.maxSingleExchange ?? 100;
  const remainingPoints = exchangeStatus.data?.remainingPoints ?? maxSingleExchange;
  const remainingExchangeCount = exchangeStatus.data?.remainingExchangeCount ?? null;
  const maxDailyExchanges = exchangeStatus.data?.maxDailyExchanges ?? 20;
  const maxApplicable = Math.min(maxSingleExchange, remainingPoints);

  const validation = useMemo(() => {
    if (remainingExchangeCount === 0) {
      return { ok: false, message: `오늘 교환 횟수를 모두 사용했어요. (최대 ${maxDailyExchanges}회)` };
    }
    if (!value) return { ok: false, message: `한 번에 최대 ${maxSingleExchange}개까지 교환할 수 있어요.` };
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > maxApplicable) {
      return { ok: false, message: `1~${maxApplicable} 사이의 정수를 입력해주세요.` };
    }
    return { ok: true, message: "전환 가능한 값이에요." };
  }, [value, maxApplicable, maxSingleExchange, remainingExchangeCount, maxDailyExchanges]);

  const handleMax = () => {
    if (maxApplicable <= 0) return;
    setValue(String(maxApplicable));
  };

  const handleConvert = async () => {
    if (!validation.ok) return;

    const parsed = Number(value);
    const freshStatus = await exchangeStatus.refetch();
    const freshRemainingPoints = freshStatus.data?.remainingPoints ?? remainingPoints;
    const freshMaxApplicable = Math.min(maxSingleExchange, freshRemainingPoints);
    if (parsed > freshMaxApplicable) {
      Alert.alert("포인트가 부족해요", `지금 전환 가능한 포인트는 ${freshMaxApplicable}개예요.`);
      return;
    }

    try {
      const result = await convertSteps.mutateAsync(parsed);
      await refetch();
      setValue("");
      Alert.alert(
        "전환 완료",
        `${result.convertedPoints}포인트가 한라봉으로 전환됐어요. (오늘 ${result.todayExchangeCount}/${maxDailyExchanges}회)`
      );
    } catch (error: any) {
      const errorCode = error?.response?.data?.errorCode;
      const message = error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요.";

      if (errorCode === "INSUFFICIENT_STEPS") {
        await exchangeStatus.refetch();
        Alert.alert("포인트가 부족해요", message);
        return;
      }
      Alert.alert("전환 실패", message);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="포인트 전환" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>걸음수 포인트를 한라봉으로 바꿔 상품 구매에 사용할 수 있어요.</Text>

      <View style={styles.balanceRow}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>오늘 걸음수</Text>
          <Text style={styles.balanceValue}>{todaySteps.toLocaleString()}</Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>보유 한라봉</Text>
          <Text style={styles.balanceValue}>{me?.hallabong ?? 0}</Text>
        </View>
      </View>

      <View style={styles.convertBox}>
        <View style={styles.convertItem}>
          <Steps width={27} height={26} />
          <Text style={styles.convertCaption}>걸음수</Text>
          <Text style={styles.convertValue}>10</Text>
        </View>
        <View style={styles.arrowBox}>
          <Arrow width={31} height={12} />
        </View>
        <View style={styles.convertItem}>
          <Hanlabong width={26} height={26} />
          <Text style={styles.convertCaption}>한라봉</Text>
          <Text style={styles.convertValue}>1</Text>
        </View>
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.label}>전환할 포인트</Text>
        {remainingExchangeCount !== null ? (
          <Text style={styles.exchangeCountText}>
            오늘 {remainingExchangeCount}/{maxDailyExchanges}회 남음
          </Text>
        ) : null}
      </View>
      <View style={styles.inputBox}>
        <TextInput
          value={value}
          onChangeText={(next) => setValue(next.replace(/\D/g, ""))}
          placeholder={`1~${maxApplicable} 입력`}
          placeholderTextColor={colors.gray[400]}
          keyboardType="number-pad"
          style={[
            styles.input,
            styles.inputWithMaxButton,
            value.length > 0 && !validation.ok && styles.inputNegative,
          ]}
        />
        <View style={styles.inputActions}>
          {value.length > 0 ? (
            <Pressable style={styles.clearButton} onPress={() => setValue("")} hitSlop={8}>
              <Clear width={20} height={20} />
            </Pressable>
          ) : null}
          <Pressable
            style={styles.maxButton}
            onPress={handleMax}
            disabled={maxApplicable <= 0}
            hitSlop={8}
          >
            <Text style={styles.maxButtonText}>최대</Text>
          </Pressable>
        </View>
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg[0] },
  container: { flex: 1, backgroundColor: colors.bg[0] },
  content: { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 44 },
  description: { ...typography.body4, color: colors.gray[600], textAlign: "center", marginTop: 20 },
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
    position: "relative",
  },
  convertItem: { flex: 1, maxWidth: 100, alignItems: "center", gap: 4 },
  convertCaption: { ...typography.head4, fontWeight: "600", color: colors.gray[700] },
  convertValue: { ...typography.body1, color: colors.gray[600] },
  arrowBox: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -15.5 }, { translateY: -6 }],
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 8,
  },
  label: { ...typography.body3, color: colors.gray[700] },
  exchangeCountText: { ...typography.caption1, color: colors.gray[600] },
  inputBox: { justifyContent: "center" },
  input: { ...commonStyles.input },
  inputWithMaxButton: { paddingRight: 96 },
  inputNegative: { borderColor: colors.error[100] },
  inputActions: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  maxButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
  },
  maxButtonText: {
    ...typography.caption1,
    fontWeight: "700",
    color: colors.primary[400],
  },
  helperText: { ...typography.caption2, color: colors.error[100], marginTop: 8 },
  helperTextPositive: { color: colors.primary[400] },
  primaryButton: { ...commonStyles.primaryButton, marginTop: 24 },
  primaryButtonDisabled: { ...commonStyles.primaryButtonDisabled },
  primaryButtonText: { ...commonStyles.primaryButtonText },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Props = {
  permissionGranted: boolean;
  expoPushToken: string | null;
  lastNotificationTitle?: string | null;
  isRegisteringToken: boolean;
  onPressReconnect: () => void;
};

export function PushStatusCard({
  permissionGranted,
  expoPushToken,
  lastNotificationTitle,
  isRegisteringToken,
  onPressReconnect,
}: Props) {
  return (
    <View style={styles.pushStatusBox}>
      <Text style={styles.pushStatusTitle}>기기 알림 연결</Text>
      <Text style={styles.pushStatusDescription}>
        {permissionGranted
          ? expoPushToken
            ? "이 기기에서 푸시를 받을 준비가 됐어요."
            : "권한은 있지만 아직 기기 토큰을 다시 확인하는 중이에요."
          : "아직 이 기기에서 알림 권한이 허용되지 않았어요."}
      </Text>
      {lastNotificationTitle ? (
        <Text style={styles.pushStatusMeta}>최근 수신: {lastNotificationTitle}</Text>
      ) : null}
      <Pressable style={styles.tokenButton} onPress={onPressReconnect} disabled={isRegisteringToken}>
        <Text style={styles.tokenButtonText}>
          {isRegisteringToken ? "확인 중..." : "다시 연결"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pushStatusBox: { padding: 16, borderRadius: 12, backgroundColor: colors.bg[0] },
  pushStatusTitle: { ...typography.body3, color: colors.gray[700] },
  pushStatusDescription: { ...typography.caption2, color: colors.gray[600], marginTop: 6 },
  pushStatusMeta: { ...typography.caption2, color: colors.primary[400], marginTop: 6 },
  tokenButton: { alignSelf: "flex-start", minHeight: 40, marginTop: 12, paddingHorizontal: 14, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary[100] },
  tokenButtonText: { ...typography.body3, color: colors.primary[500] },
});

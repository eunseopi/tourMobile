import { useMemo } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useNotification } from "src/features/my-page/useNotification";
import { registerForPushNotificationsAsync } from "src/features/notifications/usePushNotifications";
import { useDeviceNotificationStore } from "src/stores/deviceNotificationStore";

const gradeNameOf = (code?: string) => {
  switch (code) {
    case "BALBADAK":
      return "발바닥";
    default:
      return "발바닥";
  }
};

type Props = NativeStackScreenProps<RootStackParamList, "MyPage">;

export default function MyPageScreen({ navigation }: Props) {
  const { data: me, isLoading, isError, refetch } = useSessionMe();
  const { notiEnabled, toggleNoti } = useNotification();
  const expoPushToken = useDeviceNotificationStore((state) => state.expoPushToken);
  const permissionGranted = useDeviceNotificationStore((state) => state.permissionGranted);
  const isRegisteringToken = useDeviceNotificationStore((state) => state.isRegistering);
  const lastNotificationTitle = useDeviceNotificationStore(
    (state) => state.lastNotificationTitle
  );

  const gradeName = useMemo(() => gradeNameOf(me?.moodGrade), [me?.moodGrade]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>내 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !me) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>내 정보를 불러오지 못했어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          <Text style={styles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatarBox}>
          {me.profile ? (
            <Image source={{ uri: me.profile }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarInitial}>
              {(me.nickname || me.name || "제").slice(0, 1)}
            </Text>
          )}
        </View>

        <View style={styles.profileText}>
          <Text style={styles.nickname}>{me.nickname || me.name || "게스트"}</Text>
          <Text style={styles.grade}>{gradeName}</Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>보유 한라봉</Text>
          <Text style={styles.statValue}>{me.hallabong ?? 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>총 걸음수</Text>
          <Text style={styles.statValue}>{(me.totalSteps ?? 0).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>알림 받기</Text>
            <Text style={styles.settingDescription}>이벤트와 챌린지 소식을 받아요.</Text>
          </View>
          <Switch
            value={notiEnabled}
            onValueChange={toggleNoti}
            trackColor={{ false: "#dedede", true: "#ffc09a" }}
            thumbColor={notiEnabled ? "#ff8b4c" : "#f5f5f5"}
          />
        </View>

        <View style={styles.pushStatusBox}>
          <View style={styles.pushStatusTextBox}>
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
          </View>
          <Pressable
            style={styles.tokenButton}
            onPress={() => void registerForPushNotificationsAsync({ requestPermission: true })}
            disabled={isRegisteringToken}
          >
            <Text style={styles.tokenButtonText}>
              {isRegisteringToken ? "확인 중..." : "다시 연결"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <MenuItem label="내 쿠폰" onPress={() => navigation.navigate("MyCoupons")} />
        <MenuItem label="포인트 전환" onPress={() => navigation.navigate("PointConvert")} />
        <MenuItem label="프로필 수정" onPress={() => navigation.navigate("ProfileEdit")} />
        <MenuItem label="관심 테마 수정" onPress={() => navigation.navigate("ThemeEdit")} />
        <MenuItem label="비밀번호 재설정" onPress={() => navigation.navigate("PasswordReset")} />
      </View>
    </ScrollView>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#fff4ec",
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#ffccaa",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
  },
  profileText: {
    flex: 1,
    marginLeft: 14,
  },
  nickname: {
    fontSize: 22,
    fontWeight: "900",
    color: "#202020",
  },
  grade: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "700",
    color: "#9a5b35",
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f8f8f8",
  },
  statLabel: {
    fontSize: 13,
    color: "#777",
  },
  statValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "900",
    color: "#ff8b4c",
  },
  section: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fafafa",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e6e6e6",
  },
  settingRow: {
    minHeight: 72,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
  },
  settingDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
  },
  pushStatusBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pushStatusTextBox: {
    flex: 1,
  },
  pushStatusTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#222",
  },
  pushStatusDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#666",
  },
  pushStatusMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "#9a5b35",
  },
  tokenButton: {
    minWidth: 88,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4ec",
  },
  tokenButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8b532f",
  },
  menuItem: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e8e8e8",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  chevron: {
    fontSize: 26,
    color: "#aaa",
  },
  primaryButton: {
    marginTop: 16,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
  errorText: {
    color: "#d33",
  },
});

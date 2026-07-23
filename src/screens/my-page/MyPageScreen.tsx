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
import type { RootStackParamList } from "src/app/navigation/types";
import { commonStyles } from "src/design/commonStyles";
import { colors, shadow, typography } from "src/design/theme";
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
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>내 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !me) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>내 정보를 불러오지 못했어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileWrapper}>
        <Pressable style={styles.profileBox} onPress={() => navigation.navigate("ProfileEdit")}>
          <View style={styles.profileImageWrapper}>
            {me.profile ? (
              <Image source={{ uri: me.profile }} style={styles.profileImage} />
            ) : (
              <Text style={styles.avatarInitial}>
                {(me.nickname || me.name || "제").slice(0, 1)}
              </Text>
            )}
          </View>

          <View style={styles.nicknameWrapper}>
            <View style={styles.nicknameBox}>
              <Text style={styles.nickname} numberOfLines={1}>{me.nickname || me.name || "게스트"}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
            <Text style={styles.level}>LV. {gradeName}</Text>
          </View>
        </Pressable>

        <View style={styles.hallabongWrapper}>
          <View style={styles.goToStoreBox}>
            <View style={styles.hallabongIcon}>
              <Text style={styles.hallabongIconText}>●</Text>
            </View>
            <Pressable style={styles.goToStore} onPress={() => navigation.navigate("Shop")}>
              <View style={styles.storeTextBox}>
                <Text style={styles.storeTitle}>상점</Text>
                <Text style={styles.storeDesc}>한라봉으로 다양한 상품을 구매해요!</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
          <Pressable style={styles.giftButton} onPress={() => navigation.navigate("MyCoupons")}>
            <Text style={styles.giftButtonText}>내 상품권 확인하기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.menuArea}>
        <View style={styles.menuWrapper}>
          <MenuItem icon="◎" label="커뮤니티 보러가기" onPress={() => navigation.navigate("Community")} />
          <MenuItem icon="◇" label="챌린지 보러가기" onPress={() => navigation.navigate("Challenge")} />
          <View style={styles.menuRow}>
            <View style={styles.menuBox}>
              <Text style={styles.menuIcon}>◉</Text>
              <Text style={styles.menuText}>알림설정</Text>
            </View>
            <Switch
              value={notiEnabled}
              onValueChange={toggleNoti}
              trackColor={{ false: colors.gray[400], true: colors.primary[400] }}
              thumbColor={colors.base[0]}
              ios_backgroundColor={colors.gray[400]}
            />
          </View>
          <MenuItem icon="⚙" label="프로필 수정" onPress={() => navigation.navigate("ProfileEdit")} />
          <MenuItem icon="⚙" label="테마 수정" onPress={() => navigation.navigate("ThemeEdit")} />
          <MenuItem icon="⚙" label="비밀번호 수정" onPress={() => navigation.navigate("PasswordReset")} />
        </View>

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
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuBox}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuText}>{label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  content: {
    paddingBottom: 90,
  },
  profileWrapper: {
    backgroundColor: colors.bg[0],
    padding: 20,
    gap: 20,
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitial: {
    ...typography.head1,
    color: colors.gray[500],
  },
  nicknameWrapper: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 18,
  },
  nicknameBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  nickname: {
    width: 140,
    ...typography.head3,
    color: colors.gray[800],
  },
  level: {
    ...typography.body4,
    color: colors.gray[600],
  },
  hallabongWrapper: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  goToStoreBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  hallabongIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[100],
  },
  hallabongIconText: {
    color: colors.primary[400],
    fontSize: 20,
  },
  goToStore: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  storeTextBox: {
    flex: 1,
  },
  storeTitle: {
    ...typography.head4,
    color: colors.gray[700],
    fontWeight: "600",
    marginBottom: 4,
  },
  storeDesc: {
    ...typography.body4,
    color: colors.gray[600],
  },
  giftButton: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.primary[100],
    alignItems: "center",
  },
  giftButtonText: {
    ...typography.body3,
    color: colors.primary[500],
  },
  menuArea: {
    flex: 1,
    padding: 20,
    paddingBottom: 90,
    backgroundColor: colors.bg[50],
  },
  menuWrapper: {
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 12,
    overflow: "hidden",
    ...shadow.card,
  },
  menuRow: {
    minHeight: 66,
    paddingVertical: 20.5,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  menuBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuIcon: {
    width: 26,
    textAlign: "center",
    fontSize: 20,
    color: colors.gray[500],
  },
  menuText: {
    ...typography.body1,
    color: colors.gray[700],
  },
  chevron: {
    fontSize: 26,
    lineHeight: 26,
    color: colors.gray[400],
  },
  pushStatusBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
  },
  pushStatusTitle: {
    ...typography.body3,
    color: colors.gray[700],
  },
  pushStatusDescription: {
    ...typography.caption2,
    color: colors.gray[600],
    marginTop: 6,
  },
  pushStatusMeta: {
    ...typography.caption2,
    color: colors.primary[400],
    marginTop: 6,
  },
  tokenButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[100],
  },
  tokenButtonText: {
    ...typography.body3,
    color: colors.primary[500],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[0],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});

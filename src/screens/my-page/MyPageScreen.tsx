import { useMemo } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";
import { useNotification } from "src/features/my-page/useNotification";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { registerForPushNotificationsAsync } from "src/features/notifications/usePushNotifications";
import { useDeviceNotificationStore } from "src/stores/deviceNotificationStore";
import { MyPageMenuList } from "./components/MyPageMenuList";
import { MyProfileSummary } from "./components/MyProfileSummary";
import { PushStatusCard } from "./components/PushStatusCard";

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
  const lastNotificationTitle = useDeviceNotificationStore((state) => state.lastNotificationTitle);

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
      <MyProfileSummary
        profile={me.profile}
        nickname={me.nickname}
        name={me.name}
        level={gradeName}
        onPressProfile={() => navigation.navigate("ProfileEdit")}
        onPressShop={() => navigation.navigate("Shop")}
        onPressCoupons={() => navigation.navigate("MyCoupons")}
      />

      <View style={styles.menuArea}>
        <MyPageMenuList
          notiEnabled={notiEnabled}
          onToggleNoti={toggleNoti}
          onPressCommunity={() => navigation.navigate("Community")}
          onPressChallenge={() => navigation.navigate("Challenge")}
          onPressProfile={() => navigation.navigate("ProfileEdit")}
          onPressTheme={() => navigation.navigate("ThemeEdit")}
          onPressPassword={() => navigation.navigate("PasswordReset")}
        />

        <PushStatusCard
          permissionGranted={permissionGranted}
          expoPushToken={expoPushToken}
          lastNotificationTitle={lastNotificationTitle}
          isRegisteringToken={isRegisteringToken}
          onPressReconnect={() => void registerForPushNotificationsAsync({ requestPermission: true })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg[0] },
  content: { paddingBottom: 90 },
  menuArea: { flex: 1, padding: 20, paddingBottom: 90, backgroundColor: colors.bg[50] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24, backgroundColor: colors.bg[0] },
  mutedText: { ...typography.body4, color: colors.gray[500] },
  errorText: { ...typography.body3, color: colors.error[100] },
});

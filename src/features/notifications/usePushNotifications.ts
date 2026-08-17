import { useEffect } from "react";
import { Platform } from "react-native";
import type {
  Messaging,
  RemoteMessage,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { queryClient } from "src/app/queryClient";
import { navigationRef } from "src/app/navigation/navigationRef";
import { useDeviceNotificationStore } from "src/stores/deviceNotificationStore";
import { isExpoGo } from "src/utils/lib/isExpoGo";
import { QK } from "src/utils/lib/queryKeys";
import { resolveNotificationTarget } from "src/features/notifications/resolveNotificationTarget";

// 백엔드가 Firebase Admin SDK로 FCM에 직접 발송하므로, 프론트도 Expo 푸시 토큰이 아니라
// react-native-firebase의 실제 FCM 등록 토큰을 발급받아 서버에 보낸다.
// Expo Go에는 커스텀 네이티브 모듈(react-native-firebase)이 없으므로,
// Expo Go에서 실행 중일 땐 @react-native-firebase/messaging을 아예 import/호출하지 않는다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let messagingInstance: Messaging | null = null;

function getMessagingInstanceLazy() {
  if (isExpoGo) return null;
  if (!messagingInstance) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const messagingModule = require("@react-native-firebase/messaging");
    messagingInstance = messagingModule.getMessaging();
  }
  return messagingInstance;
}

type RegisterOptions = {
  requestPermission?: boolean;
};

export async function registerForPushNotificationsAsync(
  options: RegisterOptions = {}
) {
  const { requestPermission: shouldRequestPermission = false } = options;
  const store = useDeviceNotificationStore.getState();

  if (isExpoGo) {
    // Expo Go에서는 FCM 토큰을 받을 수 없다 — 개발 빌드/EAS 빌드에서만 동작한다.
    return null;
  }

  try {
    store.setRegistering(true);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const messagingModule = require("@react-native-firebase/messaging");
    const instance = getMessagingInstanceLazy();
    if (!instance) return null;

    const currentStatus = await messagingModule.hasPermission(instance);
    let granted =
      currentStatus === messagingModule.AuthorizationStatus.AUTHORIZED ||
      currentStatus === messagingModule.AuthorizationStatus.PROVISIONAL;

    if (!granted && shouldRequestPermission) {
      const requestedStatus = await messagingModule.requestPermission(instance);
      granted =
        requestedStatus === messagingModule.AuthorizationStatus.AUTHORIZED ||
        requestedStatus === messagingModule.AuthorizationStatus.PROVISIONAL;
    }

    if (!granted) {
      store.setRegistrationState({ fcmToken: null, permissionGranted: false });
      return null;
    }

    const fcmToken = await messagingModule.getToken(instance);

    store.setRegistrationState({ fcmToken, permissionGranted: true });
    return fcmToken;
  } catch {
    store.setRegistrationState({ fcmToken: null, permissionGranted: false });
    return null;
  } finally {
    store.setRegistering(false);
  }
}

// 콜드 스타트로 앱이 켜지자마자 알림을 눌러 진입한 경우, NavigationContainer가 아직
// 마운트되지 않았을 수 있어 준비될 때까지 짧게 재시도한다.
function navigateFromContextKey(contextKey?: string | null, retriesLeft = 10) {
  const target = resolveNotificationTarget(contextKey);
  if (!target) return;

  if (!navigationRef.isReady()) {
    if (retriesLeft <= 0) return;
    setTimeout(() => navigateFromContextKey(contextKey, retriesLeft - 1), 300);
    return;
  }

  if (target.screen === "PostDetail") {
    navigationRef.navigate("PostDetail", { postId: target.postId });
  } else if (target.screen === "SpotDetail") {
    navigationRef.navigate("SpotDetail", { spotId: target.spotId });
  } else if (target.screen === "MissionList") {
    navigationRef.navigate("MissionList");
  }
}

function refreshNotificationQueries() {
  void queryClient.invalidateQueries({ queryKey: QK.notificationList });
  void queryClient.invalidateQueries({ queryKey: QK.notificationUnreadCount });
}

// 포그라운드에서 FCM 메시지를 받으면 시스템 배너를 직접 띄워주지 않으므로,
// expo-notifications로 즉시 로컬 알림을 하나 예약해 배너처럼 보이게 한다.
async function showForegroundBanner(title?: string | null, body?: string | null) {
  if (!title && !body) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: title ?? "알림", body: body ?? undefined },
    trigger: null,
  });
}

export function usePushNotificationBootstrap() {
  const setLastNotification = useDeviceNotificationStore(
    (state) => state.setLastNotification
  );

  useEffect(() => {
    if (isExpoGo) return;

    void registerForPushNotificationsAsync({ requestPermission: false });

    const messagingModule = require("@react-native-firebase/messaging");
    const instance = getMessagingInstanceLazy();
    if (!instance) return;

    const unsubscribeOnMessage = messagingModule.onMessage(
      instance,
      async (remoteMessage: RemoteMessage) => {
        const title = remoteMessage.notification?.title ?? (remoteMessage.data?.title as string | undefined);
        const body = remoteMessage.notification?.body ?? (remoteMessage.data?.body as string | undefined);
        setLastNotification(title ?? null, body ?? null);
        refreshNotificationQueries();
        void showForegroundBanner(title, body);
      }
    );

    const unsubscribeOnOpen = messagingModule.onNotificationOpenedApp(
      instance,
      (remoteMessage: RemoteMessage) => {
        setLastNotification(
          remoteMessage.notification?.title ?? null,
          remoteMessage.notification?.body ?? null
        );
        refreshNotificationQueries();
        navigateFromContextKey(remoteMessage.data?.contextKey as string | undefined);
      }
    );

    // 앱이 완전히 종료된 상태에서 알림을 눌러 실행된 경우
    void messagingModule.getInitialNotification(instance).then((remoteMessage: RemoteMessage | null) => {
      if (!remoteMessage) return;
      refreshNotificationQueries();
      navigateFromContextKey(remoteMessage.data?.contextKey as string | undefined);
    });

    const unsubscribeOnTokenRefresh = messagingModule.onTokenRefresh(instance, (token: string) => {
      useDeviceNotificationStore
        .getState()
        .setRegistrationState({ fcmToken: token, permissionGranted: true });
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpen();
      unsubscribeOnTokenRefresh();
    };
  }, [setLastNotification]);
}

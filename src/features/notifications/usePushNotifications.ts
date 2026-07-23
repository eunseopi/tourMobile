import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useDeviceNotificationStore } from "src/stores/deviceNotificationStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type RegisterOptions = {
  requestPermission?: boolean;
};

export async function registerForPushNotificationsAsync(
  options: RegisterOptions = {}
) {
  const { requestPermission = false } = options;
  const store = useDeviceNotificationStore.getState();

  try {
    store.setRegistering(true);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const currentPermission = await Notifications.getPermissionsAsync();
    let granted =
      currentPermission.granted ||
      currentPermission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (!granted && requestPermission) {
      const requested = await Notifications.requestPermissionsAsync();
      granted =
        requested.granted ||
        requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    }

    if (!granted) {
      store.setRegistrationState({
        expoPushToken: null,
        permissionGranted: false,
      });
      return null;
    }

    const projectId = process.env.EXPO_PUBLIC_EXPO_PROJECT_ID;
    const tokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    store.setRegistrationState({
      expoPushToken: tokenResponse.data,
      permissionGranted: true,
    });

    return tokenResponse.data;
  } catch {
    store.setRegistrationState({
      expoPushToken: null,
      permissionGranted: false,
    });
    return null;
  } finally {
    store.setRegistering(false);
  }
}

export function usePushNotificationBootstrap() {
  const setLastNotification = useDeviceNotificationStore(
    (state) => state.setLastNotification
  );

  useEffect(() => {
    void registerForPushNotificationsAsync({ requestPermission: false });

    const receivedSub = Notifications.addNotificationReceivedListener((event) => {
      setLastNotification(
        event.request.content.title ?? null,
        event.request.content.body ?? null
      );
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        setLastNotification(
          response.notification.request.content.title ?? null,
          response.notification.request.content.body ?? null
        );
      }
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [setLastNotification]);
}

import { create } from "zustand";

type DeviceNotificationState = {
  fcmToken: string | null;
  permissionGranted: boolean;
  isRegistering: boolean;
  lastNotificationTitle: string | null;
  lastNotificationBody: string | null;
  setRegistrationState: (payload: {
    fcmToken: string | null;
    permissionGranted: boolean;
  }) => void;
  setRegistering: (value: boolean) => void;
  setLastNotification: (title: string | null, body: string | null) => void;
};

export const useDeviceNotificationStore = create<DeviceNotificationState>((set) => ({
  fcmToken: null,
  permissionGranted: false,
  isRegistering: false,
  lastNotificationTitle: null,
  lastNotificationBody: null,
  setRegistrationState: ({ fcmToken, permissionGranted }) =>
    set({ fcmToken, permissionGranted }),
  setRegistering: (value) => set({ isRegistering: value }),
  setLastNotification: (title, body) =>
    set({
      lastNotificationTitle: title,
      lastNotificationBody: body,
    }),
}));

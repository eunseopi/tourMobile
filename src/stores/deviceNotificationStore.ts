import { create } from "zustand";

type DeviceNotificationState = {
  expoPushToken: string | null;
  permissionGranted: boolean;
  isRegistering: boolean;
  lastNotificationTitle: string | null;
  lastNotificationBody: string | null;
  setRegistrationState: (payload: {
    expoPushToken: string | null;
    permissionGranted: boolean;
  }) => void;
  setRegistering: (value: boolean) => void;
  setLastNotification: (title: string | null, body: string | null) => void;
};

export const useDeviceNotificationStore = create<DeviceNotificationState>((set) => ({
  expoPushToken: null,
  permissionGranted: false,
  isRegistering: false,
  lastNotificationTitle: null,
  lastNotificationBody: null,
  setRegistrationState: ({ expoPushToken, permissionGranted }) =>
    set({ expoPushToken, permissionGranted }),
  setRegistering: (value) => set({ isRegistering: value }),
  setLastNotification: (title, body) =>
    set({
      lastNotificationTitle: title,
      lastNotificationBody: body,
    }),
}));

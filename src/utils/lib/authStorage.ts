import AsyncStorage from "@react-native-async-storage/async-storage";

const REMEMBERED_EMAIL_KEY = "auth:rememberedEmail";
const LOGIN_AT_KEY = "auth:loginAt";

const SESSION_TTL_MS = 60 * 60 * 1000; // 1시간

export const authStorage = {
  getRememberedEmail: () => AsyncStorage.getItem(REMEMBERED_EMAIL_KEY),
  setRememberedEmail: (email: string) => AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email),
  clearRememberedEmail: () => AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY),

  markLoginNow: () => AsyncStorage.setItem(LOGIN_AT_KEY, String(Date.now())),
  clearLoginAt: () => AsyncStorage.removeItem(LOGIN_AT_KEY),

  isSessionExpired: async () => {
    const raw = await AsyncStorage.getItem(LOGIN_AT_KEY);
    if (!raw) return false;
    const loginAt = Number(raw);
    if (!Number.isFinite(loginAt)) return false;
    return Date.now() - loginAt > SESSION_TTL_MS;
  },
};

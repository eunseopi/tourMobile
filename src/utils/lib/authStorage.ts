import AsyncStorage from "@react-native-async-storage/async-storage";

const REMEMBERED_EMAIL_KEY = "auth:rememberedEmail";
const LOGIN_AT_KEY = "auth:loginAt";

const SESSION_TTL_MS = 60 * 60 * 1000; // 1시간

// API 요청마다 세션 만료 여부를 체크하는데, 매번 AsyncStorage를 왕복하면 모든
// 요청에 브리지 호출 지연이 더해진다. 로그인 시각은 메모리에도 캐싱해 첫 조회
// 이후로는 즉시 응답하도록 한다.
let cachedLoginAt: number | null | undefined = undefined;

async function loadLoginAt(): Promise<number | null> {
  if (cachedLoginAt !== undefined) return cachedLoginAt;
  const raw = await AsyncStorage.getItem(LOGIN_AT_KEY);
  const parsed = raw ? Number(raw) : null;
  cachedLoginAt = parsed != null && Number.isFinite(parsed) ? parsed : null;
  return cachedLoginAt;
}

export const authStorage = {
  getRememberedEmail: () => AsyncStorage.getItem(REMEMBERED_EMAIL_KEY),
  setRememberedEmail: (email: string) => AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email),
  clearRememberedEmail: () => AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY),

  markLoginNow: () => {
    const now = Date.now();
    cachedLoginAt = now;
    return AsyncStorage.setItem(LOGIN_AT_KEY, String(now));
  },
  clearLoginAt: () => {
    cachedLoginAt = null;
    return AsyncStorage.removeItem(LOGIN_AT_KEY);
  },

  isSessionExpired: async () => {
    const loginAt = await loadLoginAt();
    if (loginAt == null) return false;
    return Date.now() - loginAt > SESSION_TTL_MS;
  },
};

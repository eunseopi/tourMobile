import { useEffect, useRef } from "react";
import { notificationApi } from "src/api/notification";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useDeviceNotificationStore } from "src/stores/deviceNotificationStore";

/**
 * 서버는 로그인된 사용자에게만 푸시 토큰을 연결할 수 있으므로,
 * 세션이 확인된 이후(로그인 상태)에만 토큰을 전송한다.
 * 그 전에 보내면 인증 인터셉터가 401을 세션 만료로 오인해 로그인 화면으로 튕겨낸다.
 */
export function useRegisterPushToken() {
  const { data: session } = useSessionMe();
  const fcmToken = useDeviceNotificationStore((state) => state.fcmToken);
  const sentTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session || !fcmToken) return;
    if (sentTokenRef.current === fcmToken) return;

    notificationApi
      .updateFcmToken(fcmToken)
      .then(() => {
        sentTokenRef.current = fcmToken;
      })
      .catch(() => {
        // 다음 세션 갱신 시 재시도된다.
      });
  }, [session, fcmToken]);
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "src/api/notification";
import { registerForPushNotificationsAsync } from "src/features/notifications/usePushNotifications";
import { QK } from "src/utils/lib/queryKeys";

export function useNotification() {
    const queryClient = useQueryClient();
    const { data: notiEnabled = false } = useQuery({
        queryKey: QK.notificationSettings,
        queryFn: async () => {
            const res = await notificationApi.getSettings();
            return res.data.data;
        },
    });

    const mutation = useMutation({
        mutationKey: QK.mNotificationSettings,
        mutationFn: notificationApi.updateSettings,
        onMutate: async (enabled) => {
            await queryClient.cancelQueries({ queryKey: QK.notificationSettings });
            const previous = queryClient.getQueryData<boolean>(QK.notificationSettings);
            queryClient.setQueryData(QK.notificationSettings, enabled);
            return { previous };
        },
        onError: (_error, _enabled, context) => {
            queryClient.setQueryData(QK.notificationSettings, context?.previous ?? false);
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: QK.notificationSettings });
        },
    });
    
    // 토글 — 온보딩 때 알림 권한을 거절했거나 건너뛴 계정이 마이페이지에서 다시 켤 수도
    // 있으므로, 켤 때는 OS 권한 요청 + FCM 토큰 등록도 함께 시도한다(Expo Go에서는
    // 내부적으로 무시됨). 서버 설정은 권한 결과와 무관하게 유저가 고른 값 그대로 저장한다.
    const toggleNoti = async (enabled: boolean) => {
        if (enabled) {
            void registerForPushNotificationsAsync({ requestPermission: true });
        }
        mutation.mutate(enabled);
    };

    return { notiEnabled, toggleNoti };
};

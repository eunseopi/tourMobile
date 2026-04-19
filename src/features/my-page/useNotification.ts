import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "src/api/notification";
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
    
    // 토글
    const toggleNoti = async (enabled: boolean) => {
        mutation.mutate(enabled);
    };

    return { notiEnabled, toggleNoti };
};

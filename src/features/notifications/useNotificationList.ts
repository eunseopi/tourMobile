import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "src/api/notification";
import { QK } from "src/utils/lib/queryKeys";

export function useNotificationList() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: QK.notificationList,
    queryFn: async () => {
      const res = await notificationApi.getList();
      return res.data.data;
    },
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QK.notificationList });
    void queryClient.invalidateQueries({ queryKey: QK.notificationUnreadCount });
  };

  const markAsReadMutation = useMutation({
    mutationKey: QK.mMarkNotificationRead,
    mutationFn: notificationApi.markAsRead,
    onSuccess: invalidate,
  });

  const markAllAsReadMutation = useMutation({
    mutationKey: QK.mMarkAllNotificationsRead,
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: invalidate,
  });

  const deleteOneMutation = useMutation({
    mutationKey: QK.mDeleteNotification,
    mutationFn: notificationApi.deleteOne,
    onSuccess: invalidate,
  });

  const deleteAllMutation = useMutation({
    mutationKey: QK.mDeleteAllNotifications,
    mutationFn: notificationApi.deleteAll,
    onSuccess: invalidate,
  });

  return {
    notifications,
    isLoading,
    isError,
    isRefetching,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    deleteOne: deleteOneMutation.mutate,
    deleteAll: deleteAllMutation.mutate,
    isDeletingAll: deleteAllMutation.isPending,
  };
}

export function useUnreadNotificationCount() {
  const { data } = useQuery({
    queryKey: QK.notificationUnreadCount,
    queryFn: async () => {
      const res = await notificationApi.getUnreadCount();
      return res.data.data;
    },
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  });
  return data ?? 0;
}

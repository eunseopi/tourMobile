import api from "./instance";

// boolean이라 타입 붙여주기
type ApiRes<T> = {
    success: boolean;
    data: T;
    message?: string;
    errorCode?: string;
    timestamp?: string;
    failure?: boolean;
}

export type NotificationType =
    | "REPLY"
    | "CHALLENGE"
    | "STEP"
    | "COMMENTS"
    | "POPULARITY"
    | "LIKE"
    | "ATTENDANCE"
    | "MISSION";

// 백엔드 NotificationDto는 title/content가 아니라 message 하나만 내려주고,
// 시간대 파싱 문제를 피하기 위해 서버에서 이미 포맷팅한 날짜/시간 문자열도 함께 내려준다.
export type NotificationDto = {
    id: number;
    message: string;
    type: NotificationType;
    nickname?: string;
    read: boolean;
    createdAt: string;
    contextKey?: string | null;
    formattedDate?: string;
    formattedTime?: string;
};

export const notificationApi = {
    getSettings: () =>
        api.get<ApiRes<boolean>>('v1/notification/settings'),
    updateSettings: (enabled: boolean) =>
        api.post<ApiRes<null>>('/v1/notification/settings', { enabled }),

    // FCM(Expo) 푸시 토큰 등록
    updateFcmToken: (fcmToken: string) =>
        api.post<ApiRes<string>>('v1/notification/fcm-token', { fcmToken }),

    // 알림 목록
    getList: () =>
        api.get<ApiRes<NotificationDto[]>>('v1/notification'),
    getUnreadCount: () =>
        api.get<ApiRes<number>>('v1/notification/unread-count'),
    markAsRead: (notificationId: number) =>
        api.post<ApiRes<string>>(`v1/notification/${notificationId}/read`),
    markAllAsRead: () =>
        api.post<ApiRes<string>>('v1/notification/mark-all-read'),
    deleteOne: (notificationId: number) =>
        api.delete<ApiRes<string>>(`v1/notification/${notificationId}`),
    deleteAll: () =>
        api.delete<ApiRes<string>>('v1/notification/all'),
}

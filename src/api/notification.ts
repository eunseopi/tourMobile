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

export const notificationApi = {
    getSettings: () =>
        api.get<ApiRes<boolean>>('v1/notification/settings'),
    updateSettings: (enabled: boolean) =>
        api.post<ApiRes<null>>('/v1/notification/settings', { enabled }),
}
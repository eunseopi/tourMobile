import api from "./instance";

// 유저정보
export type SessionMe = {
    userId: string;
    email: string;
    name: string;
    nickname: string;
    profile: string | null;
    language: "KOREAN";
    platform: "APP";
    gender: "MALE" | "FEMALE";
    birthYear: string | null;
    themes: string[];
    notificationEnabled: boolean;
    createdAt: string;
    hallabong: number;
    totalSteps: number;
    moodGrade: string;
};

// 서버 응답 포맷
type ApiRes<T> = { success: boolean; data: T }

// 'userId | 'nickname' | 'profile' | 'moodGrade'
export const CORE_FIELDS = ['userId', 'nickname', 'profile', 'moodGrade'] as const;
export type CoreField = typeof CORE_FIELDS[number];

export const userApi = {
    // 전체 프로필
    getSessionMe: () => api.get<ApiRes<SessionMe>>('v1/users/session/me'),

    // K → SessionMe에 있는 key 들 중 해당항목만 가져오기 
    getSessionMeFields: <K extends keyof SessionMe>(fields: readonly K[]) =>
        api.get<ApiRes<Pick<SessionMe, K>>>('v1/users/session/me', {
            params: { fields: fields.join(',') }
    }),

    // 비밀번호 수정
    resetPassword: (email: string, newPassword: string, signal?: AbortSignal) =>
        api.post<ApiRes<string>>('v1/users/auth/find/password/reset', null, { params: { email, newPassword }, signal }),

    // 테마 수정
    changeThemes: (themes: string[], signal?: AbortSignal) => 
        api.post<ApiRes<string>>('v1/users/account/themes', themes, { signal }),

    // 프로필 수정
    changeNickname: (nickname: string, signal?: AbortSignal) =>
        api.post<ApiRes<string>>('v1/users/account/nickname', null, { params: { nickname }, signal }),
    updateProfileImg: (file: File | Blob, signal?: AbortSignal) => {
        const form = new FormData();
        form.append('newProfileImage', file);
        return api.put<ApiRes<string>>('v1/users/profile', form, { signal });
    },
    deleteProfileImg: (signal?: AbortSignal) =>
        api.delete<ApiRes<string>>('v1/users/profile', { signal }),
}
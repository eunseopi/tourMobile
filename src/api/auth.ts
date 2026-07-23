import api from "./instance";
import type { UploadableImage } from "src/types/SpotTypes";

export const authApi = {
    login: (data: { email: string, password: string }) =>
        api.post('/v1/users/auth/login', data),
    kakaoLogin: (code: string) => 
        api.post('/v1/users/kakao/login', null, { params: { code } }),

    // register
    checkEmailDuplicate: (email: string) => 
        api.get('/v1/users/register/check/email', { params: { email } }),
    sendEmailCode: (email: string) => 
        api.post('/v1/users/register/email/send', { email }),
    verifyEmailCode: (email: string, code: string) => 
        api.post('/v1/users/register/email/verify', { email, code }),
    registerAppUser: (data: { email: string, password: string }) =>
        api.post('/v1/users/register/password', data),
    checkNicknameDuplicate: (nickname: string) => 
        api.get('/v1/users/register/check/nickname', { params: { nickname }}),
    registerFinal: (
        payload: {
            email: string;
            nickname: string;
            themes: string[];
            gender: 'MALE' | 'FEMALE';
            birthYear: string;
            referrerNickname: string;
        }, profileFile?: UploadableImage | null
    ) => {
            const fd = new FormData();

            const dataBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            fd.append('data', dataBlob);

            if (profileFile) {
                fd.append('profile', {
                    uri: profileFile.uri,
                    name: profileFile.name ?? `register-${Date.now()}.jpg`,
                    type: profileFile.type ?? 'image/jpeg',
                } as any);
            }

            return api.post('/v1/users/register/final', fd)

        },

    registerFinalKaKao: (
        payload: {
        code: string; 
        nickname: string; 
        themes: string[]; 
        gender: 'MALE' | 'FEMALE'; 
        birthYear: string; 
        referrerNickname: string;
    }) => api.post('/v1/users/kakao/final-register', payload),
}
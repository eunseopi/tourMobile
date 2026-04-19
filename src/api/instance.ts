import axios, { AxiosHeaders } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    withCredentials: true,
    // headers: {
    //     'Content-Type': 'application/json'
    // },
    timeout: 0, // 요청 제한시간
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
    const isForm = typeof FormData !== 'undefined' && config.data instanceof FormData;
    const header = config.headers as AxiosHeaders | Record<string, any> | undefined;

    if(isForm) {
        if((header as any)?.delete) {
            (header as AxiosHeaders).delete('Content-Type');
        }
        if(header) {
            delete (header as any)['Content-Type'];
            delete (header as any)['content-type'];
        }
    } else {
        if ((header as any)?.set) (header as AxiosHeaders).set("Content-Type", "application/json");
        else (header as any)["Content-Type"] = "application/json";
    }
    
    return config;
}, error => Promise.reject(error));

// 응답 인터셉터
api.interceptors.response.use(res => res, error => {
    if (error.response?.status == 401) {
        // 로그인 만료
    }
    return Promise.reject(error);
});

export default api;
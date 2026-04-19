import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { userApi } from "src/api/users";
import { QK } from "src/utils/lib/queryKeys";

type Vars = { email: string; newPassword: string; }
type ApiError = { errorCode?: string; message?: string;}

export const useResetPassword = () => {
    return useMutation<string, AxiosError<ApiError>, Vars>({
        mutationKey: QK.mResetPassword,
        mutationFn: async({ email, newPassword}) => {
            const res = await userApi.resetPassword(email, newPassword);
            return res.data.data;
        },
    });
};
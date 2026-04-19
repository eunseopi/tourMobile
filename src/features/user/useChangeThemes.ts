import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { userApi } from "src/api/users";
import { QK } from "src/utils/lib/queryKeys";

type ApiError = { errorCode?: string; message?: string; }

export const useChangeThemes = () => {
    const qc = useQueryClient();

    return useMutation<string, AxiosError<ApiError>, { themes: string[] }>({
        mutationKey: QK.mChangeThemes,
        mutationFn: async({ themes }) => {
            const res = await userApi.changeThemes(themes);
            return res.data.data;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QK.sessionMe });
        },
    });
};
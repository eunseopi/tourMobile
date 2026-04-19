import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { productApi } from "src/api/product";
import { QK } from "src/utils/lib/queryKeys";

type Vars = { exchangeId: string | number; userId?: string | number };
type ApiError = { errorCode?: string; message?: string; }

export const useAcceptToggle = () => {
    const qc = useQueryClient();

    return useMutation<string, AxiosError<ApiError>, Vars>({
        mutationKey: QK.acceptToggle(':exchangeId'),
        mutationFn: async ({ exchangeId }) => {
            if (exchangeId === null || String(exchangeId) === '') throw new Error('[accept-toggle] :exchangeId 누락');
            console.debug("[accept-toggle] vars", { exchangeId });
            const res = await productApi.acceptToggle(exchangeId);
            return res.data.data;
        },
        onSuccess: async (_data, vars) => {
            const tasks = [ qc.invalidateQueries({ queryKey: QK.sessionMe }) ];
            if (vars.userId != null) tasks.push(qc.invalidateQueries({ queryKey: QK.myProducts(vars.userId)}));
            await Promise.all(tasks);
        },
        retry: 0,
    })
};
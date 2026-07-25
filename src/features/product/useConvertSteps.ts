import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stepsApi } from "src/api/stepsApi";
import { QK } from "src/utils/lib/queryKeys";

export function useConvertSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestedPoints: number) => {
      const res = await stepsApi.convert(requestedPoints);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QK.sessionMe, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          hallabong: data.totalHallabong,
        };
      });
      void queryClient.invalidateQueries({ queryKey: QK.sessionMe });
    },
  });
}

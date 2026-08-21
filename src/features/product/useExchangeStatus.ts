import { useQuery } from "@tanstack/react-query";
import { stepsApi } from "src/api/stepsApi";
import { QK } from "src/utils/lib/queryKeys";

export function useExchangeStatus() {
  return useQuery({
    queryKey: QK.exchangeStatus,
    queryFn: async ({ signal }) => {
      const res = await stepsApi.getExchangeStatus(signal);
      return res.data.data;
    },
  });
}

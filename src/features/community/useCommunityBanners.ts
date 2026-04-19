import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import type { BannerItem } from "src/components/community/types";
import { QK } from "src/utils/lib/queryKeys";

export function useCommunityBanners(date?: string) {
  return useQuery<BannerItem[]>({
    queryKey: QK.communityBanners(date),
    queryFn: () => communityApi.getBanners(date),
  });
}

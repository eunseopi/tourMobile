import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import type { SpotPage } from "src/reducer/types";
import { QK } from "src/utils/lib/queryKeys";

type CommunityTab = "latest" | "popular";

export function useCommunityPosts(tab: CommunityTab, page = 0, size = 20) {
  return useQuery<SpotPage>({
    queryKey: QK.communityPosts(tab, page, size),
    queryFn: () =>
      tab === "latest"
        ? communityApi.getLatest(page, size)
        : communityApi.getPopular(page, size),
  });
}

import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import type { SpotPage } from "src/reducer/types";
import type { CommunityTypeFilter } from "src/stores/communityStore";
import { QK } from "src/utils/lib/queryKeys";

type CommunityTab = "latest" | "popular";

export function useCommunityPosts(
  tab: CommunityTab,
  page = 0,
  size = 20,
  typeFilter: CommunityTypeFilter = "ALL"
) {
  const type = typeFilter === "ALL" ? undefined : typeFilter;
  return useQuery<SpotPage>({
    queryKey: QK.communityPosts(tab, page, size, typeFilter),
    queryFn: () =>
      tab === "latest"
        ? communityApi.getLatest(page, size, type)
        : communityApi.getPopular(page, size, type),
  });
}

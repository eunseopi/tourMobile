import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import { useReportedContentStore } from "src/stores/reportedContentStore";

const DEBOUNCE_MS = 350;

export function useCommunitySearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ["GET /api/spots/community/search", debouncedQuery],
    queryFn: () => communityApi.searchCommunity(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const historyQuery = useQuery({
    queryKey: ["GET /api/spots/community/history"],
    queryFn: () => communityApi.getCommunitySearchHistory(),
  });

  const reportedPostIds = useReportedContentStore((state) => state.reportedPostIds);
  const results = useMemo(
    () => (searchQuery.data?.content ?? []).filter((item) => !reportedPostIds.includes(item.id)),
    [searchQuery.data, reportedPostIds]
  );

  // 같은 검색어를 여러 번 검색하면 서버가 매번 새 기록을 저장해서 같은 단어가 중복으로 내려올 수 있다.
  const history = useMemo(() => [...new Set(historyQuery.data ?? [])], [historyQuery.data]);

  return {
    query,
    setQuery,
    isSearching: debouncedQuery.length > 0,
    results,
    isLoadingResults: searchQuery.isFetching,
    isResultsError: searchQuery.isError,
    refetchResults: searchQuery.refetch,
    history,
    refetchHistory: historyQuery.refetch,
  };
}

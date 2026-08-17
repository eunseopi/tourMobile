import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { myPageApi, type MyPostSort } from "src/api/mypage";
import type { Spot } from "src/reducer/types";
import { QK } from "src/utils/lib/queryKeys";

const PAGE_SIZE = 20;

function usePagedActivity<T extends { id: number }>(
  queryKey: readonly unknown[],
  fetchPage: (page: number) => Promise<{ content: T[]; totalPages: number }>,
  resetKey: unknown
) {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    setPage(0);
    setItems([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () => fetchPage(page),
  });

  useEffect(() => {
    if (!data) return;
    setItems((prev) => (page === 0 ? data.content : [...prev, ...data.content]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page]);

  const hasMore = data ? page + 1 < data.totalPages : false;

  return {
    items,
    isLoading: isLoading && page === 0,
    isLoadingMore: isFetching && page > 0,
    isError,
    hasMore,
    loadMore: () => {
      if (hasMore && !isFetching) setPage((prev) => prev + 1);
    },
    refetch: () => {
      setPage(0);
      setItems([]);
      void refetch();
    },
    patchItem: (id: number, updater: (item: T) => T) => {
      setItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    },
  };
}

export function useMyPosts(sort: MyPostSort) {
  return usePagedActivity<Spot>(
    QK.myPosts(0, PAGE_SIZE, sort),
    async (page) => {
      const res = await myPageApi.getMyPosts(page, PAGE_SIZE, sort);
      return { content: res.content, totalPages: res.totalPages };
    },
    sort
  );
}

export function useMyComments() {
  return usePagedActivity(
    QK.myComments(0, PAGE_SIZE),
    async (page) => {
      const res = await myPageApi.getMyComments(page, PAGE_SIZE);
      return { content: res.content, totalPages: res.totalPages };
    },
    "comments"
  );
}

export function useMyLikedSpots() {
  return usePagedActivity<Spot>(
    QK.myLikedSpots(0, PAGE_SIZE),
    async (page) => {
      const res = await myPageApi.getMyLikedSpots(page, PAGE_SIZE);
      return { content: res.content, totalPages: res.totalPages };
    },
    "liked"
  );
}

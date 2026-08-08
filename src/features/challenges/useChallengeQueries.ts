import { useEffect, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { challengeApi } from "src/api/challengeApi";
import type { ChallengeCardData } from "src/reducer/types";
import { useChallengeStore } from "src/stores/challengeStore";
import { QK } from "src/utils/lib/queryKeys";

const fmt = (value?: string | number | Date) => {
  const date = value ? new Date(value) : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
};

const numOrNull = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const challengeCoords = (row: any) => ({
  latitude: numOrNull(row?.latitude ?? row?.lat ?? row?.spotLatitude ?? row?.challengeLatitude),
  longitude: numOrNull(row?.longitude ?? row?.lng ?? row?.lon ?? row?.spotLongitude ?? row?.challengeLongitude),
});

const toUpcomingCard = (row: any): ChallengeCardData => ({
  id: String(row?.id),
  title: row?.name ?? row?.title ?? "제목 없음",
  categoryLabel: row?.themeName ?? "취향 저격 스팟",
  statusLabel: "진행전",
  dateText: fmt(),
  imageUrl: row?.img1 ?? row?.imageUrl ?? "",
  description: row?.description ?? "",
  ...challengeCoords(row),
  categoryTone: row?.themeName ? "primary" : "neutral",
});

const toOngoingCard = (row: any): ChallengeCardData => {
  const start = row?.startDate ? fmt(row.startDate) : "";
  const end = row?.endDate ? fmt(row.endDate) : "";

  return {
    id: String(row?.id),
    title: row?.name ?? row?.title ?? "제목 없음",
    categoryLabel: row?.themeName ?? "취향 저격 스팟",
    statusLabel: "진행중",
    dateText: start && end ? `${start} ~ ${end}` : start || end || "",
    imageUrl: row?.img1 ?? row?.imageUrl ?? "",
    description: row?.description ?? "",
    ...challengeCoords(row),
    categoryTone: row?.themeName ? "primary" : "neutral",
  };
};

const toCompletedCard = (row: any): ChallengeCardData => ({
  id: String(row?.id),
  title: row?.name ?? row?.title ?? "제목 없음",
  categoryLabel: row?.themeName ?? "취향 저격 스팟",
  statusLabel: "완료",
  dateText: row?.completedAt
    ? fmt(row.completedAt)
    : row?.endDate
      ? fmt(row.endDate)
      : "",
  imageUrl: row?.img1 ?? row?.imageUrl ?? "",
  description: row?.description ?? "",
  ...challengeCoords(row),
  categoryTone: row?.themeName ? "primary" : "neutral",
});

function rowsFromResponse(data: any) {
  return Array.isArray(data) ? data : (data?.content ?? []);
}

export function useLoadUpcomingChallenges() {
  const setReadyChallenges = useChallengeStore((state) => state.setReadyChallenges);
  const query = useQuery<ChallengeCardData[], Error>({
    queryKey: QK.challengesUpcoming,
    queryFn: async () => {
      const res = await challengeApi.getUpcoming();
      return rowsFromResponse(res.data).map(toUpcomingCard);
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) setReadyChallenges(query.data);
  }, [query.data, setReadyChallenges]);

  return query;
}

export function useLoadOngoingChallenges() {
  const setDoingChallenges = useChallengeStore((state) => state.setDoingChallenges);
  const query = useQuery<ChallengeCardData[], Error>({
    queryKey: QK.challengesOngoing,
    queryFn: async () => {
      const res = await challengeApi.getOngoing();
      return rowsFromResponse(res.data).map(toOngoingCard);
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) setDoingChallenges(query.data);
  }, [query.data, setDoingChallenges]);

  return query;
}

export function useLoadCompletedChallenges(size = 20) {
  const setDoneChallenges = useChallengeStore((state) => state.setDoneChallenges);
  const query = useInfiniteQuery({
    queryKey: QK.challengesCompleted(size),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await challengeApi.getCompleted({
        sort: "latest",
        size,
        ...(pageParam ? { lastId: pageParam } : {}),
      });
      const rows = rowsFromResponse(res.data);
      const last = rows.at(-1);

      return {
        items: rows.map(toCompletedCard),
        nextLastId: rows.length >= size && last ? String(last.id) : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextLastId,
    staleTime: 60_000,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  useEffect(() => {
    setDoneChallenges(items);
  }, [items, setDoneChallenges]);

  return { ...query, items };
}

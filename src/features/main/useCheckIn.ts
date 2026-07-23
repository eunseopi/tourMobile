import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "src/api/attendanceApi";
import { QK } from "src/utils/lib/queryKeys";

type CheckInState = {
  shouldOpen: boolean;
  day: number;
  reward: number;
  bonus: number;
};

const memoryAttendance = new Set<string>();

const todayKey = () => `attendance:${new Date().toISOString().slice(0, 10)}`;

function readDone(key: string) {
  return memoryAttendance.has(key);
}

function writeDone(key: string) {
  memoryAttendance.add(key);
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  const dateKey = todayKey();

  const mutation = useMutation({
    mutationKey: QK.attendanceCheck(dateKey),
    mutationFn: async () => {
      const { data } = await attendanceApi.check();
      return data;
    },
    onSuccess: (data) => {
      writeDone(dateKey);
      queryClient.setQueryData(QK.attendanceCheck(dateKey), data);
      void queryClient.invalidateQueries({ queryKey: QK.sessionMe });
    },
    onError: () => {
      writeDone(dateKey);
    },
  });

  const run = useCallback(() => {
    if (readDone(dateKey)) return;
    if (mutation.isPending || mutation.isSuccess) return;
    mutation.mutate();
  }, [dateKey, mutation]);

  useEffect(() => {
    run();
  }, [run]);

  const state = useMemo<CheckInState>(() => {
    const data = mutation.data;
    const day = Number(data?.days ?? 0);
    const reward = Number(data?.baseHallabong ?? 0);
    const bonus = Number(data?.bonusHallabong ?? 0);
    return {
      shouldOpen: reward + bonus > 0,
      day,
      reward,
      bonus,
    };
  }, [mutation.data]);

  const claim = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: QK.sessionMe });
  }, [queryClient]);

  return { state, claim, isLoading: mutation.isPending };
}

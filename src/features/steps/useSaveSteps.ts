import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stepsApi } from "src/api/stepsApi";
import { QK } from "src/utils/lib/queryKeys";

type Options = {
  minDelta?: number;
  minIntervalMs?: number;
  onSaved?: (sent: number) => void;
  enabled?: boolean;
};

let persistedLastSent = 0;
let persistedLastAt = 0;

/**
 * totalSteps는 "오늘 누적 걸음수"를 받는다. 서버 POST /v1/steps는 받은 stepCount를
 * 오늘 총계에 더하는 증분(additive) API라서, 여기서는 마지막 전송 이후 늘어난 만큼(delta)만
 * 보낸다 — 누적값을 그대로 보내면 매번 전체 걸음수가 중복으로 더해진다.
 */
export function useSaveSteps(totalSteps: number, options: Options = {}) {
  const {
    minDelta = 50,
    minIntervalMs = 60_000,
    onSaved,
    enabled = true,
  } = options;

  const lastSentRef = useRef(persistedLastSent);
  const lastAtRef = useRef(persistedLastAt);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: QK.mStepSave,
    mutationFn: stepsApi.save,
    onSuccess: (_data, sentDelta) => {
      void queryClient.invalidateQueries({ queryKey: QK.sessionMe });
      onSaved?.(sentDelta);
    },
  });

  const trySend = useCallback(
    async (count: number) => {
      if (!enabled || mutation.isPending) return;

      const safe = Math.max(0, Math.floor(count));
      let delta = safe - Math.floor(lastSentRef.current);

      // 자정이 지나 오늘 누적치가 줄어든 경우(하루 리셋) — 새 하루의 걸음수를 그대로 delta로 취급한다.
      if (delta < 0) {
        lastSentRef.current = 0;
        delta = safe;
      }

      if (delta < minDelta) return;

      const now = Date.now();
      if (now - lastAtRef.current < minIntervalMs) return;

      try {
        await mutation.mutateAsync(delta);
        lastSentRef.current = safe;
        lastAtRef.current = now;
        persistedLastSent = safe;
        persistedLastAt = now;
      } catch {
        // 다음 업데이트 때 다시 시도합니다.
      }
    },
    [enabled, minDelta, minIntervalMs, mutation]
  );

  useEffect(() => {
    if (!Number.isFinite(totalSteps)) return;
    void trySend(totalSteps);
  }, [totalSteps, trySend]);

  const flush = useCallback(() => {
    void trySend(totalSteps);
  }, [totalSteps, trySend]);

  return { flush, isSaving: mutation.isPending };
}

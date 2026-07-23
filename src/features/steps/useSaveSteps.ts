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
    onSuccess: (_data, sent) => {
      void queryClient.invalidateQueries({ queryKey: QK.sessionMe });
      onSaved?.(sent);
    },
  });

  const trySend = useCallback(
    async (count: number) => {
      if (!enabled || mutation.isPending) return;

      const safe = Math.max(0, Math.floor(count));
      const now = Date.now();
      const delta = safe - Math.floor(lastSentRef.current);

      if (delta < minDelta) return;
      if (now - lastAtRef.current < minIntervalMs) return;

      try {
        await mutation.mutateAsync(safe);
        lastSentRef.current = safe;
        lastAtRef.current = now;
        persistedLastSent = safe;
        persistedLastAt = now;
      } catch {
        // 다음 위치 업데이트 때 다시 시도합니다.
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { challengeApi } from "src/api/challengeApi";
import { useChallengeStore } from "src/stores/challengeStore";
import { QK } from "src/utils/lib/queryKeys";

type StartVars = {
  id: string | number;
  latitude: number;
  longitude: number;
};

type CompleteVars = {
  id: string | number;
  latitude: number;
  longitude: number;
  proofUrl: string;
  dateText?: string;
};

export function useStartChallenge() {
  const queryClient = useQueryClient();
  const startChallenge = useChallengeStore((state) => state.startChallenge);

  return useMutation({
    mutationKey: QK.mChallengeStart,
    mutationFn: ({ id, latitude, longitude }: StartVars) =>
      challengeApi.start(id, latitude, longitude),
    onSuccess: (_data, variables) => {
      startChallenge(String(variables.id));
      void queryClient.invalidateQueries({ queryKey: QK.challengesUpcoming });
      void queryClient.invalidateQueries({ queryKey: QK.challengesOngoing });
    },
  });
}

export function useRefreshUpcomingChallenges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: QK.mChallengeRefreshUpcoming,
    mutationFn: challengeApi.refreshUpcoming,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.challengesUpcoming });
    },
  });
}

export function useCancelChallenge() {
  const queryClient = useQueryClient();
  const cancelChallenge = useChallengeStore((state) => state.cancelChallenge);

  return useMutation({
    mutationKey: QK.mChallengeCancel,
    mutationFn: (id: string | number) => challengeApi.cancel(id),
    onSuccess: (_data, id) => {
      cancelChallenge(String(id));
      void queryClient.invalidateQueries({ queryKey: QK.challengesOngoing });
      void queryClient.invalidateQueries({ queryKey: QK.challengesUpcoming });
    },
  });
}

export function useCompleteChallenge() {
  const queryClient = useQueryClient();
  const completeChallenge = useChallengeStore((state) => state.completeChallenge);

  return useMutation({
    mutationKey: QK.mChallengeComplete,
    mutationFn: ({ id, latitude, longitude, proofUrl }: CompleteVars) =>
      challengeApi.complete(id, latitude, longitude, proofUrl),
    onSuccess: (_data, variables) => {
      completeChallenge(String(variables.id), variables.dateText);
      void queryClient.invalidateQueries({ queryKey: QK.challengesOngoing });
      void queryClient.invalidateQueries({ queryKey: QK.challengesCompleted(20) });
      void queryClient.invalidateQueries({ queryKey: QK.sessionMe });
      void queryClient.refetchQueries({ queryKey: QK.sessionMe });
    },
  });
}

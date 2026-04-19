import { create } from "zustand";
import type { ChallengeCardData, ChallengeState } from "src/reducer/types";

const today = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${dd}`;
};

type ChallengeStore = ChallengeState & {
  setInitialChallenges: (payload: Partial<ChallengeState>) => void;
  setReadyChallenges: (list: ChallengeCardData[]) => void;
  setDoingChallenges: (list: ChallengeCardData[]) => void;
  setDoneChallenges: (list: ChallengeCardData[]) => void;
  appendDoneChallenges: (list: ChallengeCardData[]) => void;
  startChallenge: (id: string) => void;
  completeChallenge: (id: string, dateText?: string) => void;
};

export const useChallengeStore = create<ChallengeStore>((set) => ({
  ready: [],
  doing: [],
  done: [],

  setInitialChallenges: (payload) => set((state) => ({ ...state, ...payload })),
  setReadyChallenges: (ready) => set({ ready }),
  setDoingChallenges: (doing) => set({ doing }),
  setDoneChallenges: (done) => set({ done }),
  appendDoneChallenges: (list) =>
    set((state) => {
      const seen = new Set(state.done.map((v) => v.id));
      const merged = [...state.done];
      for (const item of list) {
        if (!seen.has(item.id)) merged.push(item);
      }
      return { done: merged };
    }),
  startChallenge: (id) =>
    set((state) => {
      const index = state.ready.findIndex((c) => c.id === id);
      if (index === -1) return state;

      const picked = state.ready[index];
      const moved = { ...picked, statusLabel: "진행중" as const };

      return {
        ready: [...state.ready.slice(0, index), ...state.ready.slice(index + 1)],
        doing: [moved, ...state.doing],
      };
    }),
  completeChallenge: (id, dateText) =>
    set((state) => {
      const src =
        state.ready.find((c) => c.id === id) ??
        state.doing.find((c) => c.id === id);
      if (!src) return state;

      const moved: ChallengeCardData = {
        ...src,
        statusLabel: "완료",
        dateText: dateText ?? today(),
      };

      return {
        ready: state.ready.filter((c) => c.id !== id),
        doing: state.doing.filter((c) => c.id !== id),
        done: [moved, ...state.done],
      };
    }),
}));

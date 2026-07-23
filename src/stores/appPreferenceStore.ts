import { create } from "zustand";

type AppLanguage = "ko" | "en";

type AppPreferenceState = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

export const useAppPreferenceStore = create<AppPreferenceState>((set) => ({
  language: "ko",
  setLanguage: (language) => set({ language }),
}));

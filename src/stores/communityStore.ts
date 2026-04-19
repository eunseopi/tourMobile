import { create } from "zustand";

type CommunityTab = "latest" | "popular";

type CommunityStore = {
  activeTab: CommunityTab;
  currentPage: number;
  setActiveTab: (tab: CommunityTab) => void;
  setCurrentPage: (page: number) => void;
};

export const useCommunityStore = create<CommunityStore>((set) => ({
  activeTab: "latest",
  currentPage: 0,

  setActiveTab: (activeTab) => set({ activeTab, currentPage: 0 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
}));

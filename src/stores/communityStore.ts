import { create } from "zustand";

type CommunityTab = "latest" | "popular";
export type CommunityTypeFilter = "ALL" | "POST" | "SPOT" | "CHALLENGE";

type CommunityStore = {
  activeTab: CommunityTab;
  currentPage: number;
  typeFilter: CommunityTypeFilter;
  setActiveTab: (tab: CommunityTab) => void;
  setCurrentPage: (page: number) => void;
  setTypeFilter: (typeFilter: CommunityTypeFilter) => void;
};

export const useCommunityStore = create<CommunityStore>((set) => ({
  activeTab: "latest",
  currentPage: 0,
  typeFilter: "ALL",

  setActiveTab: (activeTab) => set({ activeTab, currentPage: 0 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTypeFilter: (typeFilter) => set({ typeFilter, currentPage: 0 }),
}));

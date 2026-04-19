export interface CommunityState {
  selectedFilter: string;
  searchQuery: string;
  isModalOpen: boolean;
}

export type CommunityAction =
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_MODAL' };
import { create } from 'zustand';
import { Wbs } from '../models/wbs';
import { fetchAllWbsFromFirestore } from '../newAPI/api';

interface WbsState {
  wbs: Wbs[];
  loading: boolean;
  loadWbs: (proposalId: string) => Promise<void>;
}

export const useWbsStore = create<WbsState>((set) => ({
  wbs: [],
  loading: false,
  loadWbs: async (proposalId: string) => {
    set({ loading: true });
    const wbs = await fetchAllWbsFromFirestore(proposalId);
    set({ wbs, loading: false });
  },
}));

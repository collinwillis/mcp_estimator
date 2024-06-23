import { create } from 'zustand';

import { ProposalPreferences } from '../models/proposal_preferences';
import { fetchProposalPreferencesFromFirestore } from '../newAPI/api';

interface PreferencesState {
  preferences: ProposalPreferences | null;
  loading: boolean;
  loadPreferences: (proposalId: string) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: null,
  loading: false,
  loadPreferences: async (proposalId: string) => {
    set({ loading: true });
    const preferences = await fetchProposalPreferencesFromFirestore(proposalId);
    set({ preferences, loading: false });
  },
}));

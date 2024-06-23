import { create } from 'zustand';

import { getSingleProposal } from '../api/proposal';
import { Proposal } from '../models/proposal';

interface ProposalState {
  proposal: Proposal | null;
  loading: boolean;
  loadProposal: (proposalId: string) => Promise<void>;
}

export const useProposalStore = create<ProposalState>((set) => ({
  proposal: null,
  loading: false,
  loadProposal: async (proposalId: string) => {
    set({ loading: true });
    const proposal = await getSingleProposal({ proposalId });
    set({ proposal, loading: false });
  },
}));

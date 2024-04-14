import { create } from 'zustand';
import { Proposal } from '../models/proposal';
import { getSingleProposal } from '../api/proposal';

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
        const proposal = await getSingleProposal({proposalId: proposalId});
        set({ proposal, loading: false });
    }
}));

import { create } from 'zustand';
import { Phase } from '../models/phase';
import {fetchAllPhasesFromFirestore} from "../newAPI/api";

interface PhaseState {
    phases: Phase[];
    loading: boolean;
    loadPhases: (proposalId: string) => Promise<void>;
}

export const usePhaseStore = create<PhaseState>((set) => ({
    phases: [],
    loading: false,
    loadPhases: async (proposalId: string) => {
        set({ loading: true });
        const phases = await fetchAllPhasesFromFirestore(proposalId);
        set({ phases, loading: false });
    }
}));

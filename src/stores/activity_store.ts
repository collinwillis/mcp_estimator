import { create } from 'zustand';
import { Activity } from '../models/activity';
import {Proposal} from "../models/proposal";
import {fetchAllActivitiesFromFirestore} from "../newAPI/api";

interface ActivityState {
    activities: Activity[];
    loading: boolean;
    loadActivities: (proposalId: string, proposal: Proposal) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set) => ({
    activities: [],
    loading: false,
    loadActivities: async (proposalId: string, proposal: Proposal) => {
        set({ loading: true });
        const activities = await fetchAllActivitiesFromFirestore(proposalId, proposal);
        set({ activities, loading: false });
    }
}));

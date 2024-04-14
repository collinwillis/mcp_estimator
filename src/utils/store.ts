// src/store/useStore.ts
import {create} from 'zustand';
import {fetchProposalData, fetchProposalPreferencesFromFirestore} from "../newAPI/api";
import {Phase} from "../models/phase";
import {Wbs} from "../models/wbs";
import {Activity} from "../models/activity";
import {Proposal} from "../models/proposal";
import {getSingleProposal} from "../api/proposal";
import {calculateTotals, getQuantityAndUnit} from "./utils";
import {ProposalPreferences} from "../models/proposal_preferences";
import {debouncedUpdateProposalPreferencesInFirestore} from "../newAPI/debounced";


export interface StoreState {
    proposal: Proposal | null;
    wbs: Record<string, Wbs[]>;
    visibleWbs: Record<string, Wbs[]>;
    phases: Record<string, Phase[]>;
    activities: Record<string, Activity[]>;
    preferences: Record<string, ProposalPreferences>;
    loading: boolean;

    loadFullProposalData: (proposalId: string) => Promise<void>;
    setPreferences: (proposalId: string, preferences: ProposalPreferences) => void;
    setVisibleWbs: (proposalId: string) => void; // New method to update visible WBS
}


export const estimatorStore = create<StoreState>()((set, get) => ({
    proposal: null,
    wbs: {},
    visibleWbs: {},
    phases: {},
    activities: {},
    preferences: {},
    loading: false,

    loadFullProposalData: async (proposalId: string) => {
        set({ loading: true });
        const proposal = await getSingleProposal({ proposalId });
        const preferences = await fetchProposalPreferencesFromFirestore(proposalId);
        const { wbs, phases, activities } = await fetchProposalData(proposalId, proposal!);

        const wbsLookup = wbs.reduce((acc, wbsItem) => {
            acc[wbsItem.id!] = wbsItem;
            return acc;
        }, {} as Record<string, Wbs>);


        const updatedWbs = wbs.map(wbsItem => {
            const relatedActivities = activities.filter(act => act.wbsId === wbsItem.id);
            const totals = calculateTotals(relatedActivities);
            return {
                ...wbsItem,
                ...totals,
                quantity: wbsItem.customQuantity ?? getQuantityAndUnit(relatedActivities, wbsItem.wbsDatabaseId!).quantity,
                unit: wbsItem.customUnit ?? getQuantityAndUnit(relatedActivities, wbsItem.wbsDatabaseId!).unit
            };
        });

        const updatedPhases = phases.map(phase => {
            const relatedActivities = activities.filter(act => act.phaseId === phase.id);
            const wbsId = phase.wbsId!;
            const totals = calculateTotals(relatedActivities);
            return {
                ...phase,
                ...totals,
                quantity: phase.customQuantity ?? getQuantityAndUnit(relatedActivities, wbsLookup[wbsId].wbsDatabaseId!).quantity,
                unit: phase.customUnit ?? getQuantityAndUnit(relatedActivities, wbsLookup[wbsId].wbsDatabaseId!).unit
            };
        });

        set(state => ({
            proposal: proposal,
            preferences: { ...state.preferences, [proposalId]: preferences },
            wbs: {...state.wbs, [proposalId]: updatedWbs},
            visibleWbs: { ...state.visibleWbs, [proposalId]: updatedWbs.filter(wbsItem => preferences.wbsToDisplay?.includes(wbsItem.name!)) },
            phases: {...state.phases, [proposalId]: updatedPhases},
            activities: {...state.activities, [proposalId]: activities},
            loading: false
        }));
    },

    setPreferences: (proposalId: string, preferences: ProposalPreferences) => {
        set(state => ({
            preferences: { ...state.preferences, [proposalId]: preferences }
        }));
        debouncedUpdateProposalPreferencesInFirestore(preferences);
        get().setVisibleWbs(proposalId);
    },

    setVisibleWbs: (proposalId: string) => {
        const { wbs, preferences } = get();
        set({
            visibleWbs: {
                ...get().visibleWbs,
                [proposalId]: wbs[proposalId].filter(wbsItem => preferences[proposalId].wbsToDisplay?.includes(wbsItem.name!))
            }
        });
    }


}));











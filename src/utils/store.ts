// src/store/useStore.ts
import {create} from 'zustand';
import {
    copyActivitiesFromPhaseToPhaseInFirestore,
    deletePhasesInFirestore, duplicatePhasesAndActivitiesInFirestore,
    fetchProposalData,
    fetchProposalPreferencesFromFirestore,
    insertPhaseToFirestore,
    updatePhaseFieldInFirestore
} from "../newAPI/api";
import {Phase} from "../models/phase";
import {Wbs} from "../models/wbs";
import {Activity} from "../models/activity";
import {Proposal} from "../models/proposal";
import {getSingleProposal} from "../api/proposal";
import {calculateTotals, getQuantityAndUnit} from "./utils";
import {ProposalPreferences} from "../models/proposal_preferences";
import {debouncedUpdateProposalPreferencesInFirestore} from "../newAPI/debounced";
import {FirestorePhase} from "../models/firestore models/phase_firestore";


export interface StoreState {
    proposal: Proposal | null;
    wbs: Record<string, Wbs[]>;
    visibleWbs: Record<string, Wbs[]>;
    phases: Record<string, Phase[]>;
    activities: Record<string, Activity[]>;
    preferences: Record<string, ProposalPreferences>;
    loading: boolean;

    loadFullProposalData: (proposalId: string) => Promise<void>;
    recalculatePhase(phaseId: string): void;
    setPreferences: (proposalId: string, preferences: ProposalPreferences) => void;
    setVisibleWbs: (proposalId: string) => void;
    addPhase: (newPhase: FirestorePhase) => Promise<void>;
    updatePhase: (phaseId: string, field: string, value: any) => Promise<void>;
    deletePhases: (phaseIds: string[]) => Promise<void>;
    duplicatePhases: (phaseIds: string[]) => Promise<void>;
    copyActivitiesFromPhase: (fromPhaseId: string, toPhaseId: string) => Promise<void>;
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

    recalculatePhase: (phaseId: string) => {
        set(state => {
            const existingPhases = state.phases[state.proposal?.id!] || [];
            const existingActivities = state.activities[state.proposal?.id!] || [];

            // Find the phase to recalculate totals
            const phaseIndex = existingPhases.findIndex(phase => phase.id === phaseId);
            if (phaseIndex === -1) return state; // Exit if phase not found

            const phaseActivities = existingActivities.filter(activity => activity.phaseId === phaseId);
            const totals = calculateTotals(phaseActivities);
            const updatedPhase = {...existingPhases[phaseIndex], ...totals};

            // Create a new array of phases with the updated phase
            const updatedPhases = [
                ...existingPhases.slice(0, phaseIndex),
                updatedPhase,
                ...existingPhases.slice(phaseIndex + 1)
            ];

            return {
                ...state,
                phases: {
                    ...state.phases,
                    [state.proposal?.id!]: updatedPhases
                }
            };
        });
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
    },
    addPhase: async (newPhase: FirestorePhase) => {
        const ref = await insertPhaseToFirestore(newPhase);
        const emptyTotals = calculateTotals([]);
        const phase = {
            ...newPhase,
            id: ref.id,
            ...emptyTotals
        } as Phase;
        set(state => {
            const existingPhases = state.phases[state.proposal?.id!] || [];
            return {
                ...state,
                phases: {
                    ...state.phases,
                    [state.proposal!.id!]: [...existingPhases, {...phase}]
                }
            };
        });
    },
    updatePhase: async (phaseId: string, field: string, value: any) => {
        await updatePhaseFieldInFirestore(phaseId, field, value);
        set(state => {
            const updatedPhases = {...state.phases};
            Object.keys(updatedPhases).forEach(proposalId => {
                const phases = updatedPhases[proposalId];
                const index = phases.findIndex(phase => phase.id === phaseId);
                if (index !== -1) {
                    const updatedPhase = { ...phases[index], [field]: value };
                    updatedPhases[proposalId] = [
                        ...phases.slice(0, index),
                        updatedPhase,
                        ...phases.slice(index + 1)
                    ];
                }
            });
            return { ...state, phases: updatedPhases };
        });
    },
    deletePhases: async (phaseIds: string[]) => {
        await deletePhasesInFirestore(phaseIds);
        set(state => {
            const updatedPhases = {...state.phases};
            const updatedActivities = {...state.activities};

            // Filter out the deleted phases
            Object.keys(updatedPhases).forEach(proposalId => {
                updatedPhases[proposalId] = updatedPhases[proposalId].filter(phase => !phaseIds.includes(phase.id!));
            });

            // Filter out activities related to the deleted phases
            Object.keys(updatedActivities).forEach(proposalId => {
                updatedActivities[proposalId] = updatedActivities[proposalId].filter(activity => !phaseIds.includes(activity.phaseId));
            });

            return {
                ...state,
                phases: updatedPhases,
                activities: updatedActivities
            };
        });
    },
    duplicatePhases: async (phaseIds: string[]) => {
        const { newPhaseIds, newActivityMappings } = await duplicatePhasesAndActivitiesInFirestore(phaseIds);
        set(state => {
            const proposalId = state.proposal?.id;
            if (!proposalId) return state; // If there's no current proposal, do nothing

            const existingPhases = state.phases[proposalId] || [];
            const existingActivities = state.activities[proposalId] || [];

            // Duplicate phases and create mappings for new phases
            const newPhases: Phase[] = [];
            for (const newPhaseId of newPhaseIds) {
                const oldPhaseId = phaseIds[newPhaseIds.indexOf(newPhaseId)]; // Map newPhaseId back to oldPhaseId
                const oldPhase = existingPhases.find(phase => phase.id === oldPhaseId);
                if (oldPhase) {
                    const duplicatedPhase = { ...oldPhase, id: newPhaseId };
                    newPhases.push(duplicatedPhase);
                }
            }

            // Duplicate activities and map them to the new phase IDs
            const newActivities: Activity[] = [];
            Object.entries(newActivityMappings).forEach(([oldActivityId, newActivityId]) => {
                const oldActivity = existingActivities.find(activity => activity.id === oldActivityId);
                if (oldActivity) {
                    const newPhaseId = newPhaseIds[phaseIds.indexOf(oldActivity.phaseId)]; // Map old phase ID to new phase ID
                    const duplicatedActivity = { ...oldActivity, id: newActivityId, phaseId: newPhaseId };
                    newActivities.push(duplicatedActivity);
                }
            });

            return {
                ...state,
                phases: {
                    ...state.phases,
                    [proposalId]: [...existingPhases, ...newPhases]
                },
                activities: {
                    ...state.activities,
                    [proposalId]: [...existingActivities, ...newActivities]
                }
            };
        });
    },
    copyActivitiesFromPhase: async (fromPhaseId: string, toPhaseId: string) => {
        const activityIdMap = await copyActivitiesFromPhaseToPhaseInFirestore(fromPhaseId, toPhaseId);
        set(state => {
            const proposalId = state.proposal?.id;
            if (!proposalId) return state; // Ensure there is a proposal ID

            const existingActivities = state.activities[proposalId] || [];
            const newActivities = Object.entries(activityIdMap).map(([oldId, newId]) => {
                const originalActivity = existingActivities.find(act => act.id === oldId);
                if (originalActivity) {
                    // Return a new activity object with the new ID and updated phaseId
                    return { ...originalActivity, id: newId, phaseId: toPhaseId };
                }
                return null; // Return null if no original activity is found
            }).filter(act => act != null) as Activity[]; // Filter out nulls to ensure all entries are valid Activity objects

            return {
                ...state,
                activities: {
                    ...state.activities,
                    [proposalId]: [...existingActivities, ...newActivities] // Merge new activities into the existing array
                }
            };
        });
    }


}));












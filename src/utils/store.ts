// src/store/useStore.ts
import { create } from 'zustand';

import { getSingleProposal } from '../api/proposal';
import { Activity } from '../models/activity';
import { FirestoreActivity } from '../models/firestore models/activity_firestore';
import { FirestorePhase } from '../models/firestore models/phase_firestore';
import { Phase } from '../models/phase';
import { Proposal } from '../models/proposal';
import { ProposalPreferences } from '../models/proposal_preferences';
import { Wbs } from '../models/wbs';
import {
  copyActivitiesFromPhaseToPhaseInFirestore,
  deleteActivityBatchInFirestore,
  deletePhasesInFirestore,
  duplicatePhasesAndActivitiesInFirestore,
  fetchProposalData,
  fetchProposalPreferencesFromFirestore,
  insertActivityBatchToFirestore,
  insertPhaseToFirestore,
  resetConstantsBatchInFirestore,
  updateActivitiesBatchInFirestore,
  updateActivityFieldInFirestore,
  updateActivityRatesInFirestore,
  updateEquipmentOwnershipInFirestore,
  updateEquipmentUnitInFirestore,
  updatePhaseFieldInFirestore,
  updateSortOrderBatchInFirestore,
} from '../newAPI/api';
import { debouncedUpdateProposalPreferencesInFirestore } from '../newAPI/debounced';
import {
  calculateTotals,
  calculateWbsTotals,
  getQuantityAndUnit,
  isNumber,
  numberFields,
  processRawActivity,
} from './utils';

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
  setPreferences: (
    proposalId: string,
    preferences: ProposalPreferences,
  ) => void;
  setVisibleWbs: (proposalId: string) => void;
  addPhase: (newPhase: FirestorePhase) => Promise<void>;
  updatePhase: (phaseId: string, field: string, value: any) => Promise<void>;
  deletePhases: (phaseIds: string[]) => Promise<void>;
  duplicatePhases: (phaseIds: string[]) => Promise<void>;
  copyActivitiesFromPhase: (
    fromPhaseId: string,
    toPhaseId: string,
  ) => Promise<void>;
  addActivities: (activities: FirestoreActivity[]) => Promise<void>;
  updateActivity: (
    activityId: string,
    field: string,
    value: any,
  ) => Promise<void>;
  updateEquipmentUnit: (activity: Activity, unit: string) => Promise<void>;
  updateEquipmentOwnership: (
    activity: Activity,
    ownership: string,
  ) => Promise<void>;
  changeActivityOrder: (activityId: string, newRowId: string) => Promise<void>;
  resetConstants: (ids: string[]) => Promise<void>;
  deleteActivities: (ids: string[]) => Promise<void>;
  updateActivityRates: (
    ids: string[],
    baseRate: number,
    sub: number,
  ) => Promise<void>;
  changeActivitySortOrder: (
    activityId: string,
    newIndex: number,
    phaseId: string,
  ) => Promise<void>;
  updateActivitiesBatch: (
    activityUpdates: {
      activityId: string;
      updates: Partial<FirestoreActivity>;
    }[],
  ) => Promise<void>;
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
    const { wbs, phases, activities } = await fetchProposalData(
      proposalId,
      proposal!,
    );

    const wbsLookup = wbs.reduce(
      (acc, wbsItem) => {
        acc[wbsItem.id!] = wbsItem;
        return acc;
      },
      {} as Record<string, Wbs>,
    );

    const updatedPhases = phases.map((phase) => {
      const relatedActivities = activities.filter(
        (act) => act.phaseId === phase.id,
      );
      const wbsId = phase.wbsId!;
      const totals = calculateTotals(relatedActivities);
      return {
        ...phase,
        ...totals,
        craftManHours:
          phase.craftManHours && isNumber(phase.craftManHours)
            ? phase.craftManHours
            : totals.craftManHours,
        welderManHours:
          phase.welderManHours && isNumber(phase.welderManHours)
            ? phase.welderManHours
            : totals.welderManHours,
        quantity:
          phase.customQuantity ??
          getQuantityAndUnit(relatedActivities, wbsLookup[wbsId].wbsDatabaseId!)
            .quantity,
        unit:
          phase.unit ??
          getQuantityAndUnit(relatedActivities, wbsLookup[wbsId].wbsDatabaseId!)
            .unit,
      };
    });

    const updatedWbs = wbs.map((wbsItem) => {
      const relatedActivities = activities.filter(
        (act) => act.wbsId === wbsItem.id,
      );
      const relatedPhases = updatedPhases.filter(
        (phase) => phase.wbsId === wbsItem.id,
      );

      // Check if the Wbs has phases and if all related phases are completed
      const allPhasesCompleted =
        relatedPhases.length > 0 &&
        relatedPhases.every((phase) => phase.completed);

      const totals = calculateWbsTotals(relatedPhases);
      const updatedWbsItem = {
        ...wbsItem,
        ...totals,
        completed: allPhasesCompleted, // Set completed to true if all phases are completed
        quantity:
          wbsItem.customQuantity ??
          getQuantityAndUnit(relatedActivities, wbsItem.wbsDatabaseId!)
            .quantity,
        unit:
          wbsItem.customUnit ??
          getQuantityAndUnit(relatedActivities, wbsItem.wbsDatabaseId!).unit,
      };

      return updatedWbsItem;
    });

    set((state) => ({
      proposal,
      preferences: { ...state.preferences, [proposalId]: preferences },
      wbs: { ...state.wbs, [proposalId]: updatedWbs },
      visibleWbs: {
        ...state.visibleWbs,
        [proposalId]: updatedWbs.filter((wbsItem) =>
          preferences.wbsToDisplay?.includes(wbsItem.name!),
        ),
      },
      phases: { ...state.phases, [proposalId]: updatedPhases },
      activities: { ...state.activities, [proposalId]: activities },
      loading: false,
    }));
  },

  recalculatePhase: (phaseId: string) => {
    const wbs = get().wbs[get().proposal?.id!];
    const wbsLookup = wbs.reduce(
      (acc, wbsItem) => {
        acc[wbsItem.id!] = wbsItem;
        return acc;
      },
      {} as Record<string, Wbs>,
    );
    set((state) => {
      const existingPhases = state.phases[state.proposal?.id!] || [];
      const existingActivities = state.activities[state.proposal?.id!] || [];

      // Find the phase to recalculate totals
      const phaseIndex = existingPhases.findIndex(
        (phase) => phase.id === phaseId,
      );
      if (phaseIndex === -1) return state; // Exit if phase not found

      const phaseActivities = existingActivities.filter(
        (activity) => activity.phaseId === phaseId,
      );
      const totals = calculateTotals(phaseActivities);
      const { wbsId } = existingPhases[phaseIndex];
      const { quantity } = getQuantityAndUnit(
        phaseActivities,
        wbsLookup[wbsId!].wbsDatabaseId!,
      );
      console.log('QUANTITY', quantity);

      const updatedPhase = {
        ...existingPhases[phaseIndex],
        ...totals,
        quantity:
          existingPhases[phaseIndex].customQuantity ??
          getQuantityAndUnit(phaseActivities, wbsLookup[wbsId!].wbsDatabaseId!)
            .quantity,
        unit:
          existingPhases[phaseIndex].customUnit ??
          getQuantityAndUnit(phaseActivities, wbsLookup[wbsId!].wbsDatabaseId!)
            .unit,
      };

      // Create a new array of phases with the updated phase
      const updatedPhases = [
        ...existingPhases.slice(0, phaseIndex),
        updatedPhase,
        ...existingPhases.slice(phaseIndex + 1),
      ];

      return {
        ...state,
        phases: {
          ...state.phases,
          [state.proposal?.id!]: updatedPhases,
        },
      };
    });
  },

  setPreferences: (proposalId: string, preferences: ProposalPreferences) => {
    set((state) => ({
      preferences: { ...state.preferences, [proposalId]: preferences },
    }));
    debouncedUpdateProposalPreferencesInFirestore(preferences);
    get().setVisibleWbs(proposalId);
  },

  setVisibleWbs: (proposalId: string) => {
    const { wbs, preferences } = get();
    set({
      visibleWbs: {
        ...get().visibleWbs,
        [proposalId]: wbs[proposalId].filter((wbsItem) =>
          preferences[proposalId].wbsToDisplay?.includes(wbsItem.name!),
        ),
      },
    });
  },
  addPhase: async (newPhase: FirestorePhase) => {
    const ref = await insertPhaseToFirestore(newPhase);
    const emptyTotals = calculateTotals([]);
    const phase = {
      ...newPhase,
      id: ref.id,
      ...emptyTotals,
    } as Phase;
    set((state) => {
      const existingPhases = state.phases[state.proposal?.id!] || [];
      return {
        ...state,
        phases: {
          ...state.phases,
          [state.proposal!.id!]: [...existingPhases, { ...phase }],
        },
      };
    });
  },
  updatePhase: async (phaseId: string, field: string, value: any) => {
    await updatePhaseFieldInFirestore(phaseId, field, value);
    set((state) => {
      const updatedPhases = { ...state.phases };
      Object.keys(updatedPhases).forEach((proposalId) => {
        const phases = updatedPhases[proposalId];
        const index = phases.findIndex((phase) => phase.id === phaseId);
        if (index !== -1) {
          const updatedPhase = { ...phases[index], [field]: value };
          updatedPhases[proposalId] = [
            ...phases.slice(0, index),
            updatedPhase,
            ...phases.slice(index + 1),
          ];
        }
      });
      return { ...state, phases: updatedPhases };
    });
  },
  deletePhases: async (phaseIds: string[]) => {
    await deletePhasesInFirestore(phaseIds);
    set((state) => {
      const updatedPhases = { ...state.phases };
      const updatedActivities = { ...state.activities };

      // Filter out the deleted phases
      Object.keys(updatedPhases).forEach((proposalId) => {
        updatedPhases[proposalId] = updatedPhases[proposalId].filter(
          (phase) => !phaseIds.includes(phase.id!),
        );
      });

      // Filter out activities related to the deleted phases
      Object.keys(updatedActivities).forEach((proposalId) => {
        updatedActivities[proposalId] = updatedActivities[proposalId].filter(
          (activity) => !phaseIds.includes(activity.phaseId),
        );
      });

      return {
        ...state,
        phases: updatedPhases,
        activities: updatedActivities,
      };
    });
  },
  duplicatePhases: async (phaseIds: string[]) => {
    const { newPhaseIds, newActivityMappings } =
      await duplicatePhasesAndActivitiesInFirestore(phaseIds);

    set((state) => {
      const proposalId = state.proposal?.id;
      if (!proposalId) return state; // If there's no current proposal, do nothing

      const existingPhases = state.phases[proposalId] || [];
      const existingActivities = state.activities[proposalId] || [];

      // Duplicate phases and create mappings for new phases
      const newPhases: Phase[] = newPhaseIds
        .map((newPhaseId, index) => {
          const oldPhaseId = phaseIds[index]; // Map newPhaseId back to oldPhaseId
          const oldPhase = existingPhases.find(
            (phase) => phase.id === oldPhaseId,
          );
          return oldPhase ? { ...oldPhase, id: newPhaseId } : null;
        })
        .filter(Boolean) as Phase[];

      // Duplicate activities and map them to the new phase IDs
      const newActivities: Activity[] = Object.entries(newActivityMappings)
        .map(([oldActivityId, newActivityId]) => {
          const oldActivity = existingActivities.find(
            (activity) => activity.id === oldActivityId,
          );
          if (oldActivity) {
            const newPhaseId =
              newPhaseIds[phaseIds.indexOf(oldActivity.phaseId)]; // Map old phase ID to new phase ID
            return { ...oldActivity, id: newActivityId, phaseId: newPhaseId };
          }
          return null;
        })
        .filter(Boolean) as Activity[];

      return {
        ...state,
        phases: {
          ...state.phases,
          [proposalId]: [...existingPhases, ...newPhases],
        },
        activities: {
          ...state.activities,
          [proposalId]: [...existingActivities, ...newActivities],
        },
      };
    });
  },

  copyActivitiesFromPhase: async (fromPhaseId: string, toPhaseId: string) => {
    const activityIdMap = await copyActivitiesFromPhaseToPhaseInFirestore(
      fromPhaseId,
      toPhaseId,
    );
    set((state) => {
      const proposalId = state.proposal?.id;
      if (!proposalId) return state; // Ensure there is a proposal ID

      const existingActivities = state.activities[proposalId] || [];
      const newActivities = Object.entries(activityIdMap)
        .map(([oldId, newId]) => {
          const originalActivity = existingActivities.find(
            (act) => act.id === oldId,
          );
          if (originalActivity) {
            // Return a new activity object with the new ID and updated phaseId
            return { ...originalActivity, id: newId, phaseId: toPhaseId };
          }
          return null; // Return null if no original activity is found
        })
        .filter((act) => act != null) as Activity[]; // Filter out nulls to ensure all entries are valid Activity objects

      return {
        ...state,
        activities: {
          ...state.activities,
          [proposalId]: [...existingActivities, ...newActivities], // Merge new activities into the existing array
        },
      };
    });
  },
  addActivities: async (activities: FirestoreActivity[]) => {
    const { proposal } = get();
    if (!proposal) {
      return;
    }
    const newActivities = await insertActivityBatchToFirestore(
      activities,
      proposal,
    );
    set((state) => {
      const existingActivities = state.activities[proposal?.id!] || [];
      return {
        ...state,
        activities: {
          ...state.activities,
          [state.proposal?.id!]: [...existingActivities, ...newActivities],
        },
      };
    });
  },
  updateActivity: async (activityId: string, field: string, value: any) => {
    console.log(activityId, field, value);
    const result = await updateActivityFieldInFirestore(
      activityId,
      field,
      value,
    );
    if (result.success) {
      set((state) => {
        const updatedActivities = { ...state.activities };
        Object.keys(updatedActivities).forEach((proposalId) => {
          const activities = updatedActivities[proposalId];
          const index = activities.findIndex(
            (activity) => activity.id === activityId,
          );
          if (index !== -1) {
            let newValue = value;
            if (numberFields.includes(field)) {
              newValue = parseFloat(value);
            }
            const updatedActivity = {
              ...activities[index],
              [field]: newValue,
            } as FirestoreActivity;
            const processedActivity = processRawActivity(
              activities[index].id!,
              updatedActivity,
              state.proposal!,
            );
            updatedActivities[proposalId] = [
              ...activities.slice(0, index),
              processedActivity,
              ...activities.slice(index + 1),
            ];
          }
        });
        return { ...state, activities: updatedActivities };
      });
    }
  },
  updateEquipmentUnit: async (activity: Activity, unit: string) => {
    const updated = await updateEquipmentUnitInFirestore({ activity, unit });
    set((state) => {
      const existingActivities = state.activities[state.proposal?.id!] || [];
      const index = existingActivities.findIndex((a) => a.id === activity.id);
      if (index !== -1) {
        const updatedActivities = [...existingActivities];
        const temp = {
          ...updatedActivities[index],
          unit: updated.unit,
          price: updated.price!,
        } as FirestoreActivity;
        updatedActivities[index] = processRawActivity(
          activity.id!,
          temp,
          state.proposal!,
        );
        return {
          ...state,
          activities: {
            ...state.activities,
            [state.proposal?.id!]: updatedActivities,
          },
        };
      }
      return state;
    });
  },
  updateEquipmentOwnership: async (activity: Activity, ownership: string) => {
    const updated = await updateEquipmentOwnershipInFirestore({
      activity,
      ownership,
    });
    set((state) => {
      const existingActivities = state.activities[state.proposal?.id!] || [];
      const index = existingActivities.findIndex((a) => a.id === activity.id);
      if (index !== -1) {
        const updatedActivities = [...existingActivities];
        const temp = {
          ...updatedActivities[index],
          equipmentOwnership: updated.equipmentOwnership,
          unit: updated.unit,
          price: updated.price!,
        } as FirestoreActivity;
        updatedActivities[index] = processRawActivity(
          activity.id!,
          temp,
          state.proposal!,
        );
        return {
          ...state,
          activities: {
            ...state.activities,
            [state.proposal?.id!]: updatedActivities,
          },
        };
      }
      return state;
    });
  },
  // TODO: COME BACK TO THIS AND FIX
  changeActivityOrder: async (activityId: string, newRowId: string) => {
    set((state) => {
      const proposalId = state.proposal?.id;
      if (!proposalId) return state; // Return current state if no proposal is loaded

      const activities = state.activities[proposalId] || [];
      const selectedActivityIndex = activities.findIndex(
        (activity) => activity.id === activityId,
      );

      // Early exit if selected activity is not found, returning current state to ensure type safety
      if (selectedActivityIndex === -1) {
        console.error('Selected activity not found');
        return state;
      }

      const filteredActivities = activities.filter(
        (activity) =>
          activity.phaseId === activities[selectedActivityIndex].phaseId,
      );
      const newActivities = [...filteredActivities];

      const targetActivityIndex = newActivities.findIndex(
        (activity) => activity.rowId === newRowId.toUpperCase(),
      );
      const selectedFilteredActivityIndex = newActivities.findIndex(
        (activity) => activity.id === activityId,
      );

      // Exit if target or selected indexes are invalid or no change is needed, returning current state
      if (
        targetActivityIndex === -1 ||
        selectedFilteredActivityIndex === -1 ||
        targetActivityIndex === selectedFilteredActivityIndex
      ) {
        console.error('Invalid operation or no change needed');
        return state;
      }

      const [selectedActivity] = newActivities.splice(
        selectedFilteredActivityIndex,
        1,
      );
      newActivities.splice(targetActivityIndex, 0, selectedActivity);
      console.log(newActivities[selectedFilteredActivityIndex].sortOrder);
      console.log(newActivities[targetActivityIndex].sortOrder);
      // Adjust sortOrder
      if (selectedActivityIndex > targetActivityIndex) {
        activities[targetActivityIndex].sortOrder =
          activities[targetActivityIndex + 1].sortOrder - 1;
      } else {
        activities.splice(targetActivityIndex, 0, selectedActivity);
        activities[targetActivityIndex].sortOrder =
          activities[targetActivityIndex - 1].sortOrder + 1;
      }

      // Update Firestore in the background
      updateSortOrderBatchInFirestore(newActivities);

      // Merge the sorted activities back into the full list
      const updatedActivities = activities.map(
        (activity) =>
          newActivities.find((a) => a.id === activity.id) || activity,
      );

      // Construct and return the new state
      return {
        ...state,
        activities: {
          ...state.activities,
          [proposalId]: updatedActivities,
        },
      };
    });
  },
  resetConstants: async (ids: string[]) => {
    await resetConstantsBatchInFirestore(ids);
    set((state) => {
      const proposalId = state.proposal?.id;
      if (!proposalId) {
        console.error('No proposal loaded');
        return state; // Early exit if no proposal is loaded
      }
      const existingActivities = state.activities[proposalId] || [];
      const updatedActivities = existingActivities.map((activity) => {
        if (ids.includes(activity.id)) {
          // Resetting specified fields for activities that need to be updated
          const temp = {
            ...activity,
            craftConstant: null,
            welderConstant: null,
            unit: null,
          } as FirestoreActivity;
          return processRawActivity(activity.id, temp, state.proposal!);
        }
        return activity;
      });

      return {
        ...state,
        activities: {
          ...state.activities,
          [proposalId]: updatedActivities,
        },
      };
    });
  },

  deleteActivities: async (ids: string[]) => {
    await deleteActivityBatchInFirestore(ids);
    set((state) => {
      const updatedActivities = { ...state.activities };

      Object.keys(updatedActivities).forEach((proposalId) => {
        updatedActivities[proposalId] = updatedActivities[proposalId].filter(
          (activity) => !ids.includes(activity.id),
        );
      });

      return {
        ...state,
        activities: updatedActivities,
      };
    });
  },

  updateActivityRates: async (ids: string[], baseRate: number, sub: number) => {
    await updateActivityRatesInFirestore(ids, baseRate, sub); // Assuming this function exists and updates Firestore correctly
    set((state) => {
      const proposalId = state.proposal?.id;
      if (!proposalId) {
        console.error('No proposal loaded');
        return state; // Early exit if no proposal is loaded
      }

      const existingActivities = state.activities[proposalId] || [];
      const updatedActivities = existingActivities.map((activity) => {
        if (ids.includes(activity.id)) {
          // Update specified fields for activities that need to be updated
          return processRawActivity(
            activity.id,
            {
              ...activity,
              craftBaseRate: baseRate,
              subsistenceRate: sub,
            },
            state.proposal!,
          );
        }
        return activity;
      });
      return {
        ...state,
        activities: {
          ...state.activities,
          [proposalId]: updatedActivities,
        },
      };
    });
  },

  updateActivitiesBatch: async (
    activityUpdates: {
      activityId: string;
      updates: Partial<FirestoreActivity>;
    }[],
  ) => {
    const { proposal } = get();
    if (!proposal) return;

    // Get the processed activities directly from Firestore
    const updatedActivities = await updateActivitiesBatchInFirestore(
      activityUpdates,
      proposal,
    );

    // Update the state with the processed activities
    set((state) => {
      const updatedActivitiesState = { ...state.activities };

      updatedActivities.forEach((updatedActivity) => {
        const proposalId = updatedActivity.proposalId;
        updatedActivitiesState[proposalId] = updatedActivitiesState[
          proposalId
        ].map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity,
        );
      });

      return { ...state, activities: updatedActivitiesState };
    });
  },

  changeActivitySortOrder: async (
    activityId: string,
    newIndex: number,
    phaseId: string,
  ) => {
    set((state) => {
      const proposalId = state.proposal?.id;
      if (!proposalId) return state; // If there's no proposal loaded, we simply return without updating state.

      const activities = state.activities[proposalId] || [];
      const filtered = activities
        .filter((activity) => activity.phaseId === phaseId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const index = filtered.findIndex((a) => a.id === activityId);
      if (index === -1) return state; // If activity is not found, we return without updating state.

      const activity = filtered[index];
      const updatedActivities = [...filtered];
      updatedActivities.splice(index, 1); // Remove the activity from its position
      updatedActivities.splice(newIndex, 0, activity); // Insert it at the new position

      // Recalculate sortOrder only for the moved activity
      const prevSortOrder =
        newIndex > 0 ? updatedActivities[newIndex - 1].sortOrder : 0;
      const nextSortOrder =
        newIndex < updatedActivities.length - 1
          ? updatedActivities[newIndex + 1].sortOrder
          : prevSortOrder + 2; // Ensure there's always a space
      activity.sortOrder =
        prevSortOrder !== nextSortOrder
          ? (prevSortOrder + nextSortOrder) / 2
          : prevSortOrder + 0.01;

      // Optimistically update the local state before updating Firestore
      // Asynchronous Firestore update
      updateSortOrderBatchInFirestore(updatedActivities);

      const merged = activities.map(
        (current) =>
          updatedActivities.find((a) => a.id === current.id) || current,
      );

      // Return new state to update the Zustand store
      return {
        ...state,
        activities: {
          ...state.activities,
          [proposalId]: merged,
        },
      };
    });
  },
}));

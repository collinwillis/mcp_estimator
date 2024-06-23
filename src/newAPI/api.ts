import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { Activity } from '../models/activity';
import { EquipmentOwnership, EquipmentUnit } from '../models/equipment';
import { FirestoreActivity } from '../models/firestore models/activity_firestore';
import { FirestorePhase } from '../models/firestore models/phase_firestore';
import { Phase } from '../models/phase';
import { Proposal } from '../models/proposal';
import { ProposalPreferences } from '../models/proposal_preferences';
import { Wbs } from '../models/wbs';
import { firestore } from '../setup/config/firebase';
import { isNumber, numberFields, processRawActivity } from '../utils/utils';

/**
 * Fetches all WBS for a given proposal.
 */
export async function fetchAllWbsFromFirestore(
  proposalId: string,
): Promise<Wbs[]> {
  const wbsRef = collection(firestore, 'wbs');
  const wbsQuery = query(wbsRef, where('proposalId', '==', proposalId));
  const snapshot = await getDocs(wbsQuery);
  return snapshot.docs.map(
    (document) =>
      ({
        id: document.id, // Include the document ID
        ...document.data(),
      }) as Wbs,
  );
}

/**
 * Fetches all phases for a given proposal.
 */
export async function fetchAllPhasesFromFirestore(
  proposalId: string,
): Promise<Phase[]> {
  const phaseRef = collection(firestore, 'phase');
  const phaseQuery = query(phaseRef, where('proposalId', '==', proposalId));
  const snapshot = await getDocs(phaseQuery);
  return snapshot.docs.map(
    (document) =>
      ({
        ...document.data(),
        id: document.id, // Include the document ID
      }) as Phase,
  );
}

/**
 * Fetches all activities for a given proposal and enriches them with cost calculations.
 */
export async function fetchAllActivitiesFromFirestore(
  proposalId: string,
  proposal: Proposal,
): Promise<Activity[]> {
  const activityRef = collection(firestore, 'activities');
  const activityQuery = query(
    activityRef,
    where('proposalId', '==', proposalId),
  );
  const snapshot = await getDocs(activityQuery);
  return snapshot.docs.map((document) =>
    processRawActivity(
      document.id,
      document.data() as FirestoreActivity,
      proposal,
    ),
  );
}

export async function fetchProposalData(
  proposalId: string,
  proposal: Proposal,
): Promise<{ wbs: Wbs[]; phases: Phase[]; activities: Activity[] }> {
  const [wbs, phases, activities] = await Promise.all([
    fetchAllWbsFromFirestore(proposalId),
    fetchAllPhasesFromFirestore(proposalId),
    fetchAllActivitiesFromFirestore(proposalId, proposal),
  ]);
  return { wbs, phases, activities };
}

export async function fetchProposalPreferencesFromFirestore(
  proposalId: string,
): Promise<ProposalPreferences> {
  const docRef = doc(firestore, 'proposal-preferences', proposalId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return new ProposalPreferences({ id: docSnap.id, ...docSnap.data() });
  }
  return new ProposalPreferences({ id: proposalId, wbsToDisplay: [] });
}

export async function updateProposalPreferencesInFirestore(
  preferences: ProposalPreferences,
) {
  const prefDocRef = doc(firestore, 'proposal-preferences', preferences.id!);
  await setDoc(prefDocRef, preferences, { merge: true });
}

export const insertPhaseToFirestore = async (newPhase: FirestorePhase) => {
  const ref = doc(collection(firestore, 'phase'));
  await setDoc(ref, { ...newPhase });
  return ref;
};

export const updatePhaseFieldInFirestore = async (
  phaseId: string,
  field: string,
  value: any,
) => {
  let newField = field;
  let newValue;
  if (
    isNumber(value) &&
    field !== 'area' &&
    field !== 'quantity' &&
    field !== 'description'
  ) {
    newValue = parseFloat(value);
  } else if (field === 'quantity') {
    newField = 'customQuantity';
    newValue = parseFloat(value);
    if (!isNumber(value)) {
      newValue = null;
    }
  } else {
    newValue = value;
  }

  const data = {
    [newField]: newValue,
  };
  await updateDoc(doc(firestore, 'phase', phaseId), data);
};

export const deletePhasesInFirestore = async (phaseIds: string[]) => {
  const batch = writeBatch(firestore);

  // Delete phases
  phaseIds.forEach((id) => {
    const phaseRef = doc(firestore, 'phase', id);
    batch.delete(phaseRef);
  });

  // Find and delete all activities associated with these phases
  const activitiesRef = collection(firestore, 'activities');
  const activitiesQuery = query(
    activitiesRef,
    where('phaseId', 'in', phaseIds),
  );
  const activitiesSnapshot = await getDocs(activitiesQuery);
  activitiesSnapshot.forEach((document) => {
    batch.delete(document.ref);
  });

  await batch.commit();
};

export interface NewActivityMappings {
  [key: string]: string; // Maps old activity ID to new activity ID
}

export const duplicatePhasesAndActivitiesInFirestore = async (
  phaseIds: string[],
): Promise<{
  newPhaseIds: string[];
  newActivityMappings: NewActivityMappings;
}> => {
  const batch = writeBatch(firestore);
  const newPhaseIds: string[] = [];
  const newActivityMappings: NewActivityMappings = {};

  // Duplicate phases
  await Promise.all(
    phaseIds.map(async (phaseId) => {
      const oldPhaseRef = doc(firestore, 'phase', phaseId);
      const oldPhaseDoc = await getDoc(oldPhaseRef);
      const newPhaseRef = doc(collection(firestore, 'phase'));
      newPhaseIds.push(newPhaseRef.id);

      if (oldPhaseDoc.exists()) {
        const newPhaseData = { ...oldPhaseDoc.data(), createdAt: new Date() };
        batch.set(newPhaseRef, newPhaseData);

        // Fetch and duplicate all activities linked to this phase
        const activitiesRef = collection(firestore, 'activities');
        const activitiesQuery = query(
          activitiesRef,
          where('phaseId', '==', phaseId),
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        activitiesSnapshot.forEach((activityDoc) => {
          const newActivityRef = doc(collection(firestore, 'activities'));
          const newActivityData = {
            ...activityDoc.data(),
            phaseId: newPhaseRef.id,
          };
          batch.set(newActivityRef, newActivityData);
          newActivityMappings[activityDoc.id] = newActivityRef.id;
        });
      }
    }),
  );

  await batch.commit();
  return { newPhaseIds, newActivityMappings };
};

export const copyActivitiesFromPhaseToPhaseInFirestore = async (
  fromPhaseId: string,
  toPhaseId: string,
) => {
  const activitiesRef = collection(firestore, 'activities');
  const fromPhaseQuery = query(
    activitiesRef,
    where('phaseId', '==', fromPhaseId),
  );
  const fromPhaseActivitiesSnapshot = await getDocs(fromPhaseQuery);

  const batch = writeBatch(firestore);
  const activityIdMap: NewActivityMappings = {};

  fromPhaseActivitiesSnapshot.forEach((activityDoc) => {
    const newActivityRef = doc(collection(firestore, 'activities'));
    const newActivityData = {
      ...activityDoc.data(),
      phaseId: toPhaseId,
      createdAt: new Date(),
    };
    batch.set(newActivityRef, newActivityData);
    activityIdMap[activityDoc.id] = newActivityRef.id;
  });
  await batch.commit();
  return activityIdMap;
};

export const insertActivityBatchToFirestore = async (
  activities: FirestoreActivity[],
  proposal: Proposal,
): Promise<Activity[]> => {
  const batch = writeBatch(firestore);
  const newActivities: Activity[] = [];
  activities.forEach((activity) => {
    const ref = doc(collection(firestore, 'activities'));
    batch.set(ref, { ...activity, dateAdded: Date.now() });
    const temp = { ...activity, id: ref.id };
    const processed = processRawActivity(ref.id, temp, proposal);
    newActivities.push(processed);
  });
  await batch.commit();
  return newActivities;
};

export const updateActivityFieldInFirestore = async (
  activityId: string,
  field: string,
  value: any,
) => {
  let newValue: number | string;
  if (numberFields.includes(field)) {
    if (Number.isNaN(parseFloat(value)) || value.trim() === '') {
      return {
        success: false,
        message: 'Invalid input: Expected a numeric value.',
      };
    }
    newValue = parseFloat(value);
  } else {
    newValue = value;
  }

  try {
    await updateDoc(doc(firestore, 'activities', activityId), {
      [field]: newValue,
    });
    return {
      success: true,
      message: `Field '${field}' has been updated to ${newValue}`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while updating the document.',
    };
  }
};

export interface EquipmentUpdateResult {
  unit: string;
  price: number | null;
}

export interface OwnershipUpdateResult extends EquipmentUpdateResult {
  equipmentOwnership: string;
}

export const updateEquipmentUnitInFirestore = async ({
  activity,
  unit,
}: {
  activity: Activity;
  unit: string;
}): Promise<EquipmentUpdateResult> => {
  let newPrice = 0;

  if (unit === EquipmentUnit.hours) {
    newPrice = activity.equipment?.hourRate || 0;
  } else if (unit === EquipmentUnit.days) {
    newPrice = activity.equipment?.dayRate || 0;
  } else if (unit === EquipmentUnit.weeks) {
    newPrice = activity.equipment?.weekRate || 0;
  } else if (unit === EquipmentUnit.months) {
    newPrice = activity.equipment?.monthRate || 0;
  }

  try {
    await updateDoc(doc(firestore, 'activities', activity.id), {
      unit,
      price: newPrice,
    });
    return {
      unit,
      price: newPrice!,
    };
  } catch (error) {
    return {
      unit: activity.unit,
      price: activity.price,
    };
  }
};

export const updateEquipmentOwnershipInFirestore = async ({
  activity,
  ownership,
}: {
  activity: Activity;
  ownership: string;
}): Promise<OwnershipUpdateResult> => {
  try {
    await updateDoc(doc(firestore, 'activities', activity.id), {
      equipmentOwnership: ownership,
    });

    if (
      activity.equipmentOwnership === EquipmentOwnership.purchase &&
      (ownership === EquipmentOwnership.owned ||
        ownership === EquipmentOwnership.rental)
    ) {
      const unitAndPrice = await updateEquipmentUnitInFirestore({
        activity,
        unit: 'Months',
      });
      return {
        ...unitAndPrice,
        equipmentOwnership: ownership,
      };
    }
    if (
      (activity.equipmentOwnership === EquipmentOwnership.owned ||
        activity.equipmentOwnership === EquipmentOwnership.rental) &&
      ownership === EquipmentOwnership.purchase
    ) {
      const unitAndPrice = await updateEquipmentUnitInFirestore({
        activity,
        unit: 'EA',
      });
      return {
        ...unitAndPrice,
        equipmentOwnership: ownership,
      };
    }

    return {
      unit: activity.unit,
      price: activity.price,
      equipmentOwnership: ownership,
    };
  } catch (error) {
    return {
      unit: activity.unit,
      price: activity.price,
      equipmentOwnership: activity.equipmentOwnership!,
    };
  }
};

export const updateSortOrderBatchInFirestore = async (
  activities: Activity[],
) => {
  const batch = writeBatch(firestore);
  activities.forEach((activity) => {
    const ref = doc(firestore, 'activities', activity.id);
    batch.update(ref, { sortOrder: activity.sortOrder });
  });
  await batch.commit();
};

export const resetConstantsBatchInFirestore = async (activityIds: string[]) => {
  const batch = writeBatch(firestore);
  activityIds.forEach((activityId) => {
    batch.update(doc(firestore, 'activities', activityId), {
      craftConstant: null,
      welderConstant: null,
      unit: null,
    });
  });
  await batch.commit();
};

export const deleteActivityBatchInFirestore = async (activityIds: string[]) => {
  const batch = writeBatch(firestore);
  activityIds.forEach((activityId) => {
    batch.delete(doc(firestore, 'activities', activityId));
  });
  await batch.commit();
};

export async function updateActivityRatesInFirestore(
  ids: string[],
  newBaseRate: number,
  newSubsistenceRate: number,
) {
  const batch = writeBatch(firestore);
  ids.forEach((activityId) => {
    if (activityId) {
      batch.update(doc(firestore, 'activities', activityId), {
        craftBaseRate: newBaseRate,
        subsistenceRate: newSubsistenceRate,
      });
    }
  });
  await batch.commit();
}

export async function duplicateProposal(proposalId: string): Promise<string> {
  const batch = writeBatch(firestore);

  // Get the highest proposal number
  const proposalCollection = collection(firestore, 'proposals');
  const allProposalsSnapshot = await getDocs(proposalCollection);
  const highestProposalNumber = Math.max(
    ...allProposalsSnapshot.docs.map((document) =>
      Number(document.data().proposalNumber || 0),
    ),
  );
  const newProposalNumber = highestProposalNumber + 1;

  // Duplicate proposal
  const proposalDocRef = doc(firestore, 'proposals', proposalId);
  const proposalDoc = await getDoc(proposalDocRef);
  const newProposalRef = doc(collection(firestore, 'proposals'));
  const newProposalId = newProposalRef.id;

  if (proposalDoc.exists()) {
    const newProposalData = {
      ...proposalDoc.data(),
      createdAt: new Date(),
      proposalDescription: `${proposalDoc.data().proposalDescription} (Copy)`,
      proposalNumber: newProposalNumber,
    };
    batch.set(newProposalRef, newProposalData);
  }

  // Duplicate proposal preferences
  const preferencesDocRef = doc(firestore, 'proposal-preferences', proposalId);
  const preferencesDoc = await getDoc(preferencesDocRef);

  if (preferencesDoc.exists()) {
    const newPreferencesRef = doc(
      firestore,
      'proposal-preferences',
      newProposalId,
    );
    const newPreferencesData = { ...preferencesDoc.data(), id: newProposalId };
    batch.set(newPreferencesRef, newPreferencesData);
  }

  // Map old WBS IDs to new WBS IDs
  const wbsQuery = query(
    collection(firestore, 'wbs'),
    where('proposalId', '==', proposalId),
  );
  const wbsSnapshot = await getDocs(wbsQuery);
  const wbsIdMap: { [key: string]: string } = {};

  wbsSnapshot.forEach((wbsDoc) => {
    const newWbsRef = doc(collection(firestore, 'wbs'));
    const newWbsId = newWbsRef.id;
    wbsIdMap[wbsDoc.id] = newWbsId;

    const newWbsData = {
      ...wbsDoc.data(),
      proposalId: newProposalId,
      id: newWbsId,
    };
    batch.set(newWbsRef, newWbsData);
  });

  // Map old Phase IDs to new Phase IDs and duplicate phases
  const phaseQuery = query(
    collection(firestore, 'phase'),
    where('proposalId', '==', proposalId),
  );
  const phaseSnapshot = await getDocs(phaseQuery);
  const phaseIdMap: { [key: string]: string } = {};

  await Promise.all(
    phaseSnapshot.docs.map(async (phaseDoc) => {
      const newPhaseRef = doc(collection(firestore, 'phase'));
      const newPhaseId = newPhaseRef.id;
      phaseIdMap[phaseDoc.id] = newPhaseId;

      const newPhaseData = {
        ...phaseDoc.data(),
        proposalId: newProposalId,
        wbsId: wbsIdMap[phaseDoc.data().wbsId],
        id: newPhaseId,
      };
      batch.set(newPhaseRef, newPhaseData);

      // Duplicate activities for each phase
      const activityQuery = query(
        collection(firestore, 'activities'),
        where('phaseId', '==', phaseDoc.id),
      );
      const activitySnapshot = await getDocs(activityQuery);
      activitySnapshot.forEach((activityDoc) => {
        const newActivityRef = doc(collection(firestore, 'activities'));
        const newActivityId = newActivityRef.id;
        const newActivityData = {
          ...activityDoc.data(),
          phaseId: newPhaseId,
          proposalId: newProposalId,
          wbsId: wbsIdMap[activityDoc.data().wbsId],
          id: newActivityId,
        };
        batch.set(newActivityRef, newActivityData);
      });
    }),
  );

  await batch.commit();

  return newProposalId;
}

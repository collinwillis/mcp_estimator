// src/api/fetchAllData.ts
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    writeBatch,
    addDoc
} from "firebase/firestore";
import { firestore } from "../setup/config/firebase";
import {Activity, ActivityType} from "../models/activity";
import {Proposal} from "../models/proposal";
import {isNumber, numberFields, processRawActivity} from "../utils/utils";
import {FirestoreActivity} from "../models/firestore models/activity_firestore";
import {Wbs} from "../models/wbs";
import {Phase} from "../models/phase";
import {ProposalPreferences} from "../models/proposal_preferences";
import {FirestoreProposalPreferences} from "../models/firestore models/proposal_preferences_firestore";
import {FirestorePhase} from "../models/firestore models/phase_firestore";
import {getSingleProposal} from "../api/proposal";
import {EquipmentOwnership, EquipmentUnit} from "../models/equipment";
import {act} from "react-dom/test-utils";


/**
 * Fetches all WBS for a given proposal.
 */
export async function fetchAllWbsFromFirestore(proposalId: string): Promise<Wbs[]> {
    const wbsRef = collection(firestore, "wbs");
    const wbsQuery = query(wbsRef, where("proposalId", "==", proposalId));
    const snapshot = await getDocs(wbsQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,  // Include the document ID
        ...doc.data()
    }) as Wbs);
}

/**
 * Fetches all phases for a given proposal.
 */
export async function fetchAllPhasesFromFirestore(proposalId: string): Promise<Phase[]> {
    const phaseRef = collection(firestore, "phase");
    const phaseQuery = query(phaseRef, where("proposalId", "==", proposalId));
    const snapshot = await getDocs(phaseQuery);
    return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,  // Include the document ID
    }) as Phase);
}

/**
 * Fetches all activities for a given proposal and enriches them with cost calculations.
 */
export async function fetchAllActivitiesFromFirestore(proposalId: string, proposal: Proposal): Promise<Activity[]> {
    const activityRef = collection(firestore, "activities");
    const activityQuery = query(activityRef, where("proposalId", "==", proposalId));
    const snapshot = await getDocs(activityQuery);
    return snapshot.docs.map(doc => processRawActivity(doc.id, doc.data() as FirestoreActivity, proposal));
}

export async function fetchProposalData(proposalId: string, proposal: Proposal): Promise<{ wbs: Wbs[], phases: Phase[], activities: Activity[] }> {
    const [wbs, phases, activities] = await Promise.all([
        fetchAllWbsFromFirestore(proposalId),
        fetchAllPhasesFromFirestore(proposalId),
        fetchAllActivitiesFromFirestore(proposalId, proposal)
    ]);
    console.log("phases", phases);
    return { wbs, phases, activities };
}


export async function fetchProposalPreferencesFromFirestore(proposalId: string): Promise<ProposalPreferences> {
    const docRef = doc(firestore, "proposal-preferences", proposalId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return new ProposalPreferences({id: docSnap.id, ...docSnap.data()});
    } else {
        return new ProposalPreferences({ id: proposalId, wbsToDisplay: [] });
    }
}

export async function updateProposalPreferencesInFirestore(preferences: ProposalPreferences) {
    const prefDocRef = doc(firestore, "proposal-preferences", preferences.id!);
    await setDoc(prefDocRef, preferences, { merge: true });
}


export const insertPhaseToFirestore = async (newPhase: FirestorePhase) => {
    const ref = doc(collection(firestore, "phase"));
    await setDoc(ref, {...newPhase});
    return ref;
};

export const updatePhaseFieldInFirestore = async (phaseId: string, field: string, value: any) => {
    let newField = field;
    let newValue;
    if (isNumber(value) && field != "area" && field != "quantity" && field != "description") {
        newValue = parseFloat(value);
    } else if (field == 'quantity') {
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
    await updateDoc(doc(firestore, "phase", phaseId), data)
        .then((docRef) => {
            console.log("Value of an Existing Document Field has been updated");
        })
        .catch((error) => {
            console.log(error);
        });
};

export const deletePhasesInFirestore = async (phaseIds: string[]) => {
    const batch = writeBatch(firestore);

    // Delete phases
    phaseIds.forEach(id => {
        const phaseRef = doc(firestore, "phase", id);
        batch.delete(phaseRef);
    });

    // Find and delete all activities associated with these phases
    const activitiesRef = collection(firestore, "activities");
    const activitiesQuery = query(activitiesRef, where("phaseId", "in", phaseIds));
    const activitiesSnapshot = await getDocs(activitiesQuery);
    activitiesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("Phases and associated activities successfully deleted");
};

export interface NewActivityMappings {
    [key: string]: string;  // Maps old activity ID to new activity ID
}

export const duplicatePhasesAndActivitiesInFirestore = async (phaseIds: string[]): Promise<{ newPhaseIds: string[], newActivityMappings: NewActivityMappings }> => {
    const batch = writeBatch(firestore);
    const newPhaseIds: string[] = [];
    const newActivityMappings: NewActivityMappings = {};

    // Duplicate phases
    for (const phaseId of phaseIds) {
        const oldPhaseRef = doc(firestore, "phase", phaseId);
        const oldPhaseDoc = await getDoc(oldPhaseRef);
        const newPhaseRef = doc(collection(firestore, "phase"));
        newPhaseIds.push(newPhaseRef.id);

        if (oldPhaseDoc.exists()) {
            const newPhaseData = { ...oldPhaseDoc.data(), createdAt: new Date() };
            batch.set(newPhaseRef, newPhaseData);

            // Fetch and duplicate all activities linked to this phase
            const activitiesRef = collection(firestore, "activities");
            const activitiesQuery = query(activitiesRef, where("phaseId", "==", phaseId));
            const activitiesSnapshot = await getDocs(activitiesQuery);
            activitiesSnapshot.forEach(activityDoc => {
                const newActivityRef = doc(collection(firestore, "activities"));
                const newActivityData = { ...activityDoc.data(), phaseId: newPhaseRef.id };
                batch.set(newActivityRef, newActivityData);
                newActivityMappings[activityDoc.id] = newActivityRef.id;
            });
        }
    }

    await batch.commit();
    return { newPhaseIds, newActivityMappings };
};

export const copyActivitiesFromPhaseToPhaseInFirestore = async (fromPhaseId: string, toPhaseId: string) => {
    const activitiesRef = collection(firestore, "activities");
    const fromPhaseQuery = query(activitiesRef, where("phaseId", "==", fromPhaseId));
    const fromPhaseActivitiesSnapshot = await getDocs(fromPhaseQuery);

    const batch = writeBatch(firestore);
    const activityIdMap: NewActivityMappings = {};

    fromPhaseActivitiesSnapshot.forEach((activityDoc) => {
        const newActivityRef = doc(collection(firestore, "activities"));
        const newActivityData = {
            ...activityDoc.data(),
            phaseId: toPhaseId,
            createdAt: new Date()
        };
        batch.set(newActivityRef, newActivityData);
        activityIdMap[activityDoc.id] = newActivityRef.id;
    });
    await batch.commit();
    return activityIdMap;
};


// Function to add multiple activities in a single batch operation

export const insertActivityBatchToFirestore = async (
    activities: FirestoreActivity[],
    proposal: Proposal
): Promise<Activity[]> => {
    const batch = writeBatch(firestore);
    const newActivities: Activity[] = [];
    activities.forEach(activity => {
        const ref = doc(collection(firestore, "activities"));
        batch.set(ref, { ...activity, dateAdded: Date.now() });
        let temp = ({ ...activity, id: ref.id });
        let processed = processRawActivity(ref.id, temp, proposal);
        newActivities.push(processed);
    });
    await batch.commit();
    return newActivities;
};

export const updateActivityFieldInFirestore = async (activityId: string, field: string, value: any) => {
    let newValue: number | string;
    if (numberFields.includes(field)) {
        if (isNaN(parseFloat(value)) || value.trim() === "") {
            return {
                success: false,
                message: "Invalid input: Expected a numeric value.",
            };
        } else {
            newValue = parseFloat(value);
        }
    } else {
        newValue = value;
    }
    console.log(newValue);

    try {
        await updateDoc(doc(firestore, "activities", activityId), { [field]: newValue });
        return {
            success: true,
            message: `Field '${field}' has been updated to ${newValue}`,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "An error occurred while updating the document.",
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
    const newPrice = unit === EquipmentUnit.hours
        ? activity.equipment?.hourRate
        : unit === EquipmentUnit.days
            ? activity.equipment?.dayRate
            : unit === EquipmentUnit.weeks
                ? activity.equipment?.weekRate
                : unit === EquipmentUnit.months
                    ? activity.equipment?.monthRate
                    : 0;

    try {
        await updateDoc(doc(firestore, "activities", activity.id), {
            unit: unit,
            price: newPrice
        });
        return {
            unit: unit,
            price: newPrice!
        };
    } catch (error) {
        console.error("Failed to update equipment unit:", error);
        return {
            unit: activity.unit,
            price: activity.price
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
        await updateDoc(doc(firestore, "activities", activity.id), {
            equipmentOwnership: ownership,
        });

        if (activity.equipmentOwnership === EquipmentOwnership.purchase &&
            (ownership === EquipmentOwnership.owned || ownership === EquipmentOwnership.rental)) {
            const unitAndPrice = await updateEquipmentUnitInFirestore({ activity, unit: "Months" });
            return {
                ...unitAndPrice,
                equipmentOwnership: ownership,
            };
        } else if ((activity.equipmentOwnership === EquipmentOwnership.owned || activity.equipmentOwnership === EquipmentOwnership.rental) &&
            ownership === EquipmentOwnership.purchase) {
            const unitAndPrice = await updateEquipmentUnitInFirestore({ activity, unit: "EA" });
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
        console.error("Failed to update equipment ownership:", error);
        return {
            unit: activity.unit,
            price: activity.price,
            equipmentOwnership: activity.equipmentOwnership!
        };
    }
};

export const updateSortOrderBatchInFirestore = async (activities: Activity[]) => {
    const batch = writeBatch(firestore);
    activities.forEach(activity => {
        const ref = doc(firestore, "activities", activity.id);
        batch.update(ref, { sortOrder: activity.sortOrder });
    });
    await batch.commit();
};

export const resetConstantsBatchInFirestore = async (activityIds: string[]) => {
    const batch = writeBatch(firestore);
    activityIds.forEach((activityId) => {
        batch.update(doc(firestore, "activities", activityId), {
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
        batch.delete(doc(firestore, "activities", activityId));
    });
    await batch.commit();
};

export async function updateActivityRatesInFirestore(
    ids: string[],
    newBaseRate: number,
    newSubsistenceRate: number
) {
    const batch = writeBatch(firestore);
    ids.forEach((activity) => {
        if (activity) {
            batch.update(doc(firestore, "activities", activity), {
                craftBaseRate: newBaseRate,
                subsistenceRate: newSubsistenceRate,
            });
        }
    });
    await batch.commit();
}






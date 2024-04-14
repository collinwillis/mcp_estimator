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
import {isNumber, processRawActivity} from "../utils/utils";
import {FirestoreActivity} from "../models/firestore models/activity_firestore";
import {Wbs} from "../models/wbs";
import {Phase} from "../models/phase";
import {ProposalPreferences} from "../models/proposal_preferences";
import {FirestoreProposalPreferences} from "../models/firestore models/proposal_preferences_firestore";
import {FirestorePhase} from "../models/firestore models/phase_firestore";


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


export const insertActivityBatchToFirestore = async (activities: FirestoreActivity[]) => {
    const batch = writeBatch(firestore);
    const currentDate = new Date().getTime();
    activities.forEach((activity, index) => {
        activity.dateAdded = currentDate + index; // Removed toString()
        const ref = doc(collection(firestore, "activities"));
        batch.set(ref, { ...activity });
    });

    await batch.commit();
};

export const insertCustomLaborToFirestore = async (
    proposalId: string,
    wbsId: string,
    phaseId: string
) => {
    const activity = new FirestoreActivity({
        proposalId: proposalId,
        wbsId: wbsId,
        phaseId: phaseId,
        constant: null,
        equipment: null,
        time: 0,
        craftConstant: 0,
        welderConstant: 0,
        activityType: ActivityType.customLaborItem,
        description: "NEW CUSTOM LABOR ITEM",
        quantity: 0,
        price: 0,
        craftBaseRate: null,
        subsistenceRate: null,
        craftCost: null,
        equipmentCost: null,
        materialCost: null,
        equipmentOwnership: null,
        dateAdded: Date.now(),
        sortOrder: null,
    });
    const docRef = await addDoc(collection(firestore, "activities"), {
        ...activity,
    });
};

export const insertCostOnlyToFirestore = async (
    proposalId: string,
    wbsId: string,
    phaseId: string
) => {
    const activity = new FirestoreActivity({
        proposalId: proposalId,
        wbsId: wbsId,
        phaseId: phaseId,
        constant: null,
        equipment: null,
        time: 0,
        craftConstant: 0,
        welderConstant: 0,
        activityType: ActivityType.costOnlyItem,
        description: "NEW COST ONLY ITEM",
        quantity: 0,
        price: 0,
        craftBaseRate: null,
        subsistenceRate: null,
        craftCost: null,
        equipmentCost: null,
        materialCost: null,
        equipmentOwnership: null,
        dateAdded: Date.now(),
        sortOrder: null,
    });
    const docRef = await addDoc(collection(firestore, "activities"), {
        ...activity,
    });
};

export const insertMaterialToFirestore = async (
    proposalId: string,
    wbsId: string,
    phaseId: string
) => {
    const activity = new FirestoreActivity({
        proposalId: proposalId,
        wbsId: wbsId,
        phaseId: phaseId,
        constant: null,
        equipment: null,
        time: 0,
        craftConstant: 0,
        welderConstant: 0,
        activityType: ActivityType.materialItem,
        description: "NEW MATERIAL ITEM",
        quantity: 0,
        price: 0,
        craftBaseRate: null,
        subsistenceRate: null,
        craftCost: null,
        equipmentCost: null,
        materialCost: null,
        equipmentOwnership: null,
        dateAdded: Date.now(),
        sortOrder: null,
    });
    const docRef = await addDoc(collection(firestore, "activities"), {
        ...activity,
    });
};

export const insertSubcontractorToFirestore = async (
    proposalId: string,
    wbsId: string,
    phaseId: string
) => {
    const activity = new FirestoreActivity({
        proposalId: proposalId,
        wbsId: wbsId,
        unit: "HOURS",
        phaseId: phaseId,
        constant: null,
        equipment: null,
        time: 0,
        craftConstant: 0,
        welderConstant: 0,
        activityType: ActivityType.subContractorItem,
        description: "NEW SUBCONTRACTOR",
        quantity: 0,
        price: 0,
        craftBaseRate: null,
        subsistenceRate: null,
        craftCost: 0,
        equipmentCost: 0,
        materialCost: 0,
        equipmentOwnership: null,
        dateAdded: Date.now(),
        sortOrder: null,
    });
    const docRef = await addDoc(collection(firestore, "activities"), {
        ...activity,
    });
};




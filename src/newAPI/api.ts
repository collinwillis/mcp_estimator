// src/api/fetchAllData.ts
import {collection, query, where, getDocs, getDoc, doc, setDoc} from "firebase/firestore";
import { firestore } from "../setup/config/firebase";
import {Activity} from "../models/activity";
import {Proposal} from "../models/proposal";
import {processRawActivity} from "../utils/utils";
import {FirestoreActivity} from "../models/firestore models/activity_firestore";
import {Wbs} from "../models/wbs";
import {Phase} from "../models/phase";
import {ProposalPreferences} from "../models/proposal_preferences";
import {FirestoreProposalPreferences} from "../models/firestore models/proposal_preferences_firestore";


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
        // Handle missing preferences, maybe default or create new
        return new ProposalPreferences({ id: proposalId, wbsToDisplay: [] });
    }
}

export async function updateProposalPreferencesInFirestore(preferences: ProposalPreferences) {
    const prefDocRef = doc(firestore, "proposal-preferences", preferences.id!);
    await setDoc(prefDocRef, preferences, { merge: true });
}


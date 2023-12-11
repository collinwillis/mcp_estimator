import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import {FirestoreActivity} from "../models/firestore models/activity_firestore";
import {FirestorePhase} from "../models/firestore models/phase_firestore";
import {FirestoreProposal} from "../models/firestore models/proposal_firestore";
import {Phase} from "../models/phase";
import {firestore} from "../setup/config/firebase";
import {Activity, ActivityType} from "../models/activity";
import constants from "../data/constants.json";
import {getActivitiesForPhase, getQuantityAndUnit} from "./activity";
import {getSingleWbs} from "./wbs";


export const insertPhase = async (newPhase: FirestorePhase) => {
    await addDoc(collection(firestore, "phase"), {
        ...newPhase,
    });
    console.log("Proposal inserted");
};
export const getSinglePhase = async ({phaseId}: { phaseId: string }) => {
    const phaseRef = doc(firestore, "phase", phaseId);
    const phaseSnapshot = await getDoc(phaseRef);
    if (phaseSnapshot.exists()) {
        const phase = phaseSnapshot.data() as Phase;
        phase.id = phaseSnapshot.id;
        return phase;
    } else {
        console.log("No such document!");
    }
};

export const updateSingleProposal = async ({
                                               proposalId,
                                               proposal,
                                           }: {
    proposalId: string;
    proposal: FirestoreProposal;
}) => {
    const proposalRef = doc(firestore, "proposals", proposalId);
    await setDoc(proposalRef, {
        ...proposal,
    });
    console.log("Proposal updated");
};

export const updatePhase = async (id: string, field: string, value: string) => {
    let newValue;
    if (isNumber(value) == true && field != "area") {
        newValue = parseFloat(value);
    } else {
        newValue = value;
    }

    const data = {
        [field]: newValue,
    };
    await updateDoc(doc(firestore, "phase", id), data)
        .then((docRef) => {
            console.log("Value of an Existing Document Field has been updated");
        })
        .catch((error) => {
            console.log(error);
        });
};

function isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
}

export const deletePhaseBatch = async (phaseIds: string[]) => {
    const batch = writeBatch(firestore);
    phaseIds.forEach((phaseId) => {
        batch.delete(doc(firestore, "phase", phaseId));
    });
    await batch.commit();
};

export const duplicatePhases = async (phaseIds: string[]) => {
    var phasesToDuplicate: Phase[] = [];
    var activitiesToDuplicate: FirestoreActivity[] = [];

    // Loop through the array of phaseIds and get each phase and its activities
    for (const phaseId of phaseIds) {
        // Get the phase document from Firestore
        const phaseDocRef = doc(firestore, "phase", phaseId);
        const phaseDocSnap = await getDoc(phaseDocRef);
        if (phaseDocSnap.exists()) {
            // Convert Firestore document to FirestorePhase object
            const phase = {
                ...phaseDocSnap.data(),
                id: phaseDocRef.id,
            };

            phasesToDuplicate.push(phase);

            // Get all activities for this phase
            const activitiesQuery = query(
                collection(firestore, "activities"),
                where("phaseId", "==", phaseId)
            );

            const activitiesQuerySnapshot = await getDocs(activitiesQuery);

            activitiesQuerySnapshot.forEach((activityDocSnap) => {
                // Convert Firestore document to FirestoreActivity object and add it to the activitiesToDuplicate array
                const activity = activityDocSnap.data() as FirestoreActivity;
                activitiesToDuplicate.push(activity);
            });
        }
    }

    // Duplicate all phases and their activities
    for (const phase of phasesToDuplicate) {
        var firestorePhase = phase as FirestorePhase;
        var newId = guid();

        // Duplicate activities for this phase
        const activitiesForPhase = activitiesToDuplicate.filter(
            (activity) => activity.phaseId == phase.id
        );
        for (const activity of activitiesForPhase) {
            // Update the phaseId to point to the new phase
            activity.phaseId = newId;
            await addDoc(collection(firestore, "activities"), activity);
        }
        const newPhaseRef = await setDoc(
            doc(collection(firestore, "phase"), newId),
            firestorePhase
        );
    }
};

export const copyActivitiesFromPhase = async (fromPhaseId: string, toPhaseId: string) => {
    var activitiesToCopy: FirestoreActivity[] = [];

    // Get all activities for the fromPhase
    const activitiesQuery = query(
        collection(firestore, "activities"),
        where("phaseId", "==", fromPhaseId)
    );
    let toPhase = await getSinglePhase({phaseId: toPhaseId});
    let fromPhase = await getSinglePhase({phaseId: fromPhaseId});
    const activitiesQuerySnapshot = await getDocs(activitiesQuery);
    activitiesQuerySnapshot.forEach((activityDocSnap) => {
        // Convert Firestore document to FirestoreActivity object
        const activity = activityDocSnap.data() as FirestoreActivity;
        if (activity.activityType == ActivityType.laborItem && toPhase?.phaseDatabaseId != fromPhase?.phaseDatabaseId) {
            constants.forEach((constant) => {
                if (constant.description == activity.constant?.description && constant.phaseDatabaseId == toPhase?.phaseDatabaseId) {
                    activity.constant = constant;
                    activity.craftConstant = constant.craftConstant;
                    activity.welderConstant = constant.weldConstant;
                    activity.unit = constant.craftUnits;

                    activitiesToCopy.push(activity);
                }

            });
        } else {
            activitiesToCopy.push(activity);
        }
    });
    // Copy all activities to the toPhase
    for (const activity of activitiesToCopy) {
        // Update the phaseId to point to the toPhase
        activity.phaseId = toPhaseId;
        await addDoc(collection(firestore, "activities"), activity);
    }
};

//generates random id;
const guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return (
        s4() +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        s4() +
        s4()
    );
};

interface Costs {
    costOnlyCost: number;
    subCost: number;
    materialCost: number;
    equipmentCost: number;
    craftCost: number;
    welderCost: number;
    cmh: number; // craftManHours
    wmh: number; // welderManHours
    craftManHours: number; // craftManHours
    welderManHours: number; // welderManHours
    totalCost: number;
}

export async function getPhasesForWbs(currentWbsId: string, currentProposalId: string): Promise<Phase[]> {
    const phaseRef = collection(firestore, "phase");
    const phaseQuery = query(phaseRef, where("wbsId", "==", currentWbsId));

    const querySnapshot = await getDocs(phaseQuery);
    const currentWbs = await getSingleWbs({wbsId: currentWbsId});
    const phases = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id} as Phase));

    const updatedPhases = await Promise.all(
        phases.map(async (phase) => {
            const activities = await getActivitiesForPhase({
                phaseId: phase.id!,
                proposalId: currentProposalId,
            });

            const initialCosts = {
                costOnlyCost: 0,
                subCost: 0,
                materialCost: 0,
                equipmentCost: 0,
                craftCost: 0,
                welderCost: 0,
                craftManHours: 0,
                welderManHours: 0,
                cmh: 0,
                wmh: 0,
                totalCost: 0,
            };

            const costs = activities.reduce((accum: Costs, activity: Activity) => {
                accum.costOnlyCost += activity.costOnlyCost ?? 0;
                accum.subCost += activity.subContractorCost ?? 0;
                accum.materialCost += activity.materialCost ?? 0;
                accum.equipmentCost += activity.equipmentCost ?? 0;
                accum.craftCost += activity.craftCost ?? 0;
                accum.welderCost += activity.welderCost ?? 0;
                accum.cmh += activity.craftManHours ?? 0;
                accum.wmh += activity.welderManHours ?? 0;
                accum.cmh += activity.craftManHours ?? 0;
                accum.wmh += activity.welderManHours ?? 0;
                accum.craftManHours += activity.craftManHours ?? 0;
                accum.welderManHours += activity.welderManHours ?? 0;
                accum.totalCost += activity.totalCost ?? 0;

                return accum;
            }, initialCosts);

            phase.quantity = phase.quantity ?? getQuantityAndUnit(activities, currentWbs?.wbsDatabaseId!).quantity;
            phase.unit = phase.unit ?? getQuantityAndUnit(activities, currentWbs?.wbsDatabaseId!).unit;

            return {
                ...phase,
                ...costs,
            };
        })
    );

    return updatedPhases.sort((a, b) => (a.phaseNumber ?? 0) - (b.phaseNumber ?? 0));
}


import {collection, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../setup/config/firebase";
import {getSingleProposal} from "../api/proposal";
import {FirestoreActivity} from "../models/firestore models/activity_firestore";
import {Activity} from "../models/activity";
import {processRawActivity} from "../utils/utils";

async function getPhasesForProposal({ phaseId, proposalId }: { phaseId: string; proposalId: string; }): Promise<Activity[]> {
    const activitiesRef = collection(firestore, "activities");
    const q = query(activitiesRef, where("phaseId", "==", phaseId));
    const querySnapshot = await getDocs(q);
    const proposal = await getSingleProposal({ proposalId });

    return querySnapshot.docs.map(doc =>
        processRawActivity(doc.id, doc.data() as FirestoreActivity, proposal!)
    );
}

async function getActivitiesForPhase({ phaseId, proposalId }: { phaseId: string; proposalId: string; }): Promise<Activity[]> {
    const activitiesRef = collection(firestore, "activities");
    const q = query(activitiesRef, where("phaseId", "==", phaseId));
    const querySnapshot = await getDocs(q);
    const proposal = await getSingleProposal({ proposalId });

    return querySnapshot.docs.map(doc =>
        processRawActivity(doc.id, doc.data() as FirestoreActivity, proposal!)
    );
}


function calculatePhaseTotals(activities: Activity[]): { [key: string]: number } {
    return activities.reduce((totals, activity) => ({
        costOnlyCost: totals.costOnlyCost + (activity.costOnlyCost || 0),
        subContractorCost: totals.subContractorCost + (activity.subContractorCost || 0),
        materialCost: totals.materialCost + (activity.materialCost || 0),
        equipmentCost: totals.equipmentCost + (activity.equipmentCost || 0),
        craftCost: totals.craftCost + (activity.craftCost || 0),
        welderCost: totals.welderCost + (activity.welderCost || 0),
        craftManHours: totals.craftManHours + (activity.craftManHours || 0),
        welderManHours: totals.welderManHours + (activity.welderManHours || 0),
        totalCost: totals.totalCost + (activity.totalCost || 0)
    }), {
        costOnlyCost: 0,
        subContractorCost: 0,
        materialCost: 0,
        equipmentCost: 0,
        craftCost: 0,
        welderCost: 0,
        craftManHours: 0,
        welderManHours: 0,
        totalCost: 0
    });
}

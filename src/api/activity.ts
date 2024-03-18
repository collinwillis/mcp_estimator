import {addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where, writeBatch,} from "firebase/firestore";
import agPiping from "../data/agPiping.json";
import rawPhases from "../data/phases.json";
import {Activity, ActivityType} from "../models/activity";
import {EquipmentOwnership, EquipmentUnit} from "../models/equipment";
import {FirestoreActivity} from "../models/firestore models/activity_firestore";
import {FirestorePhase} from "../models/firestore models/phase_firestore";
import {Proposal} from "../models/proposal";
import {firestore} from "../setup/config/firebase";
import {getSingleProposal} from "./proposal";
import {
    getCostOnlyCost,
    getCraftLoadedRate,
    getEquipmentCost,
    getMaterialCost,
    getSubcontractorCost,
    getTotalCost,
    getWelderLoadedRate,
} from "./totals";
// Make sure to import firestore methods properly

export const insertActivityBatch = async (activities: FirestoreActivity[]) => {
    const batch = writeBatch(firestore);
    const currentDate = new Date().getTime();  // Getting current time in milliseconds
    activities.forEach((activity, index) => {
        // Ensuring unique millisecond timestamp by adding the index
        activity.dateAdded = currentDate + index;  // Removed toString()
        const ref = doc(collection(firestore, "activities"));
        batch.set(ref, {...activity});
    });

    await batch.commit();
};


// List of fields that should contain numbers
const numberFields = [
    "quantity",
    "craftConstant",
    "welderConstant",
    "craftManHours",
    "welderManHours",
    "craftCost",
    "welderCost",
    "totalCost",
    "craftBaseRate",
    "subsistenceRate",
    "equipmentCost",
    "materialCost",
    "costOnlyCost",
    "price",
    "time",
    "subContractorCost",
];

export const updateActivity = async (
    id: string,
    field: string,
    value: string
): Promise<{ success: boolean; message: string }> => {
    let newValue: number | string;

    // Check if the field is a number field
    if (numberFields.includes(field)) {
        if (isNaN(parseFloat(value)) || value.trim() === '') {
            // Notify the user for non-numeric input
            return {
                success: false,
                message: "Invalid input: Expected a numeric value."
            };
        } else {
            // If value is a valid number, parse it
            newValue = parseFloat(value);
        }
    } else {
        // For non-number fields, use the value as is
        newValue = value;
    }

    try {
        await updateDoc(doc(firestore, "activities", id), {[field]: newValue});
        return {
            success: true,
            message: `Field '${field}' has been updated to ${newValue}`
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "An error occurred while updating the document."
        };
    }
};

export const updateActivitiesBatch = async (activities: Activity[]) => {
    const batch = writeBatch(firestore);

    activities.forEach(activity => {
        const activityRef = doc(firestore, "activities", activity.id);
        batch.update(activityRef, {
            sortOrder: activity.sortOrder,
        });
    });

    await batch.commit();
};

export const getSingleActivity = async ({
                                            activityId,
                                        }: {
    activityId: string;
}) => {
    const ref = doc(firestore, "activities", activityId);
    const activitySnapshot = await getDoc(ref);
    if (activitySnapshot.exists()) {
        const activity = activitySnapshot.data() as Activity;
        activity.id = activitySnapshot.id;
        return activity;
    } else {
        console.log("No such document!");
    }
};

export const updateEquipmentUnit = async ({
                                              activity,
                                              unit,
                                          }: {
    activity: Activity;
    unit: string;
}) => {
    await updateDoc(doc(firestore, "activities", activity.id), {
        unit: unit,
        price:
            unit == EquipmentUnit.hours
                ? activity.equipment?.hourRate
                : unit == EquipmentUnit.days
                    ? activity.equipment?.dayRate
                    : unit == EquipmentUnit.weeks
                        ? activity.equipment?.weekRate
                        : unit == EquipmentUnit.months
                            ? activity.equipment?.monthRate
                            : 0,
    })
        .then((docRef) => {
            console.log("Value of an Existing Document Field has been updated");
        })
        .catch((error) => {
            console.log(error);
        });
};

export const updateEquipmentOwnership = async ({
                                                   activity,
                                                   ownership,
                                               }: {
    activity: Activity;
    ownership: string;
}) => {
    await updateDoc(doc(firestore, "activities", activity.id), {
        equipmentOwnership: ownership,
    })
        .then((docRef) => {
            if (activity.equipmentOwnership == EquipmentOwnership.purchase && (ownership == EquipmentOwnership.owned || ownership == EquipmentOwnership.rental)) {
                updateEquipmentUnit({activity: activity, unit: 'Months'});
            } else if ((activity.equipmentOwnership == EquipmentOwnership.owned || activity.equipmentOwnership == EquipmentOwnership.rental) && ownership == EquipmentOwnership.purchase) {
                updateEquipmentUnit({activity: activity, unit: 'EA'});
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

function isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
}

export const changeActivityOrder = async (activityId: string, newRowId: string, activities: Activity[]) => {
    // Find the target activity based on newRowId
    const targetActivityIndex = activities.findIndex(activity => activity.rowId === newRowId);

    if (targetActivityIndex === -1) {
        console.error('Target row ID not found');
        return;
    }

    // Find the selected activity
    const selectedActivityIndex = activities.findIndex(activity => activity.id === activityId);

    if (selectedActivityIndex === -1) {
        console.error('Selected activity not found');
        return;
    }

    if (targetActivityIndex != selectedActivityIndex) {
        const [selectedActivity] = activities.splice(selectedActivityIndex, 1);

        if (selectedActivityIndex > targetActivityIndex) {
            activities.splice(targetActivityIndex, 0, selectedActivity);
            activities[targetActivityIndex].sortOrder = activities[targetActivityIndex + 1].sortOrder - 1;
        } else {
            activities.splice(targetActivityIndex, 0, selectedActivity);
            activities[targetActivityIndex].sortOrder = activities[targetActivityIndex - 1].sortOrder + 1;
        }
        await updateActivitiesBatch(activities);
    }


    // Update the sortOrder of all activities
    // activities.forEach((activity, index) => {
    //     activity.sortOrder = index + 1; // or use a different logic if sortOrder is not sequential
    // });

    // Update activities in Firestore and local state

};


export const addCustomLabor = async (
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
        sortOrder: null
    });
    const docRef = await addDoc(collection(firestore, "activities"), {
        ...activity,
    });
};

export const addCostOnly = async (
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
        sortOrder: null
    });
    const docRef = await addDoc(collection(firestore, "activities"), {
        ...activity,
    });
};

export const addMaterial = async (
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
        sortOrder: null
    });
    const docRef = await addDoc(collection(firestore, "activities"), {
        ...activity,
    });
};

export const addSubcontractor = async (
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
        sortOrder: null
    });
    const docRef = await addDoc(collection(firestore, "activities"), {
        ...activity,
    });
};

export const deleteActivityBatch = async (activityIds: string[]) => {
    const batch = writeBatch(firestore);
    activityIds.forEach((activityId) => {
        batch.delete(doc(firestore, "activities", activityId));
    });
    await batch.commit();
};

export const resetConstantsBatch = async (activityIds: string[]) => {
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

export const getActivitiesForPhase = async ({
                                                phaseId,
                                                proposalId,
                                            }: {
    phaseId: string;
    proposalId: string;
}) => {
    const q = query(
        collection(firestore, "activities"),
        where("phaseId", "==", phaseId)
    );
    var temp: Activity[] = [];
    var proposal = await getSingleProposal({
        proposalId: proposalId,
    });
    const querySnapshot = await getDocs(q);

    const activityPromises = querySnapshot.docs.map((doc) => {
        const rawActivity = doc.data() as FirestoreActivity;
        return proposal
            ? calculateActivityData(doc.id, rawActivity, proposal)
            : null;
    });
    let activities: (Activity | null)[] = [];
    if (activityPromises != null) {
        activities = await Promise.all(activityPromises);
    }
    temp = activities
        .filter((activity): activity is Activity => activity !== null)
        .sort((a: Activity, b: Activity) => {
            return a.sortOrder! - b.sortOrder!;
        });

    return temp;
};

export const getActivitiesForWbs = async ({
                                              wbsId,
                                              proposalId,
                                          }: {
    wbsId: string;
    proposalId: string;
}) => {
    const q = query(
        collection(firestore, "activities"),
        where("wbsId", "==", wbsId)
    );
    var temp: Activity[] = [];
    var proposal = await getSingleProposal({
        proposalId: proposalId,
    });
    const querySnapshot = await getDocs(q);
    const activityPromises = querySnapshot.docs.map((doc) => {
        const rawActivity = doc.data() as FirestoreActivity;
        return proposal
            ? calculateActivityData(doc.id, rawActivity, proposal)
            : null;
    });
    let activities: (Activity | null)[] = [];
    if (activityPromises != null) {
        activities = await Promise.all(activityPromises);
    }
    temp = activities
        .filter((activity): activity is Activity => activity !== null)
        .sort((a: Activity, b: Activity) => {
            return a.sortOrder! - b.sortOrder!;
        });

    return temp;
};

export async function updateActivityRates(
    activities: Activity[],
    newBaseRate: number,
    newSubsistenceRate: number
) {
    const batch = writeBatch(firestore);
    activities.forEach((activity) => {
        if (activity) {
            batch.update(doc(firestore, "activities", activity.id), {
                craftBaseRate: newBaseRate,
                subsistenceRate: newSubsistenceRate,
            });
        }
    });
    await batch.commit();
}

export const calculateActivityData = async (
    docId: string,
    activity: FirestoreActivity,
    proposal: Proposal
) => {
    const rawActivity = activity;
    var craftConstant =
        rawActivity.craftConstant ?? rawActivity.constant?.craftConstant ?? 0;
    var welderConstant =
        rawActivity.welderConstant ?? rawActivity.constant?.weldConstant ?? 0;
    let cmh = (rawActivity.quantity ?? 0) * craftConstant;
    let wmh = (rawActivity.quantity ?? 0) * welderConstant;
    var proposalCraftBase = proposal?.craftBaseRate;
    var proposalSubsistenceRate = proposal?.subsistenceRate;
    var proposalWeldBase = proposal?.weldBaseRate;

    const newActivity = new Activity(
        docId,
        rawActivity.description ?? "",
        rawActivity.proposalId ?? "",
        rawActivity.wbsId ?? "",
        rawActivity.phaseId ?? "",
        rawActivity.constant ?? null,
        rawActivity.equipment ?? null,
        rawActivity.quantity ?? 0,
        rawActivity.sortOrder ?? rawActivity.constant?.sortOrder ?? rawActivity.dateAdded ?? 0,
        rawActivity.activityType ?? ActivityType.laborItem,
        rawActivity.unit ?? rawActivity.constant?.craftUnits ?? "",
        craftConstant,
        welderConstant,
        cmh,
        rawActivity.craftCost ?? 0,
        wmh,
        0,
        rawActivity.price ?? 0,
        rawActivity.time ?? 0,
        rawActivity.materialCost ?? 0,
        rawActivity.equipmentCost ?? 0,
        0,
        0,
        0,
        rawActivity.craftBaseRate ?? proposalCraftBase,
        rawActivity.subsistenceRate ?? proposalSubsistenceRate,
        proposalWeldBase,
        rawActivity.craftBaseRate ?? null,
        rawActivity.subsistenceRate ?? null,
        rawActivity.equipmentOwnership ?? null,
        rawActivity.dateAdded,
        null,
    );

    let craftLoadedRate = getCraftLoadedRate({
        proposal: proposal,
        customCraftBaseRate: newActivity.craftBaseRate!,
        customSubsistenceRate: newActivity.subsistenceRate!,
    });

    let welderLoadedRate = getWelderLoadedRate({
        proposal: proposal,
    });
    if (newActivity.activityType != ActivityType.subContractorItem) {
        newActivity.craftCost = newActivity.craftManHours * craftLoadedRate;
    }
    if (newActivity.activityType == ActivityType.equipmentItem) {
        newActivity.equipmentCost = getEquipmentCost({
            activity: newActivity,
            proposal: proposal,
        });
    }
    if (newActivity.activityType == ActivityType.materialItem) {
        newActivity.materialCost = getMaterialCost({
            activity: newActivity,
            proposal: proposal,
        });
    }
    newActivity.welderCost = newActivity.welderManHours * welderLoadedRate;

    if (newActivity.activityType == ActivityType.costOnlyItem) {
        newActivity.costOnlyCost = getCostOnlyCost({
            activity: newActivity,
        });
    }
    if (newActivity.activityType == ActivityType.subContractorItem) {
        newActivity.subContractorCost = getSubcontractorCost({
            activity: newActivity,
            proposal: proposal,
        });
    }
    if (newActivity.activityType != ActivityType.subContractorItem) {
        newActivity.totalCost = getTotalCost({activity: newActivity});
    } else {
        newActivity.totalCost = newActivity.subContractorCost;
    }
    return newActivity;
};

export function getQuantityAndUnit(activities: Activity[], wbsDatabaseId: number) {
    let quantity = 0;
    let unit = '';

    const keywordMap = new Map<number, string[]>([
        [20000, ["EXCAVATE", "BACKFILL / COMPACT"]],
        [40000, ["CLEAN UP"]],
        [50000, ["CLEAN UP"]],
        [60000, ["CLEAN UP"]],
        [70000, ["HE", "OFF", "HYDRO", "PNEU"]],
        [130000, ["HE", "OFF", "HYDRO", "PNEU"]],
    ]);

    let keywords = keywordMap.get(wbsDatabaseId) || [];

    activities.forEach((activity) => {
        const hasKeyword = keywords.some(keyword => activity.description.toUpperCase().includes(keyword));
        if (hasKeyword) {
            quantity += activity.quantity;
            unit = activity.unit;
        }
    });

    activities.forEach((activity) => {
        if (wbsDatabaseId === 30000) {
            if (activity.constant && [30011, 30012, 30013, 30015].includes(activity.constant.phaseDatabaseId)) {
                unit = "EA";
            } else {
                unit = "CY";
            }
        }
    });

    return {quantity, unit};
}


// export async function insertActivitiesFromFile() {
//   let phasesToAdd: FirestorePhase[] = [];
//   agPiping.forEach((phase) => {
//     var localPhase = rawPhases.find((item) => {
//       return item.phaseDatabaseId == phase.phaseDatabaseId;
//     });
//     var newPhase = new FirestorePhase({
//       description: phase.description,
//       phaseDatabaseId: phase.phaseDatabaseId,
//       phaseDatabaseName: localPhase?.description,
//       phaseNumber: phase.phaseNumber,
//       wbsId: "0Qy1yBkK3wa2fjycSSp5",
//       proposalId: "tms3XRwF8R3SXaqkjbqd",
//       area: phase.area,
//     });
//     phasesToAdd.push(newPhase);
//   });
//   const batch = writeBatch(firestore);

//   phasesToAdd.forEach((phase) => {
//     var ref = doc(collection(firestore, "phase"));
//     batch.set(ref, { ...phase });
//   });

//   await batch.commit();
// }

export async function insertActivitiesFromFile() {
    const phasesToAdd: FirestorePhase[] = [];
    agPiping.forEach((phase) => {
        const localPhase = rawPhases.find((item) => {
            return item.phaseDatabaseId == phase.phaseDatabaseId;
        });
        const newPhase = new FirestorePhase({
            description: phase.description,
            phaseDatabaseId: phase.phaseDatabaseId,
            phaseDatabaseName: localPhase?.description,
            phaseNumber: phase.phaseNumber,
            wbsId: "0Qy1yBkK3wa2fjycSSp5",
            proposalId: "tms3XRwF8R3SXaqkjbqd",
            area: phase.area,
        });
        phasesToAdd.push(newPhase);
    });

    const batchSize = 500;
    const numBatches = Math.ceil(phasesToAdd.length / batchSize);

    for (let i = 0; i < numBatches; i++) {
        const batch = writeBatch(firestore);

        const batchStart = i * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, phasesToAdd.length);
        const batchPhases = phasesToAdd.slice(batchStart, batchEnd);

        batchPhases.forEach((phase) => {
            const docRef = doc(collection(firestore, "phase"));
            batch.set(docRef, {...phase});
        });

        await batch.commit();
    }
}

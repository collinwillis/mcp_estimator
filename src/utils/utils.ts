import {FirestoreActivity} from "../models/firestore models/activity_firestore";
import {Activity, ActivityType} from "../models/activity";
import {Proposal} from "../models/proposal";
import {
    getCostOnlyCost,
    getCraftLoadedRate,
    getEquipmentCost,
    getMaterialCost,
    getSubcontractorCost,
    getTotalCost,
    getWelderLoadedRate
} from './calculations';

// export function processRawActivity(docId: string, firestoreActivity: FirestoreActivity, proposal: Proposal): Activity {
//     let activity = new Activity(
//         docId,
//         firestoreActivity.description ?? "",
//         firestoreActivity.proposalId ?? "",
//         firestoreActivity.wbsId ?? "",
//         firestoreActivity.phaseId ?? "",
//         firestoreActivity.constant ?? null,
//         firestoreActivity.equipment ?? null,
//         firestoreActivity.quantity ?? 0,
//         firestoreActivity.sortOrder ?? firestoreActivity.constant?.sortOrder ?? 2200,
//         firestoreActivity.activityType ?? ActivityType.laborItem,
//         firestoreActivity.unit ?? firestoreActivity.constant?.craftUnits ?? "",
//         firestoreActivity.craftConstant ?? firestoreActivity.constant?.craftConstant ?? 0,
//         firestoreActivity.welderConstant ?? firestoreActivity.constant?.weldConstant ?? 0,
//         (firestoreActivity.quantity ?? 0) * (firestoreActivity.craftConstant ?? 0),
//         firestoreActivity.craftCost ?? 0,  // Craft cost to be calculated
//         (firestoreActivity.quantity ?? 0) * (firestoreActivity.welderConstant ?? 0),
//         0,  // Welder cost to be calculated
//         firestoreActivity.price ?? 0,
//         firestoreActivity.time ?? 0,
//         firestoreActivity.materialCost ?? 0,
//         firestoreActivity.equipmentCost ?? 0,
//         0,  // Subcontractor cost to be calculated
//         0,  // Cost-only cost to be calculated
//         0,  // Total cost to be updated after all calculations
//         firestoreActivity.craftBaseRate ?? proposal?.craftBaseRate ?? 0,
//         firestoreActivity.subsistenceRate ?? proposal?.subsistenceRate ?? 0,
//         proposal?.weldBaseRate ?? 0,
//         firestoreActivity.craftBaseRate ?? null,  // Custom craft rate if applicable
//         firestoreActivity.subsistenceRate ?? null,  // Custom subsistence rate if applicable
//         firestoreActivity?.equipmentOwnership ?? null,
//         firestoreActivity?.dateAdded ?? null,
//         null  // RowId if used
//     );
//
//     // Initialize common properties
//     if (activity.activityType != ActivityType.subContractorItem) {
//         activity.craftCost = activity.craftManHours * getCraftLoadedRate({
//             proposal,
//             customCraftBaseRate: activity.craftBaseRate
//         });
//     }
//     activity.welderCost = activity.welderManHours * getWelderLoadedRate({proposal});
//
//     // Apply specific calculations based on the activity type
//     switch (activity.activityType) {
//         case ActivityType.subContractorItem:
//             activity.subContractorCost = getSubcontractorCost({activity, proposal});
//             activity.totalCost = activity.subContractorCost;
//             break;
//         case ActivityType.equipmentItem:
//             activity.equipmentCost = getEquipmentCost({activity, proposal});
//             activity.totalCost = getTotalCost({activity});
//             break;
//         case ActivityType.materialItem:
//             activity.materialCost = getMaterialCost({activity, proposal});
//             activity.totalCost = getTotalCost({activity});
//             break;
//         case ActivityType.costOnlyItem:
//             activity.costOnlyCost = getCostOnlyCost({activity});
//             activity.totalCost = getTotalCost({activity});
//             break;
//         case ActivityType.laborItem:
//         case ActivityType.customLaborItem:
//             activity.totalCost = getTotalCost({activity});
//             break;
//     }
//
//     return activity;
// }

export function processRawActivity (
    docId: string,
    activity: FirestoreActivity,
    proposal: Proposal
) {
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
        rawActivity.sortOrder ??
        rawActivity.constant?.sortOrder ??
        rawActivity.dateAdded ??
        0,
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
        null
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
        newActivity.totalCost = getTotalCost({ activity: newActivity });
    } else {
        newActivity.totalCost = newActivity.subContractorCost;
    }
    return newActivity;
};



export function numberToLetters(num: number) {
    let letters = '';
    while (num > 0) {
        const modulo = (num - 1) % 26;
        letters = String.fromCharCode(65 + modulo) + letters;
        num = Math.floor((num - modulo) / 26);
    }
    return letters;
}

export function getQuantityAndUnit(
    activities: Activity[],
    wbsDatabaseId: number
) {
    let quantity = 0;
    let unit = "";

    const keywordMap = new Map<number, string[]>([
        [20000, ["EXCAVATE", "BACKFILL / COMPACT"]],
        [40000, ["CLEAN UP"]],
        [50000, ["CLEAN UP"]],
        [60000, ["CLEAN UP"]],
        [70000, ["HE"]],
        [130000, ["HE"]],
        //   [70000, ["HE", "OFF", "HYDRO", "PNEU"]],
        //   [130000, ["HE", "OFF", "HYDRO", "PNEU"]],
    ]);

    let keywords = keywordMap.get(wbsDatabaseId) || [];

    activities.forEach((activity) => {
        const hasKeyword = keywords.some((keyword) =>
            activity.description.toUpperCase().includes(keyword)
        );
        if (hasKeyword) {
            quantity += activity.quantity;
            unit = activity.unit;
        }
    });

    activities.forEach((activity) => {
        if (wbsDatabaseId === 30000) {
            if (
                activity.constant &&
                [30011, 30012, 30013, 30015].includes(activity.constant.phaseDatabaseId)
            ) {
                unit = "EA";
            } else {
                unit = "CY";
            }
        }
    });

    return { quantity, unit };
}


export const calculateTotals = (activities: Activity[]) => {
    return activities.reduce((acc, activity) => ({
        costOnlyCost: acc.costOnlyCost + (activity.costOnlyCost || 0),
        subContractorCost: acc.subContractorCost + (activity.subContractorCost || 0),
        materialCost: activity.activityType == ActivityType.subContractorItem ? acc.materialCost : acc.materialCost + (activity.materialCost || 0),
        equipmentCost: activity.activityType == ActivityType.subContractorItem ? acc.materialCost : acc.equipmentCost + (activity.equipmentCost || 0),
        craftCost: activity.activityType == ActivityType.subContractorItem ? acc.materialCost : acc.craftCost + (activity.craftCost || 0),
        welderCost: acc.welderCost + (activity.welderCost || 0),
        craftManHours: acc.craftManHours + (activity.craftManHours || 0),
        welderManHours: acc.welderManHours + (activity.welderManHours || 0),
        totalCost: acc.totalCost + (activity.totalCost || 0)
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
};

export function isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
}

export function calculateNewSortOrder(activities: Activity[], newIndex: number) {
    const prevSortOrder = newIndex > 0 ? activities[newIndex - 1].sortOrder : (activities[0].sortOrder - 1);
    const nextSortOrder = newIndex < activities.length - 1 ? activities[newIndex + 1].sortOrder : (activities[activities.length - 1].sortOrder + 1);

    if (prevSortOrder !== nextSortOrder) {
        return (prevSortOrder + nextSortOrder) / 2;
    } else {
        // When both have the same sortOrder, nudge by a small increment
        return prevSortOrder + 0.01; // This is arbitrary and may need adjustment based on your data
    }
}


export const numberFields = [
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

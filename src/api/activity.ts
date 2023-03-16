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
import { Activity, ActivityType } from "../models/activity";
import { EquipmentUnit } from "../models/equipment";
import { FirestoreActivity } from "../models/firestore models/activity_firestore";
import { FirestorePhase } from "../models/firestore models/phase_firestore";
import { FirestoreProposal } from "../models/firestore models/proposal_firestore";
import { Phase } from "../models/phase";
import { Proposal } from "../models/proposal";
import { firestore } from "../setup/config/firebase";
import { currencyRound } from "./helpers";
import { getSingleProposal } from "./proposal";
import {
  getCostOnlyCost,
  getCraftLoadedRate,
  getEquipmentCost,
  getMaterialCost,
  getSubcontractorCost,
  getTotalCost,
  getWelderLoadedRate,
} from "./totals";
import { insertAllBaseWbs } from "./wbs";

export const insertActivityBatch = async (activities: FirestoreActivity[]) => {
  const batch = writeBatch(firestore);

  activities.forEach((activity) => {
    var ref = doc(collection(firestore, "activities"));
    batch.set(ref, { ...activity });
  });

  await batch.commit();
};

export const updateActivity = async (
  id: string,
  field: string,
  value: string
) => {
  let newValue;
  if (isNumber(value) == true) {
    newValue = parseFloat(value);
  } else {
    newValue = value;
  }
  console.log(typeof newValue + newValue);
  const data = {
    [field]: newValue,
  };
  await updateDoc(doc(firestore, "activities", id), data)
    .then((docRef) => {
      console.log("Value of an Existing Document Field has been updated");
    })
    .catch((error) => {
      console.log(error);
    });
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

function isNumber(value: string | number): boolean {
  return value != null && value !== "" && !isNaN(Number(value.toString()));
}

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

  const newActivity = new Activity(
    docId,
    rawActivity.description ?? "",
    rawActivity.proposalId ?? "",
    rawActivity.wbsId ?? "",
    rawActivity.phaseId ?? "",
    rawActivity.constant ?? null,
    rawActivity.equipment ?? null,
    rawActivity.quantity ?? 0,
    rawActivity.constant?.sortOrder ?? 0,
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
    rawActivity.subsistenceRate ?? proposalSubsistenceRate
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

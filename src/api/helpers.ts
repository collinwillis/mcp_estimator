import { GridColumnVisibilityModel } from '@mui/x-data-grid-pro';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { Activity, ActivityType } from '../models/activity';
import { firestore } from '../setup/config/firebase';

export const getVisibilityModelPath = (userId: string, phaseId: string) =>
  `visibilityModels/${userId}_${phaseId}`;

const defaultColumns = {
  rowId: true,
  description: true,
  quantity: true,
  unit: true,
  time: false,
  price: false,
  equipmentOwnership: false,
  craftConstant: true,
  welderConstant: true,
  craftManHours: true,
  welderManHours: true,
  welderCost: true,
  craftCost: true,
  craftBaseRate: false,
  subsistenceRate: false,
  equipmentCost: false,
  materialCost: false,
  costOnlyCost: false,
  subContractorCost: false,
  totalCost: true,
};

export const loadColumnVisibilityModel = async (
  userId: string,
  phaseId: string,
  activities: Activity[],
) => {
  const path = getVisibilityModelPath(userId, phaseId);
  const docRef = doc(firestore, path);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }
  let hasEquipmentActivity = false;
  let hasMaterialActivity = false;
  let hasCostOnlyActivity = false;
  let hasCustomLaborActivity = false;
  let hasSubcontractorActivity = false;
  const starter = { ...defaultColumns };
  activities.forEach((activity) => {
    switch (activity.activityType) {
      case ActivityType.equipmentItem:
        hasEquipmentActivity = true;
        break;
      case ActivityType.materialItem:
        hasMaterialActivity = true;
        break;
      case ActivityType.costOnlyItem:
        hasCostOnlyActivity = true;
        break;
      case ActivityType.customLaborItem:
        hasCustomLaborActivity = true;
        break;
      case ActivityType.subContractorItem:
        hasSubcontractorActivity = true;
        break;
      default:
        break;
    }
  });
  if (hasEquipmentActivity) {
    starter.time = true;
    starter.price = true;
    starter.equipmentOwnership = true;
    starter.equipmentCost = true;
  }
  if (hasMaterialActivity) {
    starter.price = true;
    starter.materialCost = true;
  }
  if (hasCostOnlyActivity) {
    starter.price = true;
    starter.costOnlyCost = true;
  }
  // if(hasCustomLaborActivity) {
  //   starter.craftConstant = true;
  //   starter.welderConstant = true;
  //   starter.craftManHours = true;
  //   starter.welderManHours = true;
  //
  //
  // }
  if (hasSubcontractorActivity) {
    starter.time = true;
    starter.equipmentCost = true;
    starter.materialCost = true;
  }
  return starter;
};

export const saveColumnVisibilityModel = async (
  userId: string,
  phaseId: string,
  model: GridColumnVisibilityModel,
) => {
  const path = getVisibilityModelPath(userId, phaseId);
  const docRef = doc(firestore, path);
  await setDoc(docRef, model);
};

export function currencyRound(n: number) {
  return parseFloat((Math.round(n * 10 ** 2) / 10 ** 2).toFixed(2));
}

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { FirestoreWbs } from '../models/firestore models/wbs_firestore';
import { Phase } from '../models/phase';
import { Wbs } from '../models/wbs';
import { firestore } from '../setup/config/firebase';
import { WbsEnum } from '../utils/enums';
import { numberFields, isNumber } from '../utils/utils';
// Import the WBS 2025 data
import wbsData2025 from '../data/wbs.json';

export const insertAllBaseWbs = async (proposalId: string) => {
  // Use the imported JSON data instead of the enum array
  wbsData2025.forEach(async (wbs) => {
    const wbsToInsert = new FirestoreWbs({
      name: wbs.name,
      wbsDatabaseId: wbs.id,
      proposalId,
    });
    await insertBaseWbs(proposalId, wbsToInsert);
    console.log('inserted wbs: ', wbsToInsert);
  });
};

export const insertBaseWbs = async (proposalId: string, wbs: FirestoreWbs) => {
  await addDoc(collection(firestore, 'wbs'), {
    ...wbs,
  });
};

export const getSingleWbs = async ({ wbsId }: { wbsId: string }) => {
  const wbsRef = doc(firestore, 'wbs', wbsId);
  const wbsSnapshot = await getDoc(wbsRef);
  if (wbsSnapshot.exists()) {
    const proposal = wbsSnapshot.data() as Wbs;
    proposal.id = wbsSnapshot.id;
    return proposal;
  }
  console.log('No such document!');
};

export const updateWbs = async (id: string, field: string, value: string) => {
  let newValue;
  if (isNumber(value) == true) {
    newValue = parseFloat(value);
  } else {
    // Transform text fields to uppercase
    const shouldUppercase =
      typeof value === 'string' && !numberFields.includes(field);
    newValue = shouldUppercase ? value.toUpperCase() : value;
  }
  const data = {
    [field]: newValue,
  };
  await updateDoc(doc(firestore, 'wbs', id), data)
    .then((docRef) => {
      console.log('Value of an Existing Document Field has been updated');
    })
    .catch((error) => {
      console.log(error);
    });
};

export function getQuantityAndUnitForWbs(
  phases: Phase[],
  wbsDatabaseId: number,
) {
  let quantity = 0;
  let unit = '';

  const unitMap = new Map<number, string>([
    [20000, 'CY'],
    [30000, 'CY'],
    [40000, 'TON'],
    [50000, 'EA'],
    [60000, 'TON'],
    [70000, 'LF'],
    [130000, 'LF'],
  ]);

  unit = unitMap.get(wbsDatabaseId) || '';

  phases.forEach((phase) => {
    if (phase.unit != '' && phase.unit === unit) {
      quantity += phase.quantity ?? 0;
    }
  });

  return { quantity, unit };
}

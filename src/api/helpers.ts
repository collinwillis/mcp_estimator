import { GridColumnVisibilityModel } from "@mui/x-data-grid-pro";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../setup/config/firebase";

export const getVisibilityModelPath = (userId: string, phaseId: string) =>
  `visibilityModels/${userId}_${phaseId}`;

export const loadColumnVisibilityModel = async (
  userId: string,
  phaseId: string
) => {
  const path = getVisibilityModelPath(userId, phaseId);
  const docRef = doc(firestore, path);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Document doesn't exist, return a default or empty model
    return {};
  }
};

export const saveColumnVisibilityModel = async (
  userId: string,
  phaseId: string,
  model: GridColumnVisibilityModel
) => {
  const path = getVisibilityModelPath(userId, phaseId);
  const docRef = doc(firestore, path);
  await setDoc(docRef, model);
};

export function currencyRound(n: number) {
  return parseFloat(
    (Math.round(n * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2)
  );
}

import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { FirestoreUserPreferences } from "../models/firestore models/user_preferences_firestore";
import { UserPreferences } from "../models/user_preferences";
import { firestore } from "../setup/config/firebase";
import { WbsArray, WbsEnum } from "../utils/enums";

export const insertUserPreferences = async (userId: string) => {
  const tempArray: string[] = [];
  WbsArray.forEach((wbs) => {
    tempArray.push(wbs.name);
  });
  const userPref = new FirestoreUserPreferences({
    wbsToDisplay: tempArray,
  });
  await setDoc(doc(firestore, "user-preferences", userId), {
    ...userPref,
  });
  console.log("Proposal inserted");
};

export const updateUserPreferences = async (
  userPreferences: UserPreferences
) => {
  await setDoc(doc(firestore, "user-preferences", userPreferences.id!), {
    wbsToDisplay: userPreferences.wbsToDisplay!,
  });
  console.log("User Preferences updated");
};

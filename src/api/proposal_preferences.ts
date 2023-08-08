import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { FirestoreProposalPreferences } from "../models/firestore models/proposal_preferences_firestore";
import { ProposalPreferences } from "../models/proposal_preferences";
import { firestore } from "../setup/config/firebase";
import { WbsArray, WbsEnum } from "../utils/enums";

export const insertProposalPreferences = async (proposalId: string) => {
  const tempArray: string[] = [];
  WbsArray.forEach((wbs) => {
    tempArray.push(wbs.name);
  });
  const proposalPref = new FirestoreProposalPreferences({
    wbsToDisplay: tempArray,
  });
  await setDoc(doc(firestore, "proposal-preferences", proposalId), {
    ...proposalPref,
  });
  console.log("Proposal inserted");
};

export const updateProposalPreferences = async (
  proposalPreferences: ProposalPreferences
) => {
  await setDoc(doc(firestore, "proposal-preferences", proposalPreferences.id!), {
    wbsToDisplay: proposalPreferences.wbsToDisplay!,
  });
  console.log("User Preferences updated");
};

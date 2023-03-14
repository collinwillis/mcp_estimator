import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { FirestorePhase } from "../models/firestore models/phase_firestore";
import { FirestoreProposal } from "../models/firestore models/proposal_firestore";
import { Phase } from "../models/phase";
import { Proposal } from "../models/proposal";
import { firestore } from "../setup/config/firebase";
import { insertAllBaseWbs } from "./wbs";

export const insertPhase = async (newPhase: FirestorePhase) => {
  await addDoc(collection(firestore, "phase"), {
    ...newPhase,
  });
  console.log("Proposal inserted");
};
export const getSinglePhase = async ({ phaseId }: { phaseId: string }) => {
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
  if (isNumber(value) == true) {
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

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
import { FirestoreActivity } from "../models/firestore models/activity_firestore";
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
  if (isNumber(value) == true && field != "area") {
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

export const duplicatePhases = async (phaseIds: string[]) => {
  var phasesToDuplicate: Phase[] = [];
  var activitiesToDuplicate: FirestoreActivity[] = [];

  // Loop through the array of phaseIds and get each phase and its activities
  for (const phaseId of phaseIds) {
    // Get the phase document from Firestore
    const phaseDocRef = doc(firestore, "phase", phaseId);
    const phaseDocSnap = await getDoc(phaseDocRef);
    if (phaseDocSnap.exists()) {
      // Convert Firestore document to FirestorePhase object
      const phase = {
        ...phaseDocSnap.data(),
        id: phaseDocRef.id,
      };

      phasesToDuplicate.push(phase);

      // Get all activities for this phase
      const activitiesQuery = query(
        collection(firestore, "activities"),
        where("phaseId", "==", phaseId)
      );

      const activitiesQuerySnapshot = await getDocs(activitiesQuery);

      activitiesQuerySnapshot.forEach((activityDocSnap) => {
        // Convert Firestore document to FirestoreActivity object and add it to the activitiesToDuplicate array
        const activity = activityDocSnap.data() as FirestoreActivity;
        activitiesToDuplicate.push(activity);
      });
    }
  }

  // Duplicate all phases and their activities
  for (const phase of phasesToDuplicate) {
    var firestorePhase = phase as FirestorePhase;
    var newId = guid();

    // Duplicate activities for this phase
    const activitiesForPhase = activitiesToDuplicate.filter(
      (activity) => activity.phaseId == phase.id
    );
    activitiesForPhase.forEach(async (activity) => {
      // Update the phaseId to point to the new phase
      activity.phaseId = newId;
      console.log("ACTIVIITES" + activity.phaseId);
      await addDoc(collection(firestore, "activities"), activity);
    });
    const newPhaseRef = await setDoc(
      doc(collection(firestore, "phase"), newId),
      firestorePhase
    );
  }
};

//generates random id;
const guid = () => {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

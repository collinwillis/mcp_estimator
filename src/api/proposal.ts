import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
import {FirestoreProposal} from "../models/firestore models/proposal_firestore";
import {Proposal} from "../models/proposal";
import {firestore} from "../setup/config/firebase";
import {insertAllBaseWbs} from "./wbs";

export const insertProposal = async (
    proposalDescription: string,
    proposalNumber: string
) => {
    const proposal: FirestoreProposal = new FirestoreProposal({
        proposalDescription: proposalDescription,
        proposalNumber: parseInt(proposalNumber),
    });
    await addDoc(collection(firestore, "proposals"), {
        ...proposal,
    }).then(async (docRef) => {
        await insertAllBaseWbs(docRef.id);
    });
};

export const getSingleProposal = async ({
                                            proposalId,
                                        }: {
    proposalId: string;
}) => {
    const proposalRef = doc(firestore, "proposals", proposalId);
    const proposalSnapshot = await getDoc(proposalRef);
    if (proposalSnapshot.exists()) {
        const proposal = proposalSnapshot.data() as Proposal;
        proposal.id = proposalSnapshot.id;
        return proposal;
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

export const updateProposalField = async ({
                                              proposalId,
                                              field,
                                              value,
                                          }: {
    proposalId: string;
    field: string;
    value: any;
}) => {
    const proposalRef = doc(firestore, "proposals", proposalId);

    await updateDoc(proposalRef, {
        [field]: value,
    });

    console.log("Field updated");
};


export async function deleteProposalAndAssociatedData(proposalId: String) {
    const batch = writeBatch(firestore);

    // Step 1: Delete activities associated with the proposal
    await deleteAssociatedData('activities', proposalId, batch);

    // Step 2: Delete phases associated with the proposal
    await deleteAssociatedData('phases', proposalId, batch);

    // Step 3: Delete wbs associated with the proposal
    await deleteAssociatedData('wbs', proposalId, batch);

    // Step 4: Delete the proposal itself
    const proposalRef = doc(firestore, 'proposals', proposalId.toString());

    try {
        // Step 5: Commit the batched writes
        await deleteDoc(proposalRef);
        await batch.commit();
        console.log('Proposal and associated data deleted successfully.');
    } catch (error) {
        console.error('Error deleting proposal and associated data:', error);
    }
}

async function deleteAssociatedData(collectionName: string, proposalId: unknown, batch: {
    delete: (arg0: DocumentReference) => void;
}) {
    const querySnapshot = await getDocs(query(collection(firestore, collectionName), where('proposalId', '==', proposalId)));
    querySnapshot.forEach((doc) => {
        const docRef = doc.ref;
        batch.delete(docRef);
    });
}

// export async function duplicateProposalAndAssociatedData(proposalId: string) {
//     const batch = writeBatch(firestore);
//
//     try {
//         // Step 1: Duplicate the proposal itself
//         const proposalRef = doc(firestore, 'proposals', proposalId);
//         const proposalSnapshot = await getDoc(proposalRef);
//
//         if (proposalSnapshot.exists()) {
//             const proposalData = proposalSnapshot.data();
//             const newProposalRef = await addDoc(collection(firestore, 'proposals'), proposalData);
//             const newProposalId = newProposalRef.id;
//
//             // Step 2: Duplicate activities associated with the proposal
//             await duplicateAssociatedData('activities', proposalId, newProposalId, batch);
//
//             // Step 3: Duplicate phases associated with the proposal
//             await duplicateAssociatedData('phases', proposalId, newProposalId, batch);
//
//             // Step 4: Duplicate wbs associated with the proposal
//             await duplicateAssociatedData('wbs', proposalId, newProposalId, batch);
//
//             console.log('Proposal and associated data duplicated successfully.');
//         } else {
//             console.error('Proposal not found.');
//         }
//     } catch (error) {
//         console.error('Error duplicating proposal and associated data:', error);
//     }
// }
//
// async function duplicateAssociatedData(
//     collectionName: string,
//     sourceProposalId: string,
//     targetProposalId: string,
//     batch: {
//         set: (arg0: DocumentReference, arg1: any) => void;
//     }
// ) {
//     const querySnapshot = await getDocs(query(collection(firestore, collectionName), where('proposalId', '==', sourceProposalId)));
//
//     querySnapshot.forEach((doc) => {
//         const docData = doc.data();
//         // Change the proposalId in the duplicated data
//         docData.proposalId = targetProposalId;
//
//         // Create a new document with an auto-generated ID
//         const collectionRef = collection(firestore, collectionName);
//         const newDocRef = doc(firestore, 'proposals', "d;lskfa;sldfk"); // This creates a new document with a unique ID
//         batch.set(newDocRef, docData);
//     });
// }


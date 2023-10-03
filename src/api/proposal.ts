import {addDoc, collection, doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
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
    console.log("Proposal inserted");
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
    console.log(proposalId, proposal);
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
    console.log(proposalId, field, value);
    const proposalRef = doc(firestore, "proposals", proposalId);

    await updateDoc(proposalRef, {
        [field]: value,
    });

    console.log("Field updated");
};

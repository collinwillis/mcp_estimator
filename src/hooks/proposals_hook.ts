import {collection, onSnapshot} from "firebase/firestore";
import {useEffect, useState} from "react";
import {Proposal} from "../models/proposal";
import {firestore} from "../setup/config/firebase";

export const useProposals = () => {
    const [data, setData] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const proposalsRef = collection(firestore, "proposals");
        const unsubscribe = onSnapshot(proposalsRef, (querySnapshot) => {
            const temp: Proposal[] = [];
            querySnapshot.docs.forEach((doc) => {
                const proposal = doc.data() as Proposal;
                proposal.id = doc.id;
                temp.push(proposal);
            });
            //set data to temp ordered by proposal number
            setData(
                temp.sort((a, b) => {
                    return b.proposalNumber! - a.proposalNumber!;
                })
            );
            setLoading(false); // set loading to false once the data is retrieved
        });

        return unsubscribe;
    }, []);

    // return both the data and the loading state
    return {data, loading};
};

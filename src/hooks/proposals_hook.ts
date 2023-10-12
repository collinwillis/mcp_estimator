import {collection, onSnapshot} from "firebase/firestore";
import {useEffect, useState} from "react";
import {Proposal} from "../models/proposal";
import {firestore} from "../setup/config/firebase";

export const useProposals = () => {
    const [data, setData] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const proposalsRef = collection(firestore, "proposals");

        // Utilize the onSnapshot function directly without creating a temporary array
        // This makes the code more concise and readable.
        const unsubscribe = onSnapshot(proposalsRef, querySnapshot => {
            const proposals = querySnapshot.docs.map(doc => {
                return {...doc.data(), id: doc.id} as Proposal;
            });
            // Use the sort function inline within the setData call
            setData(proposals.sort((a, b) => (b.proposalNumber ?? 0) - (a.proposalNumber ?? 0)));
            setLoading(false);
        });

        // Clean up function to unsubscribe the onSnapshot when the component unmounts
        return () => {
            unsubscribe();
        };
    }, []);  // Empty dependency array means this useEffect runs once when component mounts

    return {data, loading};
};

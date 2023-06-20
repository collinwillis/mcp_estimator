import { ref as databaseRef, off, onValue } from "firebase/database";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getSingleProposal } from "../api/proposal";
import { Proposal } from "../models/proposal";
import { auth, firestore } from "../setup/config/firebase";

interface CurrentProposalProps {
  proposalId: string;
}

export const useCurrentProposal = ({ proposalId }: CurrentProposalProps) => {
  const [data, setData] = useState<Proposal | undefined>(undefined);

  useEffect(() => {
    if (proposalId) {
      const unsubscribe = onSnapshot(
        doc(firestore, "proposals", proposalId),
        (snapshot) => {
          if (snapshot.exists()) {
            setData(snapshot.data() as Proposal);
          } else {
            setData(undefined);
          }
        }
      );
      return () => unsubscribe();
    }
  }, [proposalId]);

  return data;
};

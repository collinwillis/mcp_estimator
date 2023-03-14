import { ref as databaseRef, off, onValue } from "firebase/database";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getSingleProposal } from "../api/proposal";
import { Proposal } from "../models/proposal";
import { auth, firestore } from "../setup/config/firebase";

interface CurrentProposalProps {
  proposalId: string;
}
export const useCurrentProposal = ({ proposalId }: CurrentProposalProps) => {
  const [data, setData] = useState<Proposal>();
  useEffect(() => {
    if (proposalId != null && proposalId.length > 0) {
      getData();
    } else {
      setData(undefined);
    }
  }, [proposalId]);
  const getData = async () => {
    const proposal = await getSingleProposal({ proposalId });
    setData(proposal);
  };
  return data;
};

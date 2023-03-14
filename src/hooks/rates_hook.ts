import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getCraftLoadedRate, getWelderLoadedRate } from "../api/totals";
import { Phase } from "../models/phase";
import { auth, firestore } from "../setup/config/firebase";
import { useCurrentProposal } from "./current_proposal_hook";

export const useLoadedRates = ({
  currentProposalId,
}: {
  currentProposalId: string;
}) => {
  const [craftLoadedRate, setCraftLoadedRate] = useState<number>(0);
  const [welderLoadedRate, setWelderLoadedRate] = useState<number>(0);
  const currentProposal = useCurrentProposal({ proposalId: currentProposalId });
  useEffect(() => {
    if (currentProposal) {
      let tempCraftLoadedRate = getCraftLoadedRate({
        proposal: currentProposal,
      });

      let tempWelderLoadedRate = getWelderLoadedRate({
        proposal: currentProposal,
      });
      setCraftLoadedRate(tempCraftLoadedRate);
      setWelderLoadedRate(tempWelderLoadedRate);
    }
  }, [currentProposal]);
  return { craftLoadedRate, welderLoadedRate };
};

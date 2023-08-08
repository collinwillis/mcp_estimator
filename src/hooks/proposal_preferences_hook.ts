import { ref as databaseRef, off, onValue } from "firebase/database";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { insertProposalPreferences } from "../api/proposal_preferences";

import { FirestoreProposalPreferences } from "../models/firestore models/proposal_preferences_firestore";
import { Proposal } from "../models/proposal";
import { ProposalPreferences } from "../models/proposal_preferences";
import { auth, firestore } from "../setup/config/firebase";

export const useProposalPreferences = (proposalId: string) => {
  const [data, setData] = useState<ProposalPreferences | undefined>();

  useEffect(() => {
    if (proposalId !== "") { // Add this empty string check
      const proposalPrefRef = doc(firestore, "proposal-preferences", proposalId);

      const unsubscribe = onSnapshot(proposalPrefRef, (doc) => {
        //if the document exists, set the data & if the document doesn't exist, create it
        if (doc.exists()) {
          const proposalPreferences = doc.data() as ProposalPreferences;
          proposalPreferences.id = doc.id;
          setData(proposalPreferences);
        }
        //if the document doesn't exist, create it
        else {
          insertProposalPreferences(proposalId);
        }
      });

      return unsubscribe;
    }
  }, [proposalId]);

  return data;
};


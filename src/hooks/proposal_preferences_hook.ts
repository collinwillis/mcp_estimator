import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

import { insertProposalPreferences } from '../api/proposal_preferences';
import { ProposalPreferences } from '../models/proposal_preferences';
import { firestore } from '../setup/config/firebase';

export const useProposalPreferences = (proposalId: string) => {
  const [data, setData] = useState<ProposalPreferences | undefined>();

  useEffect(() => {
    if (proposalId !== '') {
      // Add this empty string check
      const proposalPrefRef = doc(
        firestore,
        'proposal-preferences',
        proposalId,
      );

      const unsubscribe = onSnapshot(proposalPrefRef, (doc) => {
        // if the document exists, set the data & if the document doesn't exist, create it
        if (doc.exists()) {
          const proposalPreferences = doc.data() as ProposalPreferences;
          proposalPreferences.id = doc.id;
          setData(proposalPreferences);
        }
        // if the document doesn't exist, create it
        else {
          insertProposalPreferences(proposalId);
        }
      });

      return unsubscribe;
    }
  }, [proposalId]);

  return data;
};

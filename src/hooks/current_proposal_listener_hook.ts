import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

import { Proposal } from '../models/proposal';
import { firestore } from '../setup/config/firebase';

interface CurrentProposalProps {
  proposalId: string;
}

export const useCurrentProposalListener = ({
  proposalId,
}: CurrentProposalProps) => {
  const [data, setData] = useState<Proposal | undefined>(undefined);

  useEffect(() => {
    if (proposalId) {
      const unsubscribe = onSnapshot(
        doc(firestore, 'proposals', proposalId),
        (snapshot) => {
          if (snapshot.exists()) {
            setData(snapshot.data() as Proposal);
          } else {
            setData(undefined);
          }
        },
      );
      return () => unsubscribe();
    }
  }, [proposalId]);

  return data;
};

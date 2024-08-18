import { useEffect, useState } from 'react';
import { Phase } from '../models/phase';

import { estimatorStore, StoreState } from '../utils/store'; // Adjust the import path to your store

interface CurrentPhaseProps {
  phaseId: string;
}

export const useCurrentPhase = ({ phaseId }: CurrentPhaseProps) => {
  const [data, setData] = useState<Phase | undefined>(undefined);
  const phases = estimatorStore((state: StoreState) => state.phases);
  const proposal = estimatorStore((state: StoreState) => state.proposal);

  useEffect(() => {
    if (phaseId && phaseId !== '') {
      const phase = phases[proposal?.id || '']?.find((p) => p.id === phaseId);
      if (phase) {
        setData(phase);
      } else {
      }
    } else {
      setData(undefined);
    }
  }, [phaseId, phases, proposal]);

  return data;
};

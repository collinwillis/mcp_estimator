import { useEffect, useState } from 'react';

import { getSinglePhase } from '../api/phase';
import { Phase } from '../models/phase';

interface CurrentPhaseProps {
  phaseId: string;
}
export const useCurrentPhase = ({ phaseId }: CurrentPhaseProps) => {
  const [data, setData] = useState<Phase>();
  useEffect(() => {
    if (phaseId && phaseId != '') {
      getData();
    } else {
      setData(undefined);
    }
  }, [phaseId]);
  const getData = async () => {
    const phase = await getSinglePhase({ phaseId });
    setData(phase);
  };
  return data;
};

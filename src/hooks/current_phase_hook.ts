import { useEffect, useState } from "react";
import { getSinglePhase } from "../api/phase";
import { getSingleWbs } from "../api/wbs";
import { Phase } from "../models/phase";
import { Wbs } from "../models/wbs";

interface CurrentPhaseProps {
  phaseId: string;
}
export const useCurrentPhase = ({ phaseId }: CurrentPhaseProps) => {
  const [data, setData] = useState<Phase>();
  useEffect(() => {
    if (phaseId && phaseId != "") {
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

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getActivitiesForPhase } from "../api/activity";
import { Phase } from "../models/phase";
import { auth, firestore } from "../setup/config/firebase";

export const usePhases = ({
  currentWbsId,
  currentProposalId,
}: {
  currentWbsId: string;
  currentProposalId: string;
}) => {
  const [data, setData] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const phaseRef = collection(firestore, "phase");
    const phaseQuery = query(phaseRef, where("wbsId", "==", currentWbsId));
    const unsubscribe = onSnapshot(phaseQuery, async (querySnapshot) => {
      setIsLoading(true);
      const temp: Phase[] = [];
      querySnapshot.docs.forEach((doc) => {
        const phase = doc.data() as Phase;
        phase.id = doc.id;
        temp.push(phase);
      });
      const promises = temp.map(async (phase) => {
        let costOnlyCost = 0;
        let subCost = 0;
        let materialCost = 0;
        let equipmentCost = 0;
        let craftCost = 0;
        let welderCost = 0;
        let cmh = 0;
        let wmh = 0;
        let totalCost = 0;
        const activities = await getActivitiesForPhase({
          phaseId: phase.id ?? "",
          proposalId: currentProposalId,
        });
        activities.forEach((activity) => {
          costOnlyCost = costOnlyCost + activity.costOnlyCost;
          subCost = subCost + activity.subContractorCost;
          materialCost = materialCost + activity.materialCost;
          equipmentCost = equipmentCost + activity.equipmentCost;
          craftCost = craftCost + activity.craftCost;
          welderCost = welderCost + activity.welderCost;
          cmh = cmh + activity.craftManHours;
          wmh = wmh + activity.welderManHours;
          totalCost = totalCost + activity.totalCost;
        });
        phase.costOnlyCost = costOnlyCost;
        phase.craftCost = craftCost;
        phase.welderCost = welderCost;
        phase.subContractorCost = subCost;
        phase.materialCost = materialCost;
        phase.equipmentCost = equipmentCost;
        phase.craftManHours = cmh;
        phase.welderManHours = wmh;
        phase.totalCost = totalCost;
        return phase;
      });
      const updatedPhases = await Promise.all(promises);
      setData(
        updatedPhases.sort((a, b) => {
          return a.phaseNumber! - b.phaseNumber!;
        })
      );
      setIsLoading(false);
    });
    return unsubscribe;
  }, [currentWbsId]);

  return { data, isLoading };
};

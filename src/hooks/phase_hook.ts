import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { getActivitiesForPhase, getQuantityAndUnit } from '../api/activity';
import { getSingleWbs } from '../api/wbs';
import { Phase } from '../models/phase';
import { firestore } from '../setup/config/firebase';

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
    const phaseRef = collection(firestore, 'phase');
    const phaseQuery = query(phaseRef, where('wbsId', '==', currentWbsId));

    return onSnapshot(phaseQuery, async (querySnapshot) => {
      setIsLoading(true);
      const currentWbs = await getSingleWbs({ wbsId: currentWbsId });
      const phases = querySnapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as Phase,
      );

      const updatedPhases = await Promise.all(
        phases.map(async (phase) => {
          const activities = await getActivitiesForPhase({
            phaseId: phase.id!,
            proposalId: currentProposalId,
          });

          const initialCosts = {
            costOnlyCost: 0,
            subCost: 0,
            materialCost: 0,
            equipmentCost: 0,
            craftCost: 0,
            welderCost: 0,
            cmh: 0,
            wmh: 0,
            totalCost: 0,
          };
          const costs = activities.reduce((accum, activity) => {
            const updatedAccum = { ...accum };
            updatedAccum.costOnlyCost += activity.costOnlyCost ?? 0;
            updatedAccum.subCost += activity.subContractorCost ?? 0;
            updatedAccum.materialCost += activity.materialCost ?? 0;
            updatedAccum.equipmentCost += activity.equipmentCost ?? 0;
            updatedAccum.craftCost += activity.craftCost ?? 0;
            updatedAccum.welderCost += activity.welderCost ?? 0;
            updatedAccum.cmh += activity.craftManHours ?? 0;
            updatedAccum.wmh += activity.welderManHours ?? 0;
            updatedAccum.totalCost += activity.totalCost ?? 0;
            return updatedAccum;
          }, initialCosts);
          const wbsDatabaseId = currentWbs?.wbsDatabaseId ?? 0;
          let quantityResult = getQuantityAndUnit(
            activities,
            wbsDatabaseId,
          ).quantity;

          // Ensure quantityResult is a finite number
          if (!Number.isFinite(quantityResult)) {
            quantityResult = 0;
          }

          const updatedPhase = { ...phase };
          if (phase.customQuantity == null) {
            updatedPhase.quantity = parseFloat(quantityResult.toFixed(2));
          } else {
            updatedPhase.quantity = phase.customQuantity;
          }

          updatedPhase.unit =
            phase.unit ?? getQuantityAndUnit(activities, wbsDatabaseId).unit;
          return {
            ...updatedPhase,
            ...costs,
          };
        }),
      );
      setData(
        updatedPhases.sort(
          (a, b) => (a.phaseNumber ?? 0) - (b.phaseNumber ?? 0),
        ),
      );

      setIsLoading(false);
    });
  }, [currentWbsId, currentProposalId]);

  return { data, isLoading };
};

import {collection, onSnapshot, query, where} from "firebase/firestore";
import {useEffect, useState} from "react";
import {getActivitiesForPhase, getQuantityAndUnit} from "../api/activity";
import {Phase} from "../models/phase";
import {firestore} from "../setup/config/firebase";
import {getSingleWbs} from "../api/wbs";

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


        return onSnapshot(phaseQuery, async (querySnapshot) => {
            setIsLoading(true);
            const currentWbs = await getSingleWbs({wbsId: currentWbsId});
            const phases = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id} as Phase));
            console.log(phases);

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
                        accum.costOnlyCost += activity.costOnlyCost ?? 0;
                        accum.subCost += activity.subContractorCost ?? 0;
                        accum.materialCost += activity.materialCost ?? 0;
                        accum.equipmentCost += activity.equipmentCost ?? 0;
                        accum.craftCost += activity.craftCost ?? 0;
                        accum.welderCost += activity.welderCost ?? 0;
                        accum.cmh += activity.craftManHours ?? 0;
                        accum.wmh += activity.welderManHours ?? 0;
                        accum.totalCost += activity.totalCost ?? 0;

                        return accum;
                    }, initialCosts);
                    const wbsDatabaseId = currentWbs?.wbsDatabaseId ?? 0;
                    let quantityResult = getQuantityAndUnit(activities, wbsDatabaseId).quantity;

                    // Ensure quantityResult is a finite number
                    if (!Number.isFinite(quantityResult)) {
                        quantityResult = 0;
                    }
                    console.log(phase);
                    if (phase.customQuantity == null) {
                        phase.quantity = parseFloat(quantityResult.toFixed(2));
                    } else {
                        phase.quantity = phase.customQuantity;
                    }

                    phase.unit = phase.unit ?? getQuantityAndUnit(activities, wbsDatabaseId).unit;
                    return {
                        ...phase,
                        ...costs,
                    };
                })
            );
            setData(
                updatedPhases.sort((a, b) =>
                    (a.phaseNumber ?? 0) - (b.phaseNumber ?? 0)
                )
            );

            setIsLoading(false);
        });
    }, [currentWbsId, currentProposalId]);

    return {data, isLoading};
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  QuerySnapshot,
  collection,
  doc as firestoreDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { getActivitiesForWbs, getQuantityAndUnit } from '../api/activity';
import { getPhasesForWbs } from '../api/phase';
import { Proposal } from '../models/proposal';
import { Wbs } from '../models/wbs';
import { firestore } from '../setup/config/firebase';
import { useProposalPreferences } from './proposal_preferences_hook';

export const useWbs = ({
  currentProposalId,
}: {
  currentProposalId: string;
}) => {
  const [data, setData] = useState<Wbs[]>([]);
  const [loading, setLoading] = useState(true);
  const proposalPreferences = useProposalPreferences(currentProposalId);
  const [currentProposal, setCurrentProposal] = useState<Proposal>();

  // Memoizing the reference to the proposal in Firestore
  const proposalRef = useMemo(
    () => firestoreDoc(firestore, 'proposals', currentProposalId),
    [currentProposalId],
  );

  // Effect to fetch the current proposal data whenever the proposal ID changes
  useEffect(() => {
    // Subscribing to real-time updates of the proposal data from Firestore
    const unsubscribe = onSnapshot(proposalRef, (snapshot) => {
      setCurrentProposal(snapshot.data() as Proposal); // Updating the local state with fetched data
    });

    // Cleanup: Unsubscribing from the real-time updates when the component is unmounted or the proposal ID changes
    return () => unsubscribe();
  }, [proposalRef]);

  // Memoizing the reference to the WBS collection in Firestore
  const wbsRef = useMemo(() => collection(firestore, 'wbs'), []);

  // Memoizing the query to get WBS data associated with the current proposal ID
  const wbsQuery = useMemo(
    () => query(wbsRef, where('proposalId', '==', currentProposalId)),
    [wbsRef, currentProposalId],
  );

  // Callback to process the fetched WBS data
  const updateData = useCallback(
    async (querySnapshot: QuerySnapshot) => {
      setLoading(true); // Setting the loading state to true during data processing

      // Mapping through the snapshot docs to construct the WBS data array
      const temp: Wbs[] = querySnapshot.docs.map((document) => {
        const wbsData = document.data() as Wbs;
        return { ...wbsData, id: document.id };
      });

      // Filtering WBS data based on user preferences
      const filteredWbs = temp.filter((wbs) =>
        proposalPreferences?.wbsToDisplay?.includes(wbs.name!),
      );

      // Sorting WBS data based on database IDs
      filteredWbs.sort((a, b) => a.wbsDatabaseId! - b.wbsDatabaseId!);

      // Processing each WBS item to accumulate costs and hours from associated activities
      const updatedWbs = await Promise.all(
        filteredWbs.map(async (wbs) => {
          const activities = await getActivitiesForWbs({
            wbsId: wbs.id!,
            proposalId: currentProposalId,
          });
          const phases = await getPhasesForWbs(wbs.id!, currentProposalId);
          // console.log(phases);

          // Creating a new object instead of mutating the function parameter
          const updatedWbs = { ...wbs };

          // Calculating the accumulated costs and hours from activities
          activities.forEach((activity) => {
            updatedWbs.costOnlyCost =
              (updatedWbs.costOnlyCost ?? 0) + (activity.costOnlyCost ?? 0);
            updatedWbs.subContractorCost =
              (updatedWbs.subContractorCost ?? 0) + activity.subContractorCost;
            updatedWbs.materialCost =
              (updatedWbs.materialCost ?? 0) + activity.materialCost;
            updatedWbs.equipmentCost =
              (updatedWbs.equipmentCost ?? 0) + activity.equipmentCost;
            updatedWbs.craftCost =
              (updatedWbs.craftCost ?? 0) + activity.craftCost;
            updatedWbs.welderCost =
              (updatedWbs.welderCost ?? 0) + activity.welderCost;
            updatedWbs.craftManHours =
              (updatedWbs.craftManHours ?? 0) + activity.craftManHours;
            updatedWbs.welderManHours =
              (updatedWbs.welderManHours ?? 0) + activity.welderManHours;
            updatedWbs.totalCost =
              (updatedWbs.totalCost ?? 0) + activity.totalCost;
          });

          const unitMap = new Map<number, string>([
            [20000, 'CY'],
            [40000, 'TON'],
            [50000, 'EA'],
            [60000, 'TON'],
            [70000, 'LF'],
            [130000, 'LF'],
          ]);

          const unit = unitMap.get(updatedWbs.wbsDatabaseId!) || '';
          const phasesWithCustomQuantities = phases.filter(
            (phase) => phase.customQuantity !== null,
          );
          const sumOfCustomQuantities = phasesWithCustomQuantities.reduce(
            (acc, phase) =>
              acc + (phase.unit === unit ? phase.customQuantity || 0 : 0),
            0,
          );
          const filteredActivities = activities.filter(
            (activity) =>
              !phasesWithCustomQuantities
                .map((phase) => phase.id)
                .includes(activity.phaseId),
          );
          const calculatedQuantity = getQuantityAndUnit(
            filteredActivities,
            updatedWbs.wbsDatabaseId!,
          ).quantity;

          updatedWbs.quantity = calculatedQuantity + sumOfCustomQuantities;
          updatedWbs.unit = unit; // Assuming unit handling remains as is
          if (updatedWbs.unit === '') {
            updatedWbs.quantity = undefined;
          }
          return updatedWbs;
        }),
      );

      setData(updatedWbs); // Updating the local state with the processed WBS data
      setLoading(false); // Setting the loading state to false after data processing is complete
    },
    // Dependencies for the useCallback hook to ensure it's updated when any of these values change
    [currentProposalId, proposalPreferences],
  );

  // Effect to fetch and process WBS data whenever the query or current proposal data changes
  useEffect(() => {
    // Subscribing to real-time updates of the WBS data from Firestore
    const unsubscribe = onSnapshot(wbsQuery, updateData);

    // Cleanup: Unsubscribing from the real-time updates when the component is unmounted or the dependencies change
    return () => unsubscribe();
  }, [wbsQuery, updateData, currentProposal]);

  // Returning the processed WBS data and the loading state to the consuming components
  return { data, loading };
};

import {
  DocumentData,
  Query,
  QuerySnapshot,
  Unsubscribe,
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { calculateActivityData } from "../api/activity";
import { getSingleProposal } from "../api/proposal";
import { Activity, ActivityType } from "../models/activity";
import { FirestoreActivity } from "../models/firestore models/activity_firestore";
import { Proposal } from "../models/proposal";
import { firestore } from "../setup/config/firebase";
import { useProposals } from "./proposals_hook";

interface UseActivitiesOptions {
  currentPhaseId?: string;
  currentWbsId?: string;
  currentProposalId: string;
}

const useActivities = ({
  currentPhaseId,
  currentWbsId,
  currentProposalId,
}: UseActivitiesOptions) => {
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentProposal, setCurrentProposal] = useState<Proposal>();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (currentProposalId != null && currentProposalId.length > 0) {
      const proposalRef = doc(firestore, "proposals", currentProposalId);

      unsubscribe = onSnapshot(proposalRef, (snapshot) => {
        const proposal = snapshot.data() as Proposal;
        setCurrentProposal(proposal);
      });
    } else {
      setCurrentProposal(undefined);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentProposalId]);

  const onSnapshotCallback = useCallback(
    async (querySnapshot: QuerySnapshot) => {
      setLoading(true); // Set loading to true when fetching data
      const proposal = await getSingleProposal({
        proposalId: currentProposalId,
      });

      const activityPromises = querySnapshot.docs.map((doc) => {
        const rawActivity = doc.data() as FirestoreActivity;
        return proposal
          ? calculateActivityData(doc.id, rawActivity, proposal)
          : null;
      });
      let activities: (Activity | null)[] = [];
      if (activityPromises != null) {
        activities = await Promise.all(activityPromises);
      }
      const equipmentIndex: number[] = [];
      const equipment: Activity[] = [];
      activities
        .filter((activity): activity is Activity => activity !== null)
        .sort((a: Activity, b: Activity) => {
          return a.sortOrder! - b.sortOrder!;
        });
      activities.forEach((activity, index) => {
        if (activity?.activityType === ActivityType.equipmentItem) {
          equipmentIndex.push(index);
          equipment.push(activity);
        }
      });
      equipment.sort((a, b) => {
        if (a.equipment === null && b.equipment === null) {
          return 0;
        } else if (a.equipment === null) {
          return 1;
        } else if (b.equipment === null) {
          return -1;
        } else {
          return a.equipment.id - b.equipment.id;
        }
      });
      for (let i = equipmentIndex.length - 1; i >= 0; i--) {
        activities.splice(equipmentIndex[i], 1);
      }
      activities
        .filter((activity): activity is Activity => activity !== null)
        .sort((a: Activity, b: Activity) => {
          return a.sortOrder - b.sortOrder;
        });
      const sortedActivities = [...activities, ...equipment];
      setData(
        sortedActivities
          .filter((activity): activity is Activity => activity !== null)
          .sort((a: Activity, b: Activity) => {
            if (
              a.activityType === ActivityType.laborItem &&
              b.activityType === ActivityType.equipmentItem
            ) {
              return -1;
            } else if (
              a.activityType === ActivityType.equipmentItem &&
              b.activityType === ActivityType.laborItem
            ) {
              return 1;
            } else {
              return a.sortOrder - b.sortOrder;
            }
          })
      );
      setLoading(false); // Set loading to false when data is fetched
    },
    [currentProposalId]
  );

  useEffect(() => {
    setLoading(true); // Set loading to true when starting the component
    const activitiesRef = collection(firestore, "activities");
    let proposalQuery = query(
      activitiesRef,
      where("proposalId", "==", currentProposalId)
    );
    let phaseQuery = query(
      activitiesRef,
      where("phaseId", "==", currentPhaseId ?? "")
    );
    let wbsQuery = query(
      activitiesRef,
      where("wbsId", "==", currentWbsId ?? "")
    );
    let activityQuery: Query<DocumentData> = currentPhaseId
      ? phaseQuery
      : currentWbsId
      ? wbsQuery
      : currentProposalId
      ? proposalQuery
      : proposalQuery;

    if (activityQuery != null) {
      const unsubscribe: Unsubscribe = onSnapshot(
        activityQuery,
        onSnapshotCallback
      );
      return () => {
        setLoading(false); // Set loading to false when component is unmounted
        unsubscribe();
      };
    }
  }, [currentPhaseId, currentWbsId, currentProposal, onSnapshotCallback]);

  return { data, loading }; // Return loading state as well
};

export default useActivities;

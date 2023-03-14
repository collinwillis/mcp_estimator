// import {
//   Query,
//   collection,
//   onSnapshot,
//   query,
//   where,
// } from "firebase/firestore";
// import { useCallback, useEffect, useState } from "react";
// import { calculateActivityData } from "../api/activity";
// import { getSingleProposal } from "../api/proposal";
// import {
//   getCostOnlyCost,
//   getCraftLoadedRate,
//   getEquipmentCost,
//   getMaterialCost,
//   getSubcontractorCost,
//   getTotalCost,
//   getWelderLoadedRate,
// } from "../api/totals";
// import { Activity, ActivityType } from "../models/activity";
// import { Constant } from "../models/constant";
// import { FirestoreActivity } from "../models/firestore models/activity_firestore";
// import { auth, firestore } from "../setup/config/firebase";
// export const useActivities = ({
//   currentPhaseId,
//   currentWbsId,
//   currentProposalId,
// }: {
//   currentPhaseId?: string;
//   currentWbsId?: string;
//   currentProposalId: string;
// }) => {
//   const [data, setData] = useState<Activity[]>([]);

//   useEffect(() => {
//     const activitiesRef = collection(firestore, "activities");
//     let proposalQuery = query(
//       activitiesRef,
//       where("proposalId", "==", currentProposalId)
//     );
//     let phaseQuery = query(
//       activitiesRef,
//       where("phaseId", "==", currentPhaseId ?? "")
//     );
//     let wbsQuery = query(
//       activitiesRef,
//       where("wbsId", "==", currentWbsId ?? "")
//     );
//     let activityQuery = currentPhaseId
//       ? phaseQuery
//       : currentWbsId
//       ? wbsQuery
//       : currentProposalId
//       ? proposalQuery
//       : null;
//     if (activityQuery != null) {
//       const unsubscribe = onSnapshot(activityQuery, async (querySnapshot) => {
//         const temp: Activity[] = [];
//         var proposal = await getSingleProposal({
//           proposalId: currentProposalId,
//         });

//         querySnapshot.docs.forEach(async (doc) => {
//           if (proposal) {
//             const rawActivity = doc.data() as FirestoreActivity;
//             const newActivity = await calculateActivityData(
//               doc.id,
//               rawActivity,
//               proposal
//             );
//             temp.push(newActivity);
//           }
//         });

//         setData(
//           temp.sort((a, b) => {
//             return a.sortOrder! - b.sortOrder!;
//           })
//         );
//       });
//       return unsubscribe;
//     }
//   }, [currentPhaseId, currentWbsId, currentProposalId]);
//   return data;
// };

import {
  DocumentData,
  Query,
  QuerySnapshot,
  Unsubscribe,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { calculateActivityData } from "../api/activity";
import { getSingleProposal } from "../api/proposal";
import { Activity } from "../models/activity";
import { FirestoreActivity } from "../models/firestore models/activity_firestore";
import { firestore } from "../setup/config/firebase";

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
      setData(
        activities
          .filter((activity): activity is Activity => activity !== null)
          .sort((a: Activity, b: Activity) => {
            return a.sortOrder! - b.sortOrder!;
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
  }, [currentPhaseId, currentWbsId, currentProposalId, onSnapshotCallback]);

  return { data, loading }; // Return loading state as well
};

export default useActivities;

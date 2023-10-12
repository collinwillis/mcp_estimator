import {collection, doc, onSnapshot, query, QueryConstraint, QuerySnapshot, where,} from 'firebase/firestore';
import {useCallback, useEffect, useState} from 'react';
import {calculateActivityData} from '../api/activity';
import {firestore} from '../setup/config/firebase';
import {Activity} from '../models/activity';
import {Proposal} from '../models/proposal'; // Make sure to import your actual Proposal type

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
    // State for holding activities data
    const [data, setData] = useState<Activity[]>([]);
    // State for tracking loading status
    const [loading, setLoading] = useState<boolean>(true);
    // State for holding the current proposal
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);

    // Callback to handle real-time updates of activities data
    const onSnapshotCallback = useCallback(
        async (querySnapshot: QuerySnapshot) => {
            setLoading(true);

            // Mapping and calculating activity data based on the real-time updates
            const activities = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const rawActivity = doc.data() as Activity;
                    return currentProposal
                        ? await calculateActivityData(doc.id, rawActivity, currentProposal)
                        : null;
                })
            ).then((activities) => activities.filter(Boolean));

            // Separate activities into two arrays based on the presence of 'dateAdded'
            const withDateAdded = activities.filter(a => a && a.dateAdded !== null && a.dateAdded !== undefined);
            const withoutDateAdded = activities.filter(a => a && (a.dateAdded === null || a.dateAdded === undefined));

            // Sort the 'withDateAdded' array by 'dateAdded'
            withDateAdded.sort((a, b) => a!.dateAdded! - b!.dateAdded!);

            // Sort the 'withoutDateAdded' array by 'sortOrder'
            withoutDateAdded.sort((a, b) => a!.sortOrder - b!.sortOrder);

            // Combine the two arrays, placing 'withoutDateAdded' first
            const sortedActivities = [...withoutDateAdded, ...withDateAdded];

            // Process the sorted activities
            sortedActivities.forEach((activity, index) => {
                if (activity) {  // Check if activity is not null or undefined
                    activity.rowId = numberToLetters(index + 1);
                }
            });
            console.log("Sorted Activities: ", sortedActivities);

            // Setting the processed activities data to the state
            setData(sortedActivities as Activity[]);
            setLoading(false);
        },
        [currentProposalId, currentProposal] // Dependencies for the callback
    );

    // Effect to observe changes in the proposal and update the currentProposal state
    useEffect(() => {
        const proposalRef = doc(firestore, 'proposals', currentProposalId);

        // Subscribing to real-time updates of the proposal
        const unsubscribe = onSnapshot(proposalRef, (snapshot) => {
            const proposal = snapshot.data() as Proposal;
            setCurrentProposal(proposal);
        });

        return unsubscribe; // Cleanup - unsubscribe when the component is unmounted or the dependencies change
    }, [currentProposalId]);

    // Effect to fetch and process activities data
    useEffect(() => {
        setLoading(true);
        const activitiesRef = collection(firestore, 'activities');

        const constraints: QueryConstraint[] = [
            where('proposalId', '==', currentProposalId),
            ...(currentPhaseId ? [where('phaseId', '==', currentPhaseId)] : []),
            ...(currentWbsId ? [where('wbsId', '==', currentWbsId)] : []),
        ];

        const baseQuery = query(activitiesRef, ...constraints);

        // Subscribing to real-time updates of the activities data
        const unsubscribe = onSnapshot(baseQuery, onSnapshotCallback);

        return () => {
            setLoading(false); // Resetting the loading state when the component is unmounted or the dependencies change
            unsubscribe(); // Cleanup - unsubscribe when the component is unmounted or the dependencies change
        };
    }, [currentPhaseId, currentWbsId, currentProposalId, onSnapshotCallback, currentProposal]);

    // Utility function to convert a number to letters (e.g., for rowId)
    function numberToLetters(num: number) {
        let letters = '';
        while (num > 0) {
            const modulo = (num - 1) % 26;
            letters = String.fromCharCode(65 + modulo) + letters;
            num = Math.floor((num - modulo) / 26);
        }
        return letters;
    }

    // Returning the activities data and loading state
    return {data, loading};
};

export default useActivities;


// activities.forEach((activity, index) => {
//     if (activity?.activityType === ActivityType.equipmentItem) {
//         equipmentIndex.push(index);
//         equipment.push(activity);
//     }
// });
// equipment.sort((a, b) => {
//     if (a.equipment === null && b.equipment === null) {
//         return 0;
//     } else if (a.equipment === null) {
//         return 1;
//     } else if (b.equipment === null) {
//         return -1;
//     } else {
//         return a.equipment.id - b.equipment.id;
//     }
// });
// for (let i = equipmentIndex.length - 1; i >= 0; i--) {
//     activities.splice(equipmentIndex[i], 1);
// }
// activities
//     .filter((activity): activity is Activity => activity !== null)
//     .sort((a: Activity, b: Activity) => {
//         return a.sortOrder - b.sortOrder;
//     });
// const sortedActivities = [...activities, ...equipment];
// setData(
//     activities
//         .filter((activity): activity is Activity => activity !== null)
//         .sort((a: Activity, b: Activity) => {
//             if (
//                 a.activityType === ActivityType.laborItem &&
//                 b.activityType === ActivityType.equipmentItem
//             ) {
//                 return -1;
//             } else if (
//                 a.activityType === ActivityType.equipmentItem &&
//                 b.activityType === ActivityType.laborItem
//             ) {
//                 return 1;
//             } else {
//                 return a.sortOrder - b.sortOrder;
//             }
//         })
// );

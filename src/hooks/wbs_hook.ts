import { ref as databaseRef, off, onValue } from "firebase/database";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getActivitiesForWbs } from "../api/activity";
import { Proposal } from "../models/proposal";
import { Wbs } from "../models/wbs";
import { auth, firestore } from "../setup/config/firebase";
import { useUserPreferences } from "./user_preferences_hook";

export const useWbs = ({
  currentProposalId,
}: {
  currentProposalId: string;
}) => {
  const [data, setData] = useState<Wbs[]>([]);
  const [loading, setLoading] = useState(true);
  const userPreferences = useUserPreferences(auth.currentUser?.uid!);

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

  useEffect(() => {
    const wbsRef = collection(firestore, "wbs");
    const wbsQuery = query(
      wbsRef,
      where("proposalId", "==", currentProposalId)
    );
    const unsubscribe = onSnapshot(wbsQuery, async (querySnapshot) => {
      const temp: Wbs[] = [];
      querySnapshot.docs.forEach((doc) => {
        const wbs = doc.data() as Wbs;
        wbs.id = doc.id;
        temp.push(wbs);
      });
      //filter wbs based on user preferences
      let filteredWbs = temp.filter((wbs) =>
        userPreferences?.wbsToDisplay?.includes(wbs.name!)
      );
      //order wbs based on wbsDatabaseId
      filteredWbs = filteredWbs.sort((a, b) => {
        return a.wbsDatabaseId! - b.wbsDatabaseId!;
      });
      const promises = filteredWbs.map(async (wbs) => {
        let costOnlyCost = 0;
        let subCost = 0;
        let materialCost = 0;
        let equipmentCost = 0;
        let craftCost = 0;
        let welderCost = 0;
        let cmh = 0;
        let wmh = 0;
        let totalCost = 0;
        const activities = await getActivitiesForWbs({
          wbsId: wbs.id ?? "",
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
        wbs.costOnlyCost = costOnlyCost;
        wbs.craftCost = craftCost;
        wbs.welderCost = welderCost;
        wbs.subContractorCost = subCost;
        wbs.materialCost = materialCost;
        wbs.equipmentCost = equipmentCost;
        wbs.craftManHours = cmh;
        wbs.welderManHours = wmh;
        wbs.totalCost = totalCost;
        return wbs;
      });
      const updatedPhases = await Promise.all(promises);
      setData(updatedPhases);
      setLoading(false);
    });
    return unsubscribe;
  }, [userPreferences, currentProposal]);
  return { data, loading };
};

import { Box, Typography } from "@mui/material";
import { collection, doc, query, where } from "firebase/firestore";
import React, { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";
import BottomPanel from "../../components/bottom_pannel";
import useActivities from "../../hooks/activity_hook";
import { useLoadedRates } from "../../hooks/rates_hook";
import { firestore } from "../../setup/config/firebase";
import ActivityDataGrid from "./components/activity_data_grid";
import AddActivityDialog from "./components/add_activity_dialog";

function PhaseHomeScreen() {
  const { proposalId, wbsId, phaseId } = useParams();
  const [addActivityOpen, setAddActivitiyOpen] = useState<boolean>(false);
  const { data, loading } = useActivities({
    currentPhaseId: phaseId ?? "",
    currentProposalId: proposalId ?? "",
  });
  const { craftLoadedRate, welderLoadedRate } = useLoadedRates({
    currentProposalId: proposalId ?? "",
  });

  return (
    <Box
      sx={{
        height: "95%",
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
      }}
    >
      <ActivityDataGrid />
      <BottomPanel />
    </Box>
  );
}

export default PhaseHomeScreen;

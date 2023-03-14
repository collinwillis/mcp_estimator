import { Box } from "@mui/material";
import { collection, doc, query, where } from "firebase/firestore";
import React from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";
import BottomPanel from "../../components/bottom_pannel";
import { useCurrentProposal } from "../../hooks/current_proposal_hook";
import { usePhases } from "../../hooks/phase_hook";
import { firestore } from "../../setup/config/firebase";
import ProposalInfoAccordion from "../proposal home/components/proposal_info_accordion";
import ProposalRatesAccordion from "../proposal home/components/proposal_rates_accordion";
import PhaseDataGrid from "./components/phase_data_grid";

function WbsHomeScreen() {
  const { proposalId, wbsId } = useParams();
  const { data, isLoading } = usePhases({
    currentWbsId: wbsId ?? "",
    currentProposalId: proposalId ?? "",
  });
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? "",
  });

  return (
    <Box
      sx={{
        height: "95%",
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <PhaseDataGrid phaseList={data} isLoading={isLoading} />

      <BottomPanel />
    </Box>
  );
}

export default WbsHomeScreen;

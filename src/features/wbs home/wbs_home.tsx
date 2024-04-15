import { Box } from "@mui/material";
import { collection, doc, query, where } from "firebase/firestore";
import React, {useEffect, useState} from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";
import BottomPanel from "../../components/bottom_pannel";
import { useCurrentProposal } from "../../hooks/current_proposal_hook";
import { usePhases } from "../../hooks/phase_hook";
import { firestore } from "../../setup/config/firebase";
import ProposalInfoAccordion from "../proposal home/components/proposal_info_accordion";
import ProposalRatesAccordion from "../proposal home/components/proposal_rates_accordion";
import PhaseDataGrid from "./components/phase_data_grid";
import {estimatorStore, StoreState} from "../../utils/store";
import {Phase} from "../../models/phase";

function WbsHomeScreen() {
  const { proposalId, wbsId } = useParams();
    const data = estimatorStore((state: StoreState) => state.phases[proposalId!] || []);
    const [filtered, setFiltered] = useState<Phase[]>([]);

    useEffect(() => {
            let temp = data.filter(phase => phase.wbsId === wbsId);
            temp.forEach((phase) => {

            });
            setFiltered(temp);
            console.log(temp);
    }, [data, wbsId]);

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
      <PhaseDataGrid phaseList={filtered} isLoading={false} />

      <BottomPanel />
    </Box>
  );
}

export default WbsHomeScreen;

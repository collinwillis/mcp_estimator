import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCraftLoadedRate } from "../../api/totals";
import BottomPanel from "../../components/bottom_pannel";
import { useCurrentProposal } from "../../hooks/current_proposal_hook";
import { useProposalPreferences } from "../../hooks/proposal_preferences_hook";
import { auth } from "../../setup/config/firebase";
import ProposalInfoAccordion from "./components/proposal_info_accordion";
import ProposalRatesAccordion from "./components/proposal_rates_accordion";
import SelectWbsDialog from "./components/select_wbs_dialog";
import WbsDataGrid from "./components/wbs_data_grid";

const ProposalHomeScreen = () => {
  const navigate = useNavigate();
  const { proposalId } = useParams();

  const [isSelectWbsDialogOpen, setIsSelectWbsDialogOpen] = useState(false);
  const proposalPreferences = useProposalPreferences(proposalId ?? "");
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? "",
  });
  useEffect(() => {
    if (currentProposal) {
      const craftLoadedRate = getCraftLoadedRate({
        proposal: currentProposal,
      });
      console.log(craftLoadedRate);
    }
  }, [currentProposal]);

  return (
    <Box
      sx={{
        height: "95%",
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
      }}
    >
      <ProposalInfoAccordion proposalId={proposalId ?? ""} />
      <ProposalRatesAccordion proposalId={proposalId ?? ""} />
      <WbsDataGrid openSelectWbsDialog={() => setIsSelectWbsDialogOpen(true)} />
      <SelectWbsDialog
        isOpen={isSelectWbsDialogOpen}
        onClose={() => {
          setIsSelectWbsDialogOpen(false);
        }}
        proposalPreferences={proposalPreferences}
      />
      <BottomPanel />
    </Box>
  );
};

export default ProposalHomeScreen;

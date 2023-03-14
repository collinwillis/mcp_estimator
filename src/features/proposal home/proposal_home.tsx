import { Box } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomPanel from "../../components/bottom_pannel";
import { useCurrentProposal } from "../../hooks/current_proposal_hook";
import { useUserPreferences } from "../../hooks/user_preferences_hook";
import { auth } from "../../setup/config/firebase";
import ProposalInfoAccordion from "./components/proposal_info_accordion";
import ProposalRatesAccordion from "./components/proposal_rates_accordion";
import SelectWbsDialog from "./components/select_wbs_dialog";
import WbsDataGrid from "./components/wbs_data_grid";

const ProposalHomeScreen = () => {
  const navigate = useNavigate();
  const { proposalId } = useParams();
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? "",
  });

  const [isSelectWbsDialogOpen, setIsSelectWbsDialogOpen] = useState(false);
  const userPreferences = useUserPreferences(auth?.currentUser?.uid!);
  return (
    <Box
      sx={{
        height: "95%",
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
      }}
    >
      <ProposalInfoAccordion currentProposal={currentProposal!} />
      <ProposalRatesAccordion currentProposal={currentProposal!} />
      <WbsDataGrid openSelectWbsDialog={() => setIsSelectWbsDialogOpen(true)} />
      <SelectWbsDialog
        isOpen={isSelectWbsDialogOpen}
        onClose={() => {
          setIsSelectWbsDialogOpen(false);
        }}
        userPreferences={userPreferences}
      />
      <BottomPanel />
    </Box>
  );
};

export default ProposalHomeScreen;

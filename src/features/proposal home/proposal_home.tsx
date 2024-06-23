import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';

import { getCraftLoadedRate } from '../../api/totals';
import BottomPanel from '../../components/bottom_pannel';
import { useCurrentProposal } from '../../hooks/current_proposal_hook';
import { useProposalPreferences } from '../../hooks/proposal_preferences_hook';
import { StoreState, estimatorStore } from '../../utils/store';
import ProposalInfoAccordion from './components/proposal_info_accordion';
import ProposalRatesAccordion from './components/proposal_rates_accordion';
import SelectWbsDialog from './components/select_wbs_dialog';
import WbsDataGrid from './components/wbs_data_grid';

function ProposalHomeScreen() {
  const navigate = useNavigate();
  const { proposalId } = useParams();

  const [isSelectWbsDialogOpen, setIsSelectWbsDialogOpen] = useState(false);
  const proposalPreferences = useProposalPreferences(proposalId ?? '');
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? '',
  });
  const wbs = estimatorStore(
    (state: StoreState) => state.visibleWbs[proposalId!] || [],
  );
  const prefs = estimatorStore(
    (state: StoreState) => state.preferences[proposalId!] || [],
  );
  const loadFullProposalData = estimatorStore(
    (state: StoreState) => state.loadFullProposalData,
  );

  useEffect(() => {
    loadFullProposalData(proposalId!).then((r) => {
      console.log('WBS', prefs);
      // console.log("ACTIVITIES", activities);
      // console.log("PHASES", phases);
    });
  }, [proposalId, loadFullProposalData]);

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
        height: '95%',
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
      }}
    >
      <ProposalInfoAccordion proposalId={proposalId ?? ''} />
      <ProposalRatesAccordion proposalId={proposalId ?? ''} />
      <WbsDataGrid openSelectWbsDialog={() => setIsSelectWbsDialogOpen(true)} />
      <SelectWbsDialog
        isOpen={isSelectWbsDialogOpen}
        onClose={() => {
          setIsSelectWbsDialogOpen(false);
        }}
        proposalPreferences={prefs}
      />
      <BottomPanel />
    </Box>
  );
}

export default ProposalHomeScreen;

import React, { useEffect, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { collection, doc, query, where } from 'firebase/firestore';
import BottomPanel from '../../components/bottom_pannel';
import { useCurrentProposal } from '../../hooks/current_proposal_hook';
import { usePhases } from '../../hooks/phase_hook';
import { Phase } from '../../models/phase';
import { firestore } from '../../setup/config/firebase';
import { StoreState, estimatorStore } from '../../utils/store';
import ProposalInfoAccordion from '../proposal home/components/proposal_info_accordion';
import ProposalRatesAccordion from '../proposal home/components/proposal_rates_accordion';
import PhaseDataGrid from './components/phase_data_grid';

function WbsHomeScreen() {
  const { proposalId, wbsId } = useParams();
  const data = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || []
  );
  const [filtered, setFiltered] = useState<Phase[]>([]);

  useEffect(() => {
    const temp = data
      .filter((phase) => phase.wbsId === wbsId)
      .sort((a, b) => a.phaseNumber! - b.phaseNumber!);
    setFiltered(temp);
    console.log(temp);
  }, [data, wbsId]);

  return (
    <Box
      sx={{
        height: '95%',
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <PhaseDataGrid phaseList={filtered} isLoading={false} />

      <BottomPanel />
    </Box>
  );
}

export default WbsHomeScreen;

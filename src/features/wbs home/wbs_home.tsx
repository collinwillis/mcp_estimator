import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';

import BottomPanel from '../../components/bottom_pannel';
import { Phase } from '../../models/phase';
import { StoreState, estimatorStore } from '../../utils/store';
import PhaseDataGrid from './components/phase_data_grid';

function WbsHomeScreen() {
  const { proposalId, wbsId } = useParams();
  const data = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || [],
  );
  const wbsList = estimatorStore(
    (state: StoreState) => state.wbs[proposalId!] || [],
  );
  const [filtered, setFiltered] = useState<Phase[]>([]);
  const currentWbs = React.useMemo(
    () => wbsList.find((wbs) => wbs.id === wbsId),
    [wbsList, wbsId],
  );

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
      }}>
      <PhaseDataGrid
        phaseList={filtered}
        isLoading={false}
        wbsDatabaseId={currentWbs?.wbsDatabaseId}
      />

      <BottomPanel />
    </Box>
  );
}

export default WbsHomeScreen;

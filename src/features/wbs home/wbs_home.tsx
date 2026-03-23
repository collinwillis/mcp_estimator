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
  }, [data, wbsId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
      {/* Scrollable content area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }}>
        <PhaseDataGrid
          phaseList={filtered}
          isLoading={false}
          wbsDatabaseId={currentWbs?.wbsDatabaseId}
        />
      </Box>

      {/* Fixed bottom panel */}
      <BottomPanel />
    </Box>
  );
}

export default WbsHomeScreen;

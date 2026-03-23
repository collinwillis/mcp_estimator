import React from 'react';
import { Box } from '@mui/material';

import BottomPanel from '../../components/bottom_pannel';
import ActivityDataGrid from './components/activity_data_grid';

function PhaseHomeScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}>
      {/* Scrollable content area: data grid + rate editing bar */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}>
        <ActivityDataGrid />
      </Box>

      {/* Fixed bottom panel — never clipped */}
      <BottomPanel />
    </Box>
  );
}

export default PhaseHomeScreen;

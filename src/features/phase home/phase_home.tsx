import React from 'react';
import { Box } from '@mui/material';

import BottomPanel from '../../components/bottom_pannel';
import ActivityDataGrid from './components/activity_data_grid';

function PhaseHomeScreen() {
  return (
    <Box
      sx={{
        height: '95%',
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
      }}>
      <ActivityDataGrid />
      <BottomPanel />
    </Box>
  );
}

export default PhaseHomeScreen;

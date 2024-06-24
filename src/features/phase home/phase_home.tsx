import React from 'react';
import { Box } from '@mui/material';

import BottomPanel from '../../components/bottom_pannel';
import ActivityDataGrid from './components/activity_data_grid';

function PhaseHomeScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '96%',
      }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          overflow: 'auto',
          flexDirection: 'column',
        }}>
        <ActivityDataGrid />
      </Box>

      <BottomPanel />
    </div>
  );
}

export default PhaseHomeScreen;

import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Fab, Tooltip } from '@mui/material';

interface AddPhaseButtonProps {
  toggleAddDialog: () => void;
}

export default function AddPhaseButton({
  toggleAddDialog,
}: AddPhaseButtonProps) {
  return (
    <Tooltip title='Add new phase'>
      <Fab
        variant='extended'
        color='primary'
        sx={{
          position: 'absolute',
          bottom: '20px',
          zIndex: 1,
        }}
        onClick={toggleAddDialog}
      >
        Add Phase
        <AddIcon />
      </Fab>
    </Tooltip>
  );
}

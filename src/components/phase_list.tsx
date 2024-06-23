import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';

import { Phase } from '../models/phase';
import { StoreState, estimatorStore } from '../utils/store';

interface PhaseListProps {
  onClick: (phase: Phase) => void;
}

export default function PhaseList({ onClick }: PhaseListProps) {
  const { proposalId, wbsId, phaseId } = useParams();
  const phases = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || [],
  );
  const navigate = useNavigate();
  const [data, setData] = useState<Phase[]>([]);
  useEffect(() => {
    const temp = phases.filter((phase) => phase.wbsId === wbsId);
    temp.sort((a, b) => a.phaseNumber! - b.phaseNumber!);
    setData(temp);
    console.log(temp);
  }, [phases, wbsId]);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 0,
        overflow: 'hidden',
        pb: '65px',
      }}>
      <List sx={{ py: 0 }}>
        {data.length > 0 ? (
          data.map((phase) => (
            <Tooltip
              title={`${phase.phaseNumber} - ${phase.description}`}
              key={phase.id}
              placement='right'>
              <ListItem
                onClick={() => {
                  onClick(phase);
                  navigate(
                    `/proposal/${proposalId}/wbs/${wbsId}/phase/${phase.id}`,
                  );
                }}
                sx={{
                  'bgcolor': phase.id == phaseId ? 'primary.main' : 'white',
                  'cursor': 'pointer',
                  'transition': 'background-color 0.3s ease-in-out',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}>
                <ListItemText
                  primaryTypographyProps={{
                    sx: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 'bold',
                      color: phase.id == phaseId ? 'white' : 'black',
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                  primary={phase.phaseNumber}
                  secondary={phase.description}
                />
              </ListItem>
            </Tooltip>
          ))
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant='body1' color='text.secondary'>
              No phases found.
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
}

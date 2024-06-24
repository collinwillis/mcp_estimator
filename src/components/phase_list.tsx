import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const temp = phases.filter((phase) => phase.wbsId === wbsId);
    temp.sort((a, b) => a.phaseNumber! - b.phaseNumber!);
    setData(temp);
    console.log(temp);
  }, [phases, wbsId]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const filteredData = data.filter(
    (phase) =>
      phase.phaseNumber?.toString().includes(searchInput) ||
      phase.description?.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        height: '100%',
        overflow: 'auto',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          p: 2,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          placeholder='Search Phases...'
          value={searchInput}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '.MuiOutlinedInput-root': {
              'borderRadius': '20px',
              'height': '40px',
              '.MuiInputBase-input': {
                height: '20px',
                padding: '10px 14px',
              },
            },
          }}
        />
      </Box>
      <List sx={{ py: 0 }}>
        {filteredData.length > 0 ? (
          filteredData.map((phase) => (
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
                  'bgcolor':
                    phase.id == phaseId ? 'primary.main' : 'background.paper',
                  'cursor': 'pointer',
                  'transition': 'background-color 0.3s ease-in-out',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                  'borderBottom': '1px solid #e0e0e0',
                }}>
                <ListItemText
                  primaryTypographyProps={{
                    sx: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 'bold',
                      color:
                        phase.id == phaseId
                          ? 'primary.contrastText'
                          : 'text.primary',
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: 'text.secondary',
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

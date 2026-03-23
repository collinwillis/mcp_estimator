import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, InputAdornment, List, TextField, Typography } from '@mui/material';
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
  }, [phases, wbsId]);

  const filteredData = data.filter(
    (phase) =>
      phase.phaseNumber?.toString().includes(searchInput) ||
      phase.description?.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search */}
      <Box sx={{ px: 1.5, py: 1, flexShrink: 0 }}>
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          placeholder='Search phases...'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              'height': 32,
              'borderRadius': 1,
              'backgroundColor': '#f3f4f6',
              'fontSize': '0.8rem',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: '#d1d5db' },
              '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
            },
            '& .MuiInputBase-input': { py: 0.5 },
          }}
        />
      </Box>

      {/* Phase items */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 0.75 }}>
        <List disablePadding>
          {filteredData.length > 0 ? (
            filteredData.map((phase) => {
              const isActive = phase.id === phaseId;
              return (
                <Box
                  key={phase.id}
                  onClick={() => {
                    onClick(phase);
                    navigate(`/proposal/${proposalId}/wbs/${wbsId}/phase/${phase.id}`);
                  }}
                  sx={{
                    'display': 'flex',
                    'alignItems': 'center',
                    'gap': 1,
                    'px': 1.25,
                    'py': 0.6,
                    'mx': 0.5,
                    'my': 0.2,
                    'cursor': 'pointer',
                    'borderRadius': 1,
                    'borderLeft': isActive ? '2px solid #111827' : '2px solid transparent',
                    'backgroundColor': isActive ? '#f3f4f6' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive ? '#f3f4f6' : '#f9fafb',
                    },
                  }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.775rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#111827' : '#374151',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                      {phase.phaseNumber}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.675rem',
                        color: '#6b7280',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                      {phase.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography sx={{ fontSize: '0.775rem', color: '#9ca3af' }}>
                No phases found.
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Box>
  );
}

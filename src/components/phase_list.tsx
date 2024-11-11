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
import { styled, useTheme } from '@mui/material/styles';

import { Phase } from '../models/phase';
import { StoreState, estimatorStore } from '../utils/store';

interface PhaseListProps {
  onClick: (phase: Phase) => void;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  'cursor': 'pointer',
  'transition': 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    'backgroundColor': theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    'borderRadius': theme.shape.borderRadius,
    'backgroundColor': theme.palette.background.paper,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.text.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5),
  },
}));

export default function PhaseList({ onClick }: PhaseListProps) {
  const { proposalId, wbsId, phaseId } = useParams();
  const phases = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || [],
  );
  const navigate = useNavigate();
  const [data, setData] = useState<Phase[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const temp = phases.filter((phase) => phase.wbsId === wbsId);
    temp.sort((a, b) => a.phaseNumber! - b.phaseNumber!);
    setData(temp);
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
        backgroundColor: theme.palette.background.default,
        height: '100%',
        overflow: 'auto',
      }}>
      {/* Search Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
        <StyledTextField
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
        />
      </Box>
      {/* Phase List */}
      <List sx={{ p: 0 }}>
        {filteredData.length > 0 ? (
          filteredData.map((phase) => (
            <Tooltip
              title={`${phase.phaseNumber} - ${phase.description}`}
              key={phase.id}
              placement='right'>
              <StyledListItem
                selected={phase.id === phaseId}
                onClick={() => {
                  onClick(phase);
                  navigate(
                    `/proposal/${proposalId}/wbs/${wbsId}/phase/${phase.id}`,
                  );
                }}>
                <ListItemText
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: 500,
                      color:
                        phase.id === phaseId
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                    },
                  }}
                  primary={`Phase ${phase.phaseNumber}`}
                  secondary={phase.description}
                />
              </StyledListItem>
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

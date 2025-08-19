import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import { useCurrentPhase } from '../hooks/current_phase_hook';
import { useCurrentWbs } from '../hooks/current_wbs_hook';
import { Phase } from '../models/phase';
import { Wbs } from '../models/wbs';
import { StoreState, estimatorStore } from '../utils/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface PhaseWithWbsInfo extends Phase {
  wbsName?: string;
}

export default function CopyActivitiesFromProposalDialog({ open, onClose }: Props) {
  const { wbsId, proposalId, phaseId } = useParams();
  const copyActivitiesFromPhase = estimatorStore(
    (state: StoreState) => state.copyActivitiesFromPhase,
  );
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase,
  );
  
  // Get all phases from the proposal
  const allPhases = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || [],
  );
  
  // Get all WBS from the proposal to get WBS names
  const allWbs = estimatorStore(
    (state: StoreState) => state.wbs[proposalId!] || [],
  );
  
  const [selectedPhase, setSelectedPhase] = useState<PhaseWithWbsInfo | null>(null);
  const [availablePhases, setAvailablePhases] = useState<PhaseWithWbsInfo[]>([]);

  const currentPhase = useCurrentPhase({
    phaseId: phaseId ?? '',
  });

  const onSubmit = async () => {
    if (!selectedPhase?.id) return;
    await copyActivitiesFromPhase(selectedPhase.id, phaseId!);
    recalculatePhase(phaseId!);
    setSelectedPhase(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedPhase(null);
    onClose();
  };

  useEffect(() => {
    // Create a map of WBS IDs to WBS names for quick lookup
    const wbsMap = new Map<string, string>();
    allWbs.forEach((wbs: Wbs) => {
      wbsMap.set(wbs.id!, wbs.name || 'Unknown WBS');
    });

    // Filter out the current phase and add WBS info
    const filtered = allPhases
      .filter((phase: Phase) => phase && phase.id !== phaseId)
      .map((phase: Phase) => ({
        ...phase,
        wbsName: wbsMap.get(phase.wbsId!) || 'Unknown WBS',
      }))
      .sort((a: PhaseWithWbsInfo, b: PhaseWithWbsInfo) => {
        // Sort by WBS name first, then by phase number
        if (a.wbsName !== b.wbsName) {
          return a.wbsName!.localeCompare(b.wbsName!);
        }
        return (a.phaseNumber || 0) - (b.phaseNumber || 0);
      });

    setAvailablePhases(filtered);
  }, [phaseId, allPhases, allWbs]);

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Copy Activities From Phase</DialogTitle>
        <DialogContent sx={{ height: '350px', width: '450px', padding: '20px' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
            <Autocomplete
              options={availablePhases}
              value={selectedPhase}
              onChange={(_, newValue) => setSelectedPhase(newValue)}
              getOptionLabel={(option) => 
                `${option.wbsName} - ${option.phaseNumber} - ${option.description}`
              }
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) => 
                  option.wbsName?.toLowerCase().includes(searchTerm) ||
                  option.description?.toLowerCase().includes(searchTerm) ||
                  option.phaseNumber?.toString().includes(searchTerm)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="From Phase"
                  placeholder="Search by WBS, phase number, or description..."
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {option.wbsName} - Phase {option.phaseNumber}
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
                      {option.description}
                    </div>
                  </div>
                </li>
              )}
              noOptionsText="No phases found"
              fullWidth
            />
            
            <FormControl variant='filled' fullWidth>
              <InputLabel id='to-phase-select-label' shrink>
                To Phase
              </InputLabel>
              <Select
                labelId='to-phase-select-label'
                disabled
                id='to-phase-select'
                value={currentPhase?.id ?? ''}>
                <MenuItem key={currentPhase?.id} value={currentPhase?.id}>
                  <ListItemText
                    primary={`${currentPhase?.phaseNumber} - ${
                      currentPhase?.description
                    }`}
                    primaryTypographyProps={{
                      style: {
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        maxWidth: '280px',
                      },
                    }}
                  />
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              variant='contained'
              disabled={!selectedPhase}
              onClick={onSubmit}
              sx={{ alignSelf: 'flex-end', minWidth: '140px' }}>
              Copy Activities
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
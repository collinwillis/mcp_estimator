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
      <Dialog open={open} onClose={handleClose}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 420 } }}>
        <DialogTitle sx={{ fontSize: '0.925rem', fontWeight: 600, color: '#111827', pb: 1 }}>
          Copy Activities From Phase
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Autocomplete
            options={availablePhases}
            value={selectedPhase}
            onChange={(_, newValue) => setSelectedPhase(newValue)}
            getOptionLabel={(option) => `${option.wbsName} - ${option.phaseNumber} - ${option.description}`}
            filterOptions={(options, { inputValue }) => {
              const s = inputValue.toLowerCase();
              return options.filter((o) => o.wbsName?.toLowerCase().includes(s) || o.description?.toLowerCase().includes(s) || o.phaseNumber?.toString().includes(s));
            }}
            renderInput={(params) => (
              <TextField {...params} label='From Phase' placeholder='Search...' variant='outlined' size='small'
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.875rem', backgroundColor: '#f9fafb' }, '& .MuiInputLabel-root': { fontSize: '0.875rem' } }} />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{option.wbsName} - Phase {option.phaseNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 1 }}>{option.description}</div>
                </div>
              </li>
            )}
            noOptionsText='No phases found'
            fullWidth
          />
          <FormControl variant='outlined' size='small' fullWidth>
            <InputLabel sx={{ fontSize: '0.875rem' }}>To Phase</InputLabel>
            <Select label='To Phase' disabled value={currentPhase?.id ?? ''}
              sx={{ borderRadius: 1, fontSize: '0.875rem', backgroundColor: '#f9fafb' }}>
              <MenuItem value={currentPhase?.id} sx={{ fontSize: '0.875rem' }}>
                {currentPhase?.phaseNumber} - {currentPhase?.description}
              </MenuItem>
            </Select>
          </FormControl>
          <Button disabled={!selectedPhase} onClick={onSubmit}
            sx={{ 'textTransform': 'none', 'fontWeight': 600, 'fontSize': '0.875rem', 'color': '#fff', 'backgroundColor': '#111827', 'borderRadius': 1, 'py': 0.75, 'alignSelf': 'flex-end', 'px': 3, '&:hover': { backgroundColor: '#1f2937' }, '&.Mui-disabled': { backgroundColor: '#e5e7eb', color: '#9ca3af' } }}>
            Copy Activities
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
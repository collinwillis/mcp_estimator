import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';

import { useCurrentPhase } from '../hooks/current_phase_hook';
import { useCurrentWbs } from '../hooks/current_wbs_hook';
import { Activity } from '../models/activity';
import { StoreState, estimatorStore } from '../utils/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CopyFromPhaseDialog({ open, onClose }: Props) {
  const { wbsId, proposalId, phaseId } = useParams();
  const copyActivitiesFromPhase = estimatorStore(
    (state: StoreState) => state.copyActivitiesFromPhase,
  );
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase,
  );
  const currentWbs = useCurrentWbs({
    wbsId: wbsId ?? '',
  });
  const data = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || [],
  );
  const [disabled, setDisabled] = useState(true);
  const [fromPhase, setFromPhase] = useState('');
  const [toPhase, setToPhase] = useState();
  const [availablePhases, setAvailablePhases] = useState(data);

  const currentPhase = useCurrentPhase({
    phaseId: phaseId ?? '',
  });
  const onSubmit = async () => {
    await copyActivitiesFromPhase(fromPhase, phaseId!);
    recalculatePhase(phaseId!);
    setFromPhase('');
    onClose();
  };
  useEffect(() => {
    const filtered = data.filter((a) => a && a.id !== phaseId);
    const filtered2 = filtered.filter((a) => a && a.wbsId == wbsId);
    const sorted = filtered2.sort((a, b) => a.phaseNumber! - b.phaseNumber!);
    setAvailablePhases(filtered2);
  }, [phaseId, data, currentPhase]);

  const checkSameValue = (
    array: Activity[],
    propName: keyof Activity,
  ): boolean => {
    const firstValue = array[0][propName];
    return array.every((obj) => obj[propName] === firstValue);
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 360 } }}>
        <DialogTitle sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', pb: 1 }}>
          Copy From Phase
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <FormControl variant='outlined' size='small' fullWidth>
            <InputLabel sx={{ fontSize: '0.8rem' }}>From</InputLabel>
            <Select label='From' value={fromPhase ?? ''} onChange={(e) => setFromPhase(e.target.value)}
              sx={{ borderRadius: 1, fontSize: '0.8rem', backgroundColor: '#f9fafb' }}>
              {availablePhases.map((item) => (
                <MenuItem key={item.id} value={item.id} sx={{ fontSize: '0.8rem' }}>
                  {item.phaseNumber} - {item.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant='outlined' size='small' fullWidth>
            <InputLabel sx={{ fontSize: '0.8rem' }}>To</InputLabel>
            <Select label='To' disabled value={currentPhase?.id ?? ''}
              sx={{ borderRadius: 1, fontSize: '0.8rem', backgroundColor: '#f9fafb' }}>
              <MenuItem value={currentPhase?.id} sx={{ fontSize: '0.8rem' }}>
                {currentPhase?.phaseNumber} - {currentPhase?.description}
              </MenuItem>
            </Select>
          </FormControl>
          <Button disabled={fromPhase.length == 0} onClick={onSubmit}
            sx={{ 'textTransform': 'none', 'fontWeight': 600, 'fontSize': '0.825rem', 'color': '#fff', 'backgroundColor': '#111827', 'borderRadius': 1, 'py': 0.75, 'alignSelf': 'flex-end', 'px': 3, '&:hover': { backgroundColor: '#1f2937' }, '&.Mui-disabled': { backgroundColor: '#e5e7eb', color: '#9ca3af' } }}>
            Copy
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

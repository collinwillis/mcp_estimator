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
import { usePhases } from '../hooks/phase_hook';
import { Activity } from '../models/activity';
import { StoreState, estimatorStore } from '../utils/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CopyFromPhaseDialog({ open, onClose }: Props) {
  const { wbsId, proposalId, phaseId } = useParams();
  const copyActivitiesFromPhase = estimatorStore(
    (state: StoreState) => state.copyActivitiesFromPhase
  );
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase
  );
  const currentWbs = useCurrentWbs({
    wbsId: wbsId ?? '',
  });
  const data = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || []
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
    propName: keyof Activity
  ): boolean => {
    const firstValue = array[0][propName];
    return array.every((obj) => obj[propName] === firstValue);
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Copy From Phase</DialogTitle>
        <DialogContent sx={{ height: '300px', width: '300px' }}>
          <div
            style={{
              width: '100%',
              height: '95%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}
          >
            <FormControl variant="filled" fullWidth>
              <InputLabel id="demo-simple-select-filled-label" shrink>
                From
              </InputLabel>
              <Select
                labelId="demo-simple-select-filled-label"
                id="demo-simple-select-filled"
                value={fromPhase ?? ''}
                onChange={(e) => setFromPhase(e.target.value)}
              >
                {availablePhases.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <ListItemText
                      primary={`${item.phaseNumber} - ${item.description}`}
                      primaryTypographyProps={{
                        style: {
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px', // Adjust the width as needed
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="filled" fullWidth>
              <InputLabel id="demo-simple-select-filled-label" shrink>
                To
              </InputLabel>
              <Select
                labelId="demo-simple-select-filled-label"
                disabled
                id="demo-simple-select-filled"
                value={currentPhase?.id ?? ''}
                // onChange={(e) => setFromPhase(e.target.value)}
              >
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
                        maxWidth: '200px', // Adjust the width as needed
                      },
                    }}
                  />
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              disabled={fromPhase.length == 0}
              onClick={onSubmit}
            >
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

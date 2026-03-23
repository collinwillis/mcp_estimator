import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  Typography,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { resolveDataset } from '../../../data/datasets';
import { getProposalDatasetVersions } from '../../../data/proposal_datasets';
import { useCurrentPhase } from '../../../hooks/current_phase_hook';
import { ActivityType } from '../../../models/activity';
import { Constant } from '../../../models/constant';
import { FirestoreActivity } from '../../../models/firestore models/activity_firestore';
import { StoreState, estimatorStore } from '../../../utils/store';
import { useCurrentProposal } from '../../../hooks/current_proposal_hook';

export default function AddActivityDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { proposalId, wbsId, phaseId } = useParams();
  const currentPhase = useCurrentPhase({
    phaseId: phaseId ?? '',
  });
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? '',
  });
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Constant[]>([]);
  const [checked, setChecked] = useState<Constant[]>([]);
  const [constants, setConstants] = useState<Constant[]>([]);
  const addActivities = estimatorStore(
    (state: StoreState) => state.addActivities,
  );
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase,
  );

  const datasetVersions = getProposalDatasetVersions(currentProposal);
  const rawConstantData = resolveDataset<Constant[]>(
    'labor',
    datasetVersions.labor,
  );

  // batch add new activities to db
  async function addToDb() {
    const temp: FirestoreActivity[] = [];
    checked.forEach((constant) => {
      const newActivity = new FirestoreActivity({
        proposalId,
        wbsId,
        phaseId,
        constant,
        equipment: null,
        time: 0,
        craftConstant: constant.craftConstant,
        welderConstant: constant.weldConstant,
        activityType: ActivityType.laborItem,
        description: constant.description,
        quantity: 0,
        price: 0,
        unit: constant.craftUnits,
        craftBaseRate: null,
        subsistenceRate: null,
        equipmentCost: null,
        craftCost: null,
        materialCost: null,
        equipmentOwnership: null,
        dateAdded: Date.now(),
        sortOrder: constant.sortOrder,
      });
      temp.push(newActivity);
    });
    await addActivities(temp);
    recalculatePhase(phaseId!);
    setChecked([]);
    setConstants([]);
    onClose();
  }

  const handleToggle = (value: Constant) => () => {
    const currentIndex = checked.indexOf(value);
    const newCheckedItems = [...checked];

    if (currentIndex === -1) {
      newCheckedItems.push(value);
    } else {
      newCheckedItems.splice(currentIndex, 1);
    }

    setChecked(newCheckedItems);
  };

  useEffect(() => {
    let temp: Constant[] = [];
    rawConstantData.forEach((constant) => {
      const newConstant: Constant = constant as Constant;
      if (newConstant.phaseDatabaseId == currentPhase?.phaseDatabaseId) {
        temp = [...temp, newConstant];
      }
    });
    temp = temp.sort((a, b) => a.sortOrder - b.sortOrder);
    setConstants(temp);
  }, [currentPhase, open, rawConstantData]);

  // Filter the activities based on the search input
  useEffect(() => {
    let temp: Constant[] = [...constants];
    if (search) {
      temp = temp.filter(
        (activity) =>
          activity.description.includes(search) ||
          activity.description.toLowerCase().includes(search) ||
          activity.description.toUpperCase().includes(search),
      );
    }
    setSearchResults(temp);
  }, [search, constants]);

  function endsWithNumber(str: String) {
    return !isNaN(parseInt(str.slice(-1)));
  }

  return (
    <Dialog open={open} onClose={onClose}
      PaperProps={{ sx: { borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', mb: 1 }}>
          Add Activities
        </Typography>
        <Input
          placeholder='Search activities...'
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', fontSize: '0.825rem' }}
          autoFocus
        />
      </DialogTitle>
      <DialogContent sx={{ height: '400px', width: '400px' }}>
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {searchResults?.map((constant) => {
            const labelId = `checkbox-list-label-${constant.id}`;
            const isChecked = checked.indexOf(constant) !== -1;
            return (
              <ListItem
                key={`${constant.phaseDatabaseId}-${constant.description}`}
                disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(constant)}
                  dense>
                  <ListItemIcon>
                    <Checkbox
                      edge='start'
                      checked={isChecked}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={
                      constant.description +
                      (endsWithNumber(constant.description) ? '"' : '')
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={addToDb} color='primary'>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

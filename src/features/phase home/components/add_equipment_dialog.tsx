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

import { StoreState, estimatorStore } from '../../../utils/store';
import { FirestoreActivity } from '../../../models/firestore models/activity_firestore';
import {
  Equipment,
  EquipmentOwnership,
  EquipmentUnit,
} from '../../../models/equipment';
import { ActivityType } from '../../../models/activity';
import { useCurrentPhase } from '../../../hooks/current_phase_hook';
import { useCurrentProposal } from '../../../hooks/current_proposal_hook';
import defaultEquipment from '../../../data/equipment_v2.json';
import equipment2025 from '../../../data/2025/equipment_2025.json';

export default function AddEquipmentDialog({
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

  // Determine which equipment array to use based on proposal's constantDataSet
  // const rawEquipment = currentProposal?.constantDataSet === "2025"
  //   ? equipment2025
  //   : defaultEquipment;

    const rawEquipment  = equipment2025;


  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Equipment[]>([]);
  const [checked, setChecked] = useState<Equipment[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const addActivities = estimatorStore(
    (state: StoreState) => state.addActivities,
  );
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase,
  );

  // batch add new activities to db
  async function addToDb() {
    const temp: FirestoreActivity[] = [];
    checked.forEach((equipment) => {
      const newActivity = new FirestoreActivity({
        proposalId,
        wbsId,
        phaseId,
        constant: null,
        equipment,
        craftConstant: 0,
        welderConstant: 0,
        activityType: ActivityType.equipmentItem,
        description: equipment.description,
        quantity: 0,
        time: 0,
        unit: EquipmentUnit.months,
        price: equipment.monthRate,
        craftBaseRate: null,
        subsistenceRate: null,
        craftCost: null,
        equipmentCost: null,
        materialCost: null,
        equipmentOwnership: EquipmentOwnership.rental,
        dateAdded: Date.now(),
        sortOrder: new Date().getTime(),
      });
      temp.push(newActivity);
    });
    await addActivities(temp);
    recalculatePhase(phaseId!);
    setChecked([]);
    setSearch('');
    setSearchResults([]);
    onClose();
  }

  const handleToggle = (value: Equipment) => () => {
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
    let temp: Equipment[] = [];
    rawEquipment.forEach((equipment) => {
      const newEquipment: Equipment = equipment as Equipment;
      temp = [...temp, newEquipment];
    });

    temp = temp.sort((a, b) => a.id - b.id);
    setEquipment(temp);
  }, [currentPhase, rawEquipment]);

  // Filter the activities based on the search input
  useEffect(() => {
    let temp: Equipment[] = [...equipment];
    if (search) {
      temp = temp.filter(
        (equipment) =>
          equipment.description.includes(search.toLowerCase()) ||
          equipment.description.toLowerCase().includes(search.toLowerCase()) ||
          equipment.description.toUpperCase().includes(search.toUpperCase()),
      );
    }
    setSearchResults(temp);
  }, [search, equipment, open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant='h3' sx={{ pb: '20px' }}>
          Add Equipment
        </Typography>

        <Input
          placeholder='Search Equipment'
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          sx={{ width: '100%' }}
          autoFocus
        />
      </DialogTitle>
      <DialogContent sx={{ height: '400px', width: '400px' }}>
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {searchResults?.map((currentEquipment) => {
            const labelId = `checkbox-list-label-${currentEquipment.id}`;
            const isChecked = checked.indexOf(currentEquipment) !== -1;
            return (
              <ListItem
                key={`equipment-${currentEquipment.id}`}
                disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(currentEquipment)}
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
                    primary={currentEquipment.description}
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

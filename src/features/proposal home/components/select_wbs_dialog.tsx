import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { ProposalPreferences } from '../../../models/proposal_preferences';
import { WbsArray } from '../../../utils/enums';
import wbs2025Array from '../../../data/2025/wbs_2025.json';
import { useCurrentProposal } from '../../../hooks/current_proposal_hook';
import { StoreState, estimatorStore } from '../../../utils/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  proposalPreferences?: ProposalPreferences;
}
export default function SelectWbsDialog({
  isOpen,
  onClose,
  proposalPreferences,
}: Props) {
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const updateFirestorePreferences = estimatorStore(
    (state: StoreState) => state.setPreferences,
  );
  const proposal = estimatorStore((state: StoreState) => state.proposal);

  // Determine which WBS array to use based on proposal's constantDataSet
  const currentProposal = useCurrentProposal({
    proposalId: proposal?.id ?? '',
  });

  const wbsArrayToUse = WbsArray;

  useEffect(() => {
    if (proposalPreferences) {
      setChecked(proposalPreferences?.wbsToDisplay!);
    }
  }, [proposalPreferences]);

  const styles = {
    dialogPaper: {
      minHeight: '80vh',
      maxHeight: '80vh',
    },
  };
  const handleToggle = (value: string) => () => {
    if (checked.includes(value)) {
      setChecked(checked.filter((wbs) => wbs !== value));
    } else {
      setChecked([...checked, value]);
    }
  };

  const handleSave = async () => {
    const updatedProposalPreferences: ProposalPreferences = {
      ...proposalPreferences!,
      wbsToDisplay: checked!,
    };
    updateFirestorePreferences(proposal?.id!, updatedProposalPreferences);
    // await updateProposalPreferences(updatedProposalPreferences);
    onClose();
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={onClose}
        classes={{ paper: styles.dialogPaper.toString() }}>
        <DialogTitle>
          <>
            <h2>Select WBS</h2>
            <Input
              placeholder='Search WBS'
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              sx={{ width: '100%' }}
              autoFocus
            />
          </>
        </DialogTitle>
        <DialogContent sx={{ height: '400px', width: '400px' }}>
          <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {wbsArrayToUse?.sort((a, b) => {
              // Sort by wbsDatabaseId which is defined in WbsEnum
              return a.wbsDatabaseId - b.wbsDatabaseId;
            }).map((wbs) => {
              const labelId = `checkbox-list-label-${wbs.name}`;
              return (
                <ListItem key={wbs.name} disablePadding>
                  <ListItemButton
                    role={undefined}
                    onClick={handleToggle(wbs.name)}
                    dense>
                    <ListItemIcon>
                      <Checkbox
                        edge='start'
                        checked={checked?.includes(wbs.name)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={wbs.name} />
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
          <Button onClick={handleSave} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

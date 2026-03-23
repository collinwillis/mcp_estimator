import React, { useEffect, useState } from 'react';
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

import { ProposalPreferences } from '../../../models/proposal_preferences';
import { WbsArray } from '../../../utils/enums';
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
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minHeight: '60vh', maxHeight: '80vh' } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: '0.925rem', fontWeight: 600, color: '#111827', mb: 1 }}>
            Select WBS
          </Typography>
          <Input
            placeholder='Search WBS...'
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: '100%', fontSize: '0.875rem' }}
            autoFocus
          />
        </DialogTitle>
        <DialogContent sx={{ height: '400px', width: '400px' }}>
          <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {wbsArrayToUse
              ?.sort((a, b) => {
                // Sort by wbsDatabaseId which is defined in WbsEnum
                return a.wbsDatabaseId - b.wbsDatabaseId;
              })
              .map((wbs) => {
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}
            sx={{ 'textTransform': 'none', 'fontSize': '0.85rem', 'fontWeight': 500, 'color': '#6b7280', 'borderRadius': 1, 'px': 1.5, 'border': '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f3f4f6' } }}>
            Cancel
          </Button>
          <Button onClick={handleSave}
            sx={{ 'textTransform': 'none', 'fontSize': '0.85rem', 'fontWeight': 600, 'color': '#fff', 'backgroundColor': '#111827', 'borderRadius': 1, 'px': 2, '&:hover': { backgroundColor: '#1f2937' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

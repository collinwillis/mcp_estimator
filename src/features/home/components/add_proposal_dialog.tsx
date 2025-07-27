import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import { insertProposal } from '../../../api/proposal';
import { useProposals } from '../../../hooks/proposals_hook';

interface AddProposalDialogProps {
  open: boolean;
  toggleAddDialog: () => void;
}
export default function AddProposalDialog({
  open,
  toggleAddDialog,
}: AddProposalDialogProps) {
  const { data, loading } = useProposals();

  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalNumber, setProposalNumber] = useState('');

  useEffect(() => {
    if (data.length > 0) {
      // Convert all proposal numbers to numbers and find the max
      const maxNumber = Math.max(
        ...data
          .map((p) => parseFloat(p.proposalNumber?.toString() || '0'))
          .filter((n) => !isNaN(n))
      );
      setProposalNumber((maxNumber + 1).toString());
    } else {
      setProposalNumber('1300');
    }
  }, [data, open]);

  const handleProposalCreate = async () => {
    await insertProposal(proposalDescription, proposalNumber);
    toggleAddDialog();
    setProposalDescription('');
    setProposalNumber('');
  };
  return (
    <div>
      <Dialog open={open} onClose={toggleAddDialog}>
        <DialogTitle>New Proposal</DialogTitle>
        <DialogContent sx={{ height: '200px', width: '300px' }}>
          <div
            style={{
              width: '100%',
              height: '95%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}>
            <TextField
              variant='standard'
              label='Proposal Number'
              type='number'
              value={proposalNumber}
              onChange={(e) => setProposalNumber(e.target.value)}
              placeholder='Proposal Number'
            />
            <TextField
              variant='standard'
              label='Proposal Description'
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder='Ex. Proposal'
            />

            <Button
              disabled={
                proposalDescription.length === 0 || proposalNumber.length === 0
              }
              variant='contained'
              onClick={() => {
                if (
                  proposalDescription.length > 0 &&
                  proposalNumber.length > 0
                ) {
                  handleProposalCreate();
                }
              }}>
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

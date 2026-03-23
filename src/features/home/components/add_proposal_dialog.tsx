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
      <Dialog
        open={open}
        onClose={toggleAddDialog}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 340 } }}>
        <DialogTitle sx={{ fontSize: '0.925rem', fontWeight: 600, color: '#111827', pb: 1 }}>
          New Proposal
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            variant='outlined'
            size='small'
            label='Proposal Number'
            type='number'
            value={proposalNumber}
            onChange={(e) => setProposalNumber(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.875rem', backgroundColor: '#f9fafb' }, '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}
          />
          <TextField
            variant='outlined'
            size='small'
            label='Proposal Description'
            onChange={(e) => setProposalDescription(e.target.value)}
            placeholder='Ex. Proposal'
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.875rem', backgroundColor: '#f9fafb' }, '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}
          />
          <Button
            disabled={proposalDescription.length === 0 || proposalNumber.length === 0}
            fullWidth
            onClick={() => {
              if (proposalDescription.length > 0 && proposalNumber.length > 0) handleProposalCreate();
            }}
            sx={{ 'textTransform': 'none', 'fontWeight': 600, 'fontSize': '0.875rem', 'color': '#fff', 'backgroundColor': '#111827', 'borderRadius': 1, 'py': 0.75, '&:hover': { backgroundColor: '#1f2937' }, '&.Mui-disabled': { backgroundColor: '#e5e7eb', color: '#9ca3af' } }}>
            Add Proposal
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

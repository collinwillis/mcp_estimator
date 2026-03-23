import React, { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  CircularProgress,
  Dialog,
  Divider,
  IconButton,
  InputAdornment,
  List,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { CopyAllRounded, Close, Search } from '@mui/icons-material';

import { Proposal } from '../../../models/proposal';
import { useProposals } from '../../../hooks/proposals_hook';
import DeleteConfirmationDialog from '../../../components/alert_dialog';
import { deleteProposalAndAssociatedData } from '../../../api/proposal';

interface EditProposalsDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: (proposalId: string) => void;
}

const EditProposalsDialog: React.FC<EditProposalsDialogProps> = ({
  open,
  onClose,
  onDelete,
}) => {
  const { data, loading } = useProposals();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const filteredData = data.filter((proposal: Proposal) => {
    const searchText = `${proposal.proposalNumber} - ${proposal.proposalDescription}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const handleDuplicate = async (proposal: Proposal) => {
    setIsDuplicating(true);
    try {
      const functions = getFunctions();
      const duplicateProposal = httpsCallable(functions, 'duplicateProposal');
      await duplicateProposal({ proposalId: proposal.id });
    } catch (error) {
      console.error('Error duplicating proposal: ', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        },
      }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid #e5e7eb',
        }}>
        <Typography sx={{ fontSize: '0.825rem', fontWeight: 600, color: '#111827' }}>
          Manage Proposals
        </Typography>
        <IconButton size='small' onClick={onClose} sx={{ color: '#6b7280' }}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f3f4f6' }}>
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          placeholder='Search proposals...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search sx={{ fontSize: 16, color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              'height': 32,
              'borderRadius': 1,
              'backgroundColor': '#f3f4f6',
              'fontSize': '0.8rem',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: '#d1d5db' },
              '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
            },
          }}
        />
      </Box>

      {/* List */}
      <Box sx={{ overflowY: 'auto', maxHeight: '55vh' }}>
        <List disablePadding>
          {filteredData.map((proposal: Proposal, index: number) => (
            <React.Fragment key={proposal.id}>
              <Box
                sx={{
                  'display': 'flex',
                  'alignItems': 'center',
                  'px': 2.5,
                  'py': 1,
                  '&:hover': { backgroundColor: '#f9fafb' },
                }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {proposal.proposalNumber} - {proposal.proposalDescription}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
                  <IconButton
                    size='small'
                    onClick={() => handleDuplicate(proposal)}
                    disabled={isDuplicating}
                    sx={{ 'color': '#6b7280', '&:hover': { color: '#111827', backgroundColor: '#f3f4f6' } }}>
                    {isDuplicating ? <CircularProgress size={14} /> : <CopyAllRounded sx={{ fontSize: 16 }} />}
                  </IconButton>
                  <IconButton
                    size='small'
                    onClick={() => { setSelectedProposal(proposal); setDeleteDialogOpen(true); }}
                    disabled={isDeleting}
                    sx={{ 'color': '#9ca3af', '&:hover': { color: '#dc2626', backgroundColor: '#fef2f2' } }}>
                    {isDeleting ? <CircularProgress size={14} /> : <DeleteIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Box>
              </Box>
              {index < filteredData.length - 1 && <Divider sx={{ borderColor: '#f3f4f6' }} />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      <DeleteConfirmationDialog
        title={
          <>
            <Typography component='span' sx={{ fontSize: '0.825rem' }}>
              Delete{' '}
            </Typography>
            <Typography component='span' sx={{ fontSize: '0.825rem', fontWeight: 600 }}>
              {selectedProposal?.proposalNumber} - {selectedProposal?.proposalDescription}
            </Typography>
            <Typography component='span' sx={{ fontSize: '0.825rem' }}>?</Typography>
          </>
        }
        content='This action cannot be undone. All associated data will be permanently removed.'
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          setDeleteDialogOpen(false);
          setIsDeleting(true);
          await deleteProposalAndAssociatedData(selectedProposal!.id!);
          setIsDeleting(false);
        }}
      />
    </Dialog>
  );
};

export default EditProposalsDialog;

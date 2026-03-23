import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Typography } from '@mui/material';

interface DeleteConfirmationDialogProps {
  title: React.ReactNode;
  content: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  title, content, open, onClose, onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: 400 },
      }}>
      <DialogTitle sx={{ fontSize: '0.925rem', fontWeight: 600, color: '#111827', pb: 0.5 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{ 'textTransform': 'none', 'fontSize': '0.85rem', 'fontWeight': 500, 'color': '#6b7280', 'borderRadius': 1, 'px': 1.5, 'border': '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f3f4f6' } }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          autoFocus
          sx={{ 'textTransform': 'none', 'fontSize': '0.85rem', 'fontWeight': 600, 'color': '#ffffff', 'backgroundColor': '#dc2626', 'borderRadius': 1, 'px': 2, '&:hover': { backgroundColor: '#b91c1c' } }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;

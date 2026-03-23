import React, { ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import { parseISO, format, isValid } from 'date-fns';
import { PatternFormat } from 'react-number-format';

import {
  Proposal,
  UnitedStatesStates,
  BidType,
  ProposalStatus,
} from '../../../models/proposal';

interface ProposalDetailsProps {
  editData: Partial<Proposal>;
  isEditMode: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (event: SelectChangeEvent<unknown>, child: React.ReactNode) => void;
  handleValueChange: (field: keyof Proposal, value: string) => void;
  handleSaveClick: () => void;
  handleCancelClick: () => void;
  handleEditClick: () => void;
}

// Shared field display component
function FieldDisplay({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minHeight: 44 }}>
      <Typography sx={{ fontSize: '0.675rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.825rem', fontWeight: 500, color: '#111827', lineHeight: 1.4 }}>
        {value || '\u2014'}
      </Typography>
    </Box>
  );
}

// Shared edit field styling
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    'borderRadius': 1,
    'fontSize': '0.825rem',
    'backgroundColor': '#f9fafb',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#d1d5db' },
    '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.8rem', color: '#6b7280' },
};

const ProposalDetails: React.FC<ProposalDetailsProps> = ({
  editData, isEditMode, handleChange, handleSelectChange,
  handleValueChange, handleSaveClick, handleCancelClick, handleEditClick,
}) => {
  const sanitizePhoneDigits = (value?: string) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1, 11);
    return digits.slice(0, 10);
  };

  const formatPhone = (value?: string) => {
    if (!value) return '\u2014';
    const d = sanitizePhoneDigits(value);
    if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    return value || '\u2014';
  };

  const fmtVal = (value?: Proposal[keyof Proposal] | string | number | null) => {
    if (value === undefined || value === null || value === '') return '\u2014';
    return value.toString().toUpperCase();
  };

  const fmtDate = (value?: string) => {
    if (!value) return '\u2014';
    return isValid(parseISO(value)) ? format(parseISO(value), 'MM/dd/yyyy') : value;
  };

  const proposalFields = [
    { label: 'Proposal #', field: 'proposalNumber' },
    { label: 'Description', field: 'proposalDescription' },
    { label: 'Job', field: 'job' },
    { label: 'CO #', field: 'coNumber' },
    { label: 'Owner', field: 'proposalOwner' },
    { label: 'Job-Site Address', field: 'jobSiteAddress' },
    { label: 'City', field: 'projectCity' },
  ];

  const dateFields = [
    { label: 'Estimator(s)', field: 'proposalEstimators' },
    { label: 'Date Received', field: 'proposalDateReceived', type: 'date' },
    { label: 'Due Date', field: 'proposalDateDue', type: 'date' },
    { label: 'Project Start', field: 'projectStartDate', type: 'date' },
    { label: 'Project End', field: 'projectEndDate', type: 'date' },
  ];

  const contactFields = [
    { label: 'Contact Name', field: 'contactName' },
    { label: 'Phone', field: 'contactPhone' },
    { label: 'Email', field: 'contactEmail' },
    { label: 'Address', field: 'contactAddress' },
    { label: 'City', field: 'contactCity' },
    { label: 'Zip', field: 'contactZip' },
  ];

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, maxWidth: 1100 }}>
      {/* Header with edit controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography sx={{ fontSize: '0.675rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Proposal Details
        </Typography>
        {isEditMode ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size='small' onClick={handleCancelClick}
              sx={{ 'textTransform': 'none', 'fontSize': '0.775rem', 'fontWeight': 500, 'color': '#6b7280', 'borderRadius': 1, 'px': 1.5, 'border': '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f3f4f6' } }}>
              Cancel
            </Button>
            <Button size='small' onClick={handleSaveClick}
              sx={{ 'textTransform': 'none', 'fontSize': '0.775rem', 'fontWeight': 600, 'color': '#fff', 'backgroundColor': '#111827', 'borderRadius': 1, 'px': 2, '&:hover': { backgroundColor: '#1f2937' } }}>
              Save
            </Button>
          </Box>
        ) : (
          <Button size='small' onClick={handleEditClick}
            sx={{ 'textTransform': 'none', 'fontSize': '0.775rem', 'fontWeight': 500, 'color': '#374151', 'borderRadius': 1, 'px': 1.5, 'border': '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f3f4f6' } }}>
            Edit
          </Button>
        )}
      </Box>

      {/* Proposal Information */}
      <Box sx={{ mb: 3, pb: 2.5, borderBottom: '1px solid #e5e7eb' }}>
        <Typography sx={{ fontSize: '0.675rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
          Project Information
        </Typography>
        <Grid container spacing={2}>
          {proposalFields.map(({ label, field }) => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              {isEditMode ? (
                <TextField label={label} variant='outlined' size='small' fullWidth name={field}
                  value={editData[field as keyof Proposal] || ''} onChange={handleChange} sx={fieldSx} />
              ) : (
                <FieldDisplay label={label} value={fmtVal(editData[field as keyof Proposal])} />
              )}
            </Grid>
          ))}

          {/* State */}
          <Grid item xs={12} sm={6} md={4}>
            {isEditMode ? (
              <FormControl variant='outlined' size='small' fullWidth sx={fieldSx}>
                <InputLabel>State</InputLabel>
                <Select label='State' name='projectState' value={editData.projectState || ''} onChange={handleSelectChange}>
                  {Object.values(UnitedStatesStates).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <FieldDisplay label='State' value={fmtVal(editData.projectState)} />
            )}
          </Grid>

          {dateFields.map(({ label, field, type }) => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              {isEditMode ? (
                <TextField label={label} variant='outlined' size='small' fullWidth name={field}
                  type={type || 'text'}
                  value={type === 'date' ? (editData[field as keyof Proposal] as string)?.slice(0, 10) || '' : editData[field as keyof Proposal] || ''}
                  onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldSx} />
              ) : (
                <FieldDisplay label={label} value={type === 'date' ? fmtDate(editData[field as keyof Proposal] as string) : fmtVal(editData[field as keyof Proposal])} />
              )}
            </Grid>
          ))}

          {/* Bid Type */}
          <Grid item xs={12} sm={6} md={4}>
            {isEditMode ? (
              <FormControl variant='outlined' size='small' fullWidth sx={fieldSx}>
                <InputLabel>Bid Type</InputLabel>
                <Select label='Bid Type' name='bidType' value={editData.bidType || ''} onChange={handleSelectChange}>
                  {Object.values(BidType).map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <FieldDisplay label='Bid Type' value={fmtVal(editData.bidType)} />
            )}
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6} md={4}>
            {isEditMode ? (
              <FormControl variant='outlined' size='small' fullWidth sx={fieldSx}>
                <InputLabel>Status</InputLabel>
                <Select label='Status' name='proposalStatus' value={editData.proposalStatus || ''} onChange={handleSelectChange}>
                  {Object.values(ProposalStatus).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <FieldDisplay label='Status' value={fmtVal(editData.proposalStatus)} />
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Contact Information */}
      <Box>
        <Typography sx={{ fontSize: '0.675rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
          Contact Information
        </Typography>
        <Grid container spacing={2}>
          {contactFields.map(({ label, field }) => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              {isEditMode ? (
                field === 'contactPhone' ? (
                  <PatternFormat format='(###) ###-####' mask='_' allowEmptyFormatting valueIsNumericString
                    isAllowed={({ value }) => value.length <= 10}
                    value={sanitizePhoneDigits((editData.contactPhone as string) || '')}
                    onValueChange={({ value }) => handleValueChange('contactPhone', sanitizePhoneDigits(value))}
                    customInput={TextField} label={label} variant='outlined' size='small' fullWidth name={field}
                    placeholder='(555) 123-4567' InputProps={{ inputMode: 'tel' }} sx={fieldSx} />
                ) : (
                  <TextField label={label} variant='outlined' size='small' fullWidth name={field}
                    value={editData[field as keyof Proposal] || ''} onChange={handleChange} sx={fieldSx} />
                )
              ) : (
                <FieldDisplay label={label} value={field === 'contactPhone' ? formatPhone(editData[field as keyof Proposal] as string) : fmtVal(editData[field as keyof Proposal])} />
              )}
            </Grid>
          ))}

          {/* Contact State */}
          <Grid item xs={12} sm={6} md={4}>
            {isEditMode ? (
              <FormControl variant='outlined' size='small' fullWidth sx={fieldSx}>
                <InputLabel>State</InputLabel>
                <Select label='State' name='contactState' value={editData.contactState || ''} onChange={handleSelectChange}>
                  {Object.values(UnitedStatesStates).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <FieldDisplay label='State' value={fmtVal(editData.contactState)} />
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProposalDetails;

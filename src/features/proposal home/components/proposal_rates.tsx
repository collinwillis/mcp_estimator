import React, { ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Box,
} from '@mui/material';

import { Proposal } from '../../../models/proposal';

interface ProposalRatesProps {
  editData: Partial<Proposal>;
  isEditMode: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveClick: () => void;
  handleCancelClick: () => void;
  handleEditClick: () => void;
}

// Field display (read-only)
function FieldDisplay({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minHeight: 44 }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    'borderRadius': 1,
    'fontSize': '0.875rem',
    'backgroundColor': '#f9fafb',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#d1d5db' },
    '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem', color: '#6b7280' },
};

const ProposalRates: React.FC<ProposalRatesProps> = ({
  editData, isEditMode, handleChange, handleSaveClick, handleCancelClick, handleEditClick,
}) => {
  const baseRates = [
    { label: 'Craft Base Rate', field: 'craftBaseRate', prefix: '$' },
    { label: 'Weld Base Rate', field: 'weldBaseRate', prefix: '$' },
    { label: 'Rig Rate', field: 'rigRate', prefix: '$' },
    { label: 'Subsistence Rate', field: 'subsistenceRate', prefix: '$' },
  ];

  const overheadRates = [
    { label: 'Burden Rate', field: 'burdenRate', suffix: '%' },
    { label: 'Overhead Rate', field: 'overheadRate', suffix: '%' },
    { label: 'Consumables Rate', field: 'consumablesRate', suffix: '%' },
    { label: 'Fuel Rate', field: 'fuelRate', suffix: '%' },
  ];

  const taxRates = [
    { label: 'Sales Tax Rate', field: 'salesTaxRate', suffix: '%' },
    { label: 'Equipment Tax Rate', field: 'useTaxRate', suffix: '%' },
  ];

  const profitRates = [
    { label: 'Labor Profit', field: 'laborProfitRate', suffix: '%' },
    { label: 'Material Profit', field: 'materialProfitRate', suffix: '%' },
    { label: 'Equipment Profit', field: 'equipmentProfitRate', suffix: '%' },
    { label: 'Subcontractor Profit', field: 'subContractorProfitRate', suffix: '%' },
    { label: 'Rig Profit', field: 'rigProfitRate', suffix: '%' },
  ];

  const fmtVal = (value: any, prefix?: string, suffix?: string) => {
    if (value === undefined || value === null) return '\u2014';
    return `${prefix || ''}${parseFloat(value?.toString() || '0').toFixed(2)}${suffix || ''}`;
  };

  const renderSection = (title: string, fields: { label: string; field: string; prefix?: string; suffix?: string }[]) => (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, pb: 0.5, borderBottom: '1px solid #f3f4f6' }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {fields.map(({ label, field, prefix, suffix }) => (
          <Grid item xs={6} sm={4} md={3} key={field}>
            {isEditMode ? (
              <TextField label={label} variant='outlined' size='small' fullWidth name={field}
                value={editData[field as keyof Proposal]?.toString() || ''} onChange={handleChange}
                InputProps={{
                  startAdornment: prefix ? <InputAdornment position='start'><Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>{prefix}</Typography></InputAdornment> : undefined,
                  endAdornment: suffix ? <InputAdornment position='end'><Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>{suffix}</Typography></InputAdornment> : undefined,
                }}
                sx={fieldSx} />
            ) : (
              <FieldDisplay label={label} value={fmtVal(editData[field as keyof Proposal], prefix, suffix)} />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, maxWidth: 1100 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Rates Configuration
        </Typography>
        {isEditMode ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size='small' onClick={handleCancelClick}
              sx={{ 'textTransform': 'none', 'fontSize': '0.85rem', 'fontWeight': 500, 'color': '#6b7280', 'borderRadius': 1, 'px': 1.5, 'border': '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f3f4f6' } }}>
              Cancel
            </Button>
            <Button size='small' onClick={handleSaveClick}
              sx={{ 'textTransform': 'none', 'fontSize': '0.85rem', 'fontWeight': 600, 'color': '#fff', 'backgroundColor': '#111827', 'borderRadius': 1, 'px': 2, '&:hover': { backgroundColor: '#1f2937' } }}>
              Save
            </Button>
          </Box>
        ) : (
          <Button size='small' onClick={handleEditClick}
            sx={{ 'textTransform': 'none', 'fontSize': '0.85rem', 'fontWeight': 500, 'color': '#374151', 'borderRadius': 1, 'px': 1.5, 'border': '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f3f4f6' } }}>
            Edit
          </Button>
        )}
      </Box>

      {renderSection('Base Labor Rates', baseRates)}
      {renderSection('Overhead & Burden', overheadRates)}
      {renderSection('Tax Rates', taxRates)}
      {renderSection('Profit Margins', profitRates)}
    </Box>
  );
};

export default ProposalRates;

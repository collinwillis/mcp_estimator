import React, { ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { Proposal } from '../../../models/proposal';

interface ProposalRatesProps {
  editData: Partial<Proposal>;
  isEditMode: boolean;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSaveClick: () => void;
  handleCancelClick: () => void;
  handleEditClick: () => void;
}

const ProposalRates: React.FC<ProposalRatesProps> = ({
  editData,
  isEditMode,
  handleChange,
  handleSaveClick,
  handleCancelClick,
  handleEditClick,
}) => {
  const rateFields = [
    // Base Labor Rates
    { label: 'Craft Base Rate', field: 'craftBaseRate', prefix: '$' },
    { label: 'Weld Base Rate', field: 'weldBaseRate', prefix: '$' },
    { label: 'Rig Rate', field: 'rigRate', prefix: '$' },
    { label: 'Subsistence Rate', field: 'subsistenceRate', prefix: '$' },
    
    // Burden & Overhead Costs
    { label: 'Burden Rate', field: 'burdenRate', suffix: '%' },
    { label: 'Overhead Rate', field: 'overheadRate', suffix: '%' },
    { label: 'Consumables Rate', field: 'consumablesRate', suffix: '%' },
    { label: 'Fuel Rate', field: 'fuelRate', suffix: '%' },
    
    // Tax Rates
    { label: 'Sales Tax Rate', field: 'salesTaxRate', suffix: '%' },
    { label: 'Equip Tax Rate', field: 'useTaxRate', suffix: '%' },
    
    // Profit Margins
    { label: 'Labor Profit Rate', field: 'laborProfitRate', suffix: '%' },
    { label: 'Material Profit Rate', field: 'materialProfitRate', suffix: '%' },
    {
      label: 'Equipment Profit Rate',
      field: 'equipmentProfitRate',
      suffix: '%',
    },
    {
      label: 'Sub Contractor Profit Rate',
      field: 'subContractorProfitRate',
      suffix: '%',
    },
    { label: 'Rig Profit Rate', field: 'rigProfitRate', suffix: '%' },
  ];

  return (
    <Box sx={{ padding: 2, width: '100%' }}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 2 }}>
        <Typography variant='h5'>Rates</Typography>
        {isEditMode ? (
          <Box>
            <IconButton color='primary' onClick={handleSaveClick}>
              <SaveIcon />
            </IconButton>
            <IconButton color='secondary' onClick={handleCancelClick}>
              <CancelIcon />
            </IconButton>
          </Box>
        ) : (
          <IconButton color='primary' onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {/* Rates */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Rates
          </Typography>
          <Grid container spacing={2}>
            {rateFields.map(({ label, field, prefix, suffix }) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                {isEditMode ? (
                  <TextField
                    label={label}
                    variant='outlined'
                    size='small'
                    fullWidth
                    name={field}
                    value={editData[field as keyof Proposal]?.toString() || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: prefix ? (
                        <InputAdornment position='start'>
                          {prefix}
                        </InputAdornment>
                      ) : undefined,
                      endAdornment: suffix ? (
                        <InputAdornment position='end'>{suffix}</InputAdornment>
                      ) : undefined,
                    }}
                  />
                ) : (
                  <>
                    <Typography variant='subtitle2' color='textSecondary'>
                      {label}
                    </Typography>
                    <Typography variant='body1'>
                      {editData[field as keyof Proposal] !== undefined
                        ? `${prefix || ''}${parseFloat(
                            editData[field as keyof Proposal]?.toString() ||
                              '0',
                          ).toFixed(2)}${suffix || ''}`
                        : '-'}
                    </Typography>
                  </>
                )}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProposalRates;
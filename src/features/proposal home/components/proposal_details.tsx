import React, { ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import { Box } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { Proposal, UnitedStatesStates } from '../../../models/proposal';
import FormattedNumberInput from '../../../components/formatted_number_input'; // Import the FormattedNumberInput component

interface ProposalDetailsProps {
  editData: Partial<Proposal>;
  isEditMode: boolean;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (e: SelectChangeEvent<string>) => void;
  handleSaveClick: () => void;
  handleCancelClick: () => void;
  handleEditClick: () => void;
}

// Helper function to format rates
const formatRate = (
  value: string | number | undefined,
  prefix?: string,
  suffix?: string,
) => {
  if (value === undefined) return '';
  const formattedValue = parseFloat(value.toString()).toFixed(2);
  return `${prefix || ''}${formattedValue}${suffix || ''}`;
};

const ProposalDetails: React.FC<ProposalDetailsProps> = ({
  editData,
  isEditMode,
  handleChange,
  handleSelectChange,
  handleSaveClick,
  handleCancelClick,
  handleEditClick,
}) => {
  // Define the prefixes and suffixes for each rate field
  const rateFields = [
    { label: 'Craft Base Rate', value: 'craftBaseRate', prefix: '$' },
    { label: 'Weld Base Rate', value: 'weldBaseRate', prefix: '$' },
    { label: 'Subsistence Rate', value: 'subsistenceRate', prefix: '$' },
    { label: 'Use Tax Rate', value: 'useTaxRate', suffix: '%' },
    { label: 'Sales Tax Rate', value: 'salesTaxRate', suffix: '%' },
    { label: 'Overhead Rate', value: 'overheadRate', suffix: '%' },
    { label: 'Consumables Rate', value: 'consumablesRate', suffix: '%' },
    { label: 'Burden Rate', value: 'burdenRate', suffix: '%' },
    { label: 'Fuel Rate', value: 'fuelRate', suffix: '%' },
    { label: 'Rig Rate', value: 'rigRate', prefix: '$' },
    { label: 'Labor Profit Rate', value: 'laborProfitRate', suffix: '%' },
    { label: 'Material Profit Rate', value: 'materialProfitRate', suffix: '%' },
    {
      label: 'Equipment Profit Rate',
      value: 'equipmentProfitRate',
      suffix: '%',
    },
    {
      label: 'Sub Contractor Profit Rate',
      value: 'subContractorProfitRate',
      suffix: '%',
    },
    { label: 'Rig Profit Rate', value: 'rigProfitRate', suffix: '%' },
  ];

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h4' sx={{ mb: 2 }}>
            Proposal Details
          </Typography>
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
        <Grid container spacing={2}>
          {[
            { label: 'Proposal #', value: 'proposalNumber' },
            { label: 'Job', value: 'job' },
            { label: 'CO #', value: 'coNumber' },
            { label: 'Description', value: 'proposalDescription' },
            { label: 'Owner', value: 'proposalOwner' },
            { label: 'City', value: 'projectCity' },
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={6} md={4} key={value}>
              {isEditMode ? (
                <TextField
                  label={label}
                  variant='filled'
                  size='small'
                  fullWidth
                  name={value}
                  value={editData[value as keyof Proposal] || ''}
                  onChange={handleChange}
                />
              ) : (
                <>
                  <Typography variant='caption' color='textSecondary'>
                    {label}
                  </Typography>
                  <Typography>{editData[value as keyof Proposal]}</Typography>
                </>
              )}
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={4}>
            {isEditMode ? (
              <FormControl variant='filled' size='small' fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  name='contactState'
                  value={editData.contactState || ''}
                  onChange={handleSelectChange}>
                  {Object.values(UnitedStatesStates).map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                <Typography variant='caption' color='textSecondary'>
                  State
                </Typography>
                <Typography>{editData.contactState}</Typography>
              </>
            )}
          </Grid>
        </Grid>
        <Typography variant='h6' sx={{ mt: 4, mb: 2 }}>
          Contact Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[
            { label: 'Contact', value: 'contactName' },
            { label: 'Address', value: 'contactAddress' },
            { label: 'City', value: 'contactCity' },
            { label: 'Zip', value: 'contactZip' },
            { label: 'Phone', value: 'contactPhone' },
            { label: 'Email', value: 'contactEmail' },
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={6} md={4} key={value}>
              {isEditMode ? (
                <TextField
                  label={label}
                  variant='filled'
                  size='small'
                  fullWidth
                  name={value}
                  value={editData[value as keyof Proposal] || ''}
                  onChange={handleChange}
                />
              ) : (
                <>
                  <Typography variant='caption' color='textSecondary'>
                    {label}
                  </Typography>
                  <Typography>{editData[value as keyof Proposal]}</Typography>
                </>
              )}
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={4}>
            {isEditMode ? (
              <FormControl variant='filled' size='small' fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  name='projectState'
                  value={editData.projectState || ''}
                  onChange={handleSelectChange}>
                  {Object.values(UnitedStatesStates).map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                <Typography variant='caption' color='textSecondary'>
                  State
                </Typography>
                <Typography>{editData.projectState}</Typography>
              </>
            )}
          </Grid>
        </Grid>
        <Typography variant='h6' sx={{ mt: 4, mb: 2 }}>
          Rates
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {rateFields.map(({ label, value, prefix, suffix }) => (
            <Grid item xs={12} sm={6} md={4} key={value}>
              {isEditMode ? (
                <FormattedNumberInput
                  label={label}
                  value={editData[value as keyof Proposal]?.toString() || ''}
                  setValue={(newValue) =>
                    handleChange({
                      target: { name: value, value: newValue },
                    } as ChangeEvent<HTMLInputElement>)
                  }
                  prefix={prefix}
                  suffix={suffix}
                />
              ) : (
                <>
                  <Typography variant='caption' color='textSecondary'>
                    {label}
                  </Typography>
                  <Typography>
                    {formatRate(
                      editData[value as keyof Proposal],
                      prefix,
                      suffix,
                    )}
                  </Typography>
                </>
              )}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProposalDetails;

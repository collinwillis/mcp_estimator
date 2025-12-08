import React, { ChangeEvent } from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
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
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode,
  ) => void;
  handleValueChange: (field: keyof Proposal, value: string) => void;
  handleSaveClick: () => void;
  handleCancelClick: () => void;
  handleEditClick: () => void;
}

const ProposalDetails: React.FC<ProposalDetailsProps> = ({
  editData,
  isEditMode,
  handleChange,
  handleSelectChange,
  handleValueChange,
  handleSaveClick,
  handleCancelClick,
  handleEditClick,
}) => {

  const sanitizePhoneDigits = (value?: string) => {
    if (!value) {
      return '';
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return digits.slice(1, 11);
    }
    return digits.slice(0, 10);
  };

  const formatPhoneNumberForDisplay = (value?: string) => {
    if (!value) {
      return '-';
    }
    const digits = sanitizePhoneDigits(value);
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return value || '-';
  };


  const formatDisplayValue = (
    value?: Proposal[keyof Proposal] | string | number | null,
  ) => {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    return value.toString().toUpperCase();
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

  const contactFields = [
    { label: 'Contact Name', field: 'contactName' },
    { label: 'Phone', field: 'contactPhone' },
    { label: 'Email', field: 'contactEmail' },
    { label: 'Address', field: 'contactAddress' },
    { label: 'City', field: 'contactCity' },
    { label: 'Zip', field: 'contactZip' },
  ];

  // New fields to be added
  const additionalProposalFields = [
    { label: 'Estimator(s)', field: 'proposalEstimators' },
    { label: 'Date Received', field: 'proposalDateReceived', type: 'date' },
    { label: 'Due Date', field: 'proposalDateDue', type: 'date' },
    { label: 'Project Start Date', field: 'projectStartDate', type: 'date' },
    { label: 'Project End Date', field: 'projectEndDate', type: 'date' },
  ];

  return (
    <Box sx={{ padding: 2, width: '100%' }}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 2 }}>
        <Typography variant='h5'>Proposal Details</Typography>
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

      {/* Proposal Information */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Proposal Information
          </Typography>
          <Grid container spacing={2}>
            {proposalFields.map(({ label, field }) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                {isEditMode ? (
                  <TextField
                    label={label}
                    variant='outlined'
                    size='small'
                    fullWidth
                    name={field}
                    value={editData[field as keyof Proposal] || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <>
                    <Typography variant='subtitle2' color='textSecondary'>
                      {label}
                    </Typography>
                    <Typography variant='body1'>
                      {formatDisplayValue(editData[field as keyof Proposal])}
                    </Typography>
                  </>
                )}
              </Grid>
            ))}

            {/* State Field */}
            <Grid item xs={12} sm={6} md={4}>
              {isEditMode ? (
                <FormControl variant='outlined' size='small' fullWidth>
                  <InputLabel>State</InputLabel>
                  <Select
                    label='State'
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
                  <Typography variant='subtitle2' color='textSecondary'>
                    State
                  </Typography>
                    <Typography variant='body1'>
                      {formatDisplayValue(editData.projectState)}
                    </Typography>
                </>
              )}
            </Grid>

            {/* Additional Proposal Fields */}
            {additionalProposalFields.map(({ label, field, type }) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                {isEditMode ? (
                  <TextField
                    label={label}
                    variant='outlined'
                    size='small'
                    fullWidth
                    name={field}
                    type={type || 'text'}
                    value={
                      type === 'date'
                        ? editData[field as keyof Proposal]
                          ? (editData[field as keyof Proposal] as string).slice(
                              0,
                              10,
                            )
                          : ''
                        : editData[field as keyof Proposal] || ''
                    }
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                ) : (
                  <>
                    <Typography variant='subtitle2' color='textSecondary'>
                      {label}
                    </Typography>
                    <Typography variant='body1'>
                      {editData[field as keyof Proposal]
                        ? type === 'date'
                          ? formatDisplayValue(
                              isValid(
                                parseISO(
                                  editData[field as keyof Proposal] as string,
                                ),
                              )
                                ? format(
                                    parseISO(
                                      editData[field as keyof Proposal] as string,
                                    ),
                                    'MM/dd/yyyy',
                                  )
                                : 'Invalid Date',
                            )
                          : formatDisplayValue(editData[field as keyof Proposal])
                        : '-'}
                    </Typography>
                  </>
                )}
              </Grid>
            ))}

            {/* Bid Type Field */}
            <Grid item xs={12} sm={6} md={4}>
              {isEditMode ? (
                <FormControl variant='outlined' size='small' fullWidth>
                  <InputLabel>Bid Type</InputLabel>
                  <Select
                    label='Bid Type'
                    name='bidType'
                    value={editData.bidType || ''}
                    onChange={handleSelectChange}>
                    {Object.values(BidType).map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Bid Type
                  </Typography>
                  <Typography variant='body1'>
                    {formatDisplayValue(editData.bidType)}
                  </Typography>
                </>
              )}
            </Grid>

            {/* Status Field */}
            <Grid item xs={12} sm={6} md={4}>
              {isEditMode ? (
                <FormControl variant='outlined' size='small' fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label='Status'
                    name='proposalStatus'
                    value={editData.proposalStatus || ''}
                    onChange={handleSelectChange}>
                    {Object.values(ProposalStatus).map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Status
                  </Typography>
                  <Typography variant='body1'>
                    {formatDisplayValue(editData.proposalStatus)}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            {contactFields.map(({ label, field }) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                {isEditMode ? (
                  field === 'contactPhone' ? (
                    <PatternFormat
                      format='(###) ###-####'
                      mask='_'
                      allowEmptyFormatting
                      valueIsNumericString
                      isAllowed={({ value }) => value.length <= 10}
                      value={sanitizePhoneDigits(
                        (editData.contactPhone as string) || '',
                      )}
                      onValueChange={({ value }) =>
                        handleValueChange('contactPhone', sanitizePhoneDigits(value))
                      }
                      customInput={TextField}
                      label={label}
                      variant='outlined'
                      size='small'
                      fullWidth
                      name={field}
                      placeholder='(555) 123-4567'
                      InputProps={{ inputMode: 'tel' }}
                    />
                  ) : (
                    <TextField
                      label={label}
                      variant='outlined'
                      size='small'
                      fullWidth
                      name={field}
                      value={editData[field as keyof Proposal] || ''}
                      onChange={handleChange}
                    />
                  )
                ) : (
                  <>
                    <Typography variant='subtitle2' color='textSecondary'>
                      {label}
                    </Typography>
                    <Typography variant='body1'>
                      {field === 'contactPhone'
                        ? formatPhoneNumberForDisplay(
                            editData[field as keyof Proposal] as string,
                          )
                        : formatDisplayValue(editData[field as keyof Proposal])}
                    </Typography>
                  </>
                )}
              </Grid>
            ))}

            {/* Contact State Field */}
            <Grid item xs={12} sm={6} md={4}>
              {isEditMode ? (
                <FormControl variant='outlined' size='small' fullWidth>
                  <InputLabel>State</InputLabel>
                  <Select
                    label='State'
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
                  <Typography variant='subtitle2' color='textSecondary'>
                    State
                  </Typography>
                  <Typography variant='body1'>
                    {formatDisplayValue(editData.contactState)}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>


    </Box>
  );
};

export default ProposalDetails;

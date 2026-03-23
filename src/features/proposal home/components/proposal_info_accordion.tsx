import React, { useEffect, useState } from 'react';
import 'react-phone-number-input/style.css';

import { ExpandMoreOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Dialog,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
} from '@mui/material';

import { updateSingleProposal } from '../../../api/proposal';
import { useCurrentProposalListener } from '../../../hooks/current_proposal_listener_hook';
import { useUserProfile } from '../../../hooks/user_profile_hook';
import { FirestoreProposal } from '../../../models/firestore models/proposal_firestore';
import {
  BidType,
  ProposalStatus,
  UnitedStatesStates,
} from '../../../models/proposal';

interface ProposalInfoAccordionProps {
  proposalId: string;
}

export default function ProposalInfoAccordion({
  proposalId,
}: ProposalInfoAccordionProps) {
  const currentProposal = useCurrentProposalListener({
    proposalId,
  });
  const { hasWritePermissions } = useUserProfile();

  // Proposal States
  const [proposalNumber, setProposalNumber] = useState('');
  const [job, setJob] = useState('');
  const [coNumber, setCoNumber] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [jobLocationCity, setJobLocationCity] = useState('');
  const [contactInfoState, setContactInfoState] = useState('');

  // Contact States
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [proposalInfoState, setProposalInfoState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Info States
  const [estimator, setEstimator] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [dateDue, setDateDue] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [bidType, setBidType] = useState('');
  const [status, setStatus] = useState('');

  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    setProposalNumber(currentProposal?.proposalNumber?.toString() || '');
    setJob(currentProposal?.job || '');
    setCoNumber(currentProposal?.coNumber?.toString() || '');
    setDescription(currentProposal?.proposalDescription || '');
    setOwner(currentProposal?.proposalOwner || '');
    setJobLocationCity(currentProposal?.projectCity || '');
    setContactInfoState(currentProposal?.contactState || '');

    setContact(currentProposal?.contactName || '');
    setAddress(currentProposal?.contactAddress || '');
    setCity(currentProposal?.contactCity || '');
    setProposalInfoState(currentProposal?.projectState || '');
    setZip(currentProposal?.contactZip?.toString() || '');
    setPhone(currentProposal?.contactPhone || '');
    setEmail(currentProposal?.contactEmail || '');

    setEstimator(currentProposal?.proposalEstimators || '');
    setDateReceived(currentProposal?.proposalDateReceived || '');
    setDateDue(currentProposal?.proposalDateDue || '');
    setProjectStartDate(currentProposal?.projectStartDate || '');
    setProjectEndDate(currentProposal?.projectEndDate || '');
    setBidType(currentProposal?.bidType || '');
    setStatus(currentProposal?.proposalStatus || '');
  }, [currentProposal]);

  const formatPhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Strip all non-numeric characters
    if (input.length <= 3) {
      setPhone(input);
    } else if (input.length <= 6) {
      setPhone(`(${input.substring(0, 3)}) ${input.substring(3)}`);
    } else {
      setPhone(
        `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6, 10)}`,
      );
    }
  };

  const onSubmit = async () => {
    console.log('TEST');
    const newProposal: FirestoreProposal = new FirestoreProposal({
      ...currentProposal as any,
      proposalNumber: parseInt(proposalNumber),
      job,
      coNumber: parseInt(coNumber),
      proposalEstimators: estimator,
      proposalDescription: description,
      proposalOwner: owner,
      projectCity: jobLocationCity,
      contactState: contactInfoState,
      contactName: contact,
      contactAddress: address,
      contactCity: city,
      projectState: proposalInfoState,
      contactZip: parseInt(zip),
      contactPhone: phone,
      contactEmail: email,
      proposalDateReceived: dateReceived,
      proposalDateDue: dateDue,
      projectStartDate,
      projectEndDate,
      bidType,
      proposalStatus: status,
    });
    await updateSingleProposal({
      proposalId,
      proposal: newProposal,
    });
    setAlertOpen(true);
  };

  return (
    <Box mb={2} mt={2}>
      <Accordion elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant='h6'>Proposal Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display='flex' flexDirection='column' width='100%' height='100%'>
            <Divider sx={{ mb: 2 }} />
            <Box display='flex' flexDirection='row'>
              <Box width='66.6%' p={2} display='flex' flexDirection='column'>
                <Typography variant='subtitle1' gutterBottom>
                  Project Information
                </Typography>
                <Box display='flex' flexDirection='row' gap={2}>
                  <Box width='50%'>
                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='number'
                      label='Proposal #'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setProposalNumber(e.target.value || '')}
                      value={proposalNumber ?? ''}
                    />

                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='text'
                      label='Job'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setJob(e.target.value)}
                      value={job ?? ''}
                    />

                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='number'
                      label='CO #'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setCoNumber(e.target.value || '')}
                      value={coNumber ?? ''}
                    />

                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='text'
                      label='Description'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setDescription(e.target.value)}
                      value={description ?? ''}
                    />

                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='text'
                      label='Owner'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setOwner(e.target.value)}
                      value={owner ?? ''}
                    />

                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='text'
                      label='City'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setJobLocationCity(e.target.value)}
                      value={jobLocationCity ?? ''}
                    />
                    <FormControl variant='filled' fullWidth>
                      <InputLabel shrink>State</InputLabel>
                      <Select
                        disabled={!hasWritePermissions}
                        value={proposalInfoState ?? ''}
                        onChange={(e) => setProposalInfoState(e.target.value)}>
                        {Object.values(UnitedStatesStates).map((item) => (
                          <MenuItem key={item} value={item}>
                            <ListItemText primary={item} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box width='50%'>
                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='text'
                      label='Estimator(s)'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setEstimator(e.target.value)}
                      value={estimator ?? ''}
                    />
                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='date'
                      label='Date Rec.'
                      placeholder='none'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setDateReceived(e.target.value)}
                      value={dateReceived?.toString() ?? ''}
                    />
                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='date'
                      label='Due Date'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setDateDue(e.target.value)}
                      value={dateDue ?? ''}
                    />
                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='date'
                      label='Project Start Date'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setProjectStartDate(e.target.value)}
                      value={projectStartDate ?? ''}
                    />
                    <TextField
                      InputProps={{ readOnly: !hasWritePermissions }}
                      variant='filled'
                      size='small'
                      type='date'
                      label='Project End Date'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setProjectEndDate(e.target.value)}
                      value={projectEndDate ?? ''}
                    />
                    <FormControl variant='filled' fullWidth>
                      <InputLabel shrink>Bid Type</InputLabel>
                      <Select
                        disabled={!hasWritePermissions}
                        value={bidType ?? ''}
                        onChange={(e) => setBidType(e.target.value)}>
                        {Object.values(BidType).map((item) => (
                          <MenuItem key={item} value={item}>
                            <ListItemText primary={item} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl variant='filled' fullWidth>
                      <InputLabel shrink>Status</InputLabel>
                      <Select
                        disabled={!hasWritePermissions}
                        value={status ?? ''}
                        onChange={(e) => setStatus(e.target.value)}>
                        {Object.values(ProposalStatus).map((item) => (
                          <MenuItem key={item} value={item}>
                            <ListItemText primary={item} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
              <Box
                width='33.3%'
                display='flex'
                flexDirection='column'
                p={2}
                borderLeft='1px solid #e0e0e0'>
                <Typography variant='subtitle1' gutterBottom>
                  Contact Information
                </Typography>
                <TextField
                  InputProps={{ readOnly: !hasWritePermissions }}
                  variant='filled'
                  size='small'
                  type='text'
                  label='Contact'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setContact(e.target.value)}
                  value={contact ?? ''}
                />

                <TextField
                  InputProps={{ readOnly: !hasWritePermissions }}
                  variant='filled'
                  size='small'
                  type='text'
                  label='Address'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setAddress(e.target.value)}
                  value={address ?? ''}
                />

                <TextField
                  InputProps={{ readOnly: !hasWritePermissions }}
                  variant='filled'
                  size='small'
                  type='text'
                  label='City'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setCity(e.target.value)}
                  value={city ?? ''}
                />
                <FormControl variant='filled' fullWidth>
                  <InputLabel shrink>State</InputLabel>
                  <Select
                    disabled={!hasWritePermissions}
                    value={contactInfoState ?? ''}
                    onChange={(e) => setContactInfoState(e.target.value)}>
                    {Object.values(UnitedStatesStates).map((item) => (
                      <MenuItem key={item} value={item}>
                        <ListItemText primary={item} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  InputProps={{ readOnly: !hasWritePermissions }}
                  variant='filled'
                  size='small'
                  type='number'
                  label='Zip'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setZip(e.target.value)}
                  value={zip ?? ''}
                />

                <TextField
                  InputProps={{ readOnly: !hasWritePermissions }}
                  variant='filled'
                  size='small'
                  label='Phone'
                  fullWidth
                  onChange={formatPhoneNumber}
                  value={phone ?? ''}
                />

                <TextField
                  InputProps={{ readOnly: !hasWritePermissions }}
                  variant='filled'
                  size='small'
                  type='email'
                  label='Email'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email ?? ''}
                />
              </Box>
            </Box>
            <Button
              variant='contained'
              size='large'
              sx={{ width: 200, alignSelf: 'center', mt: 2 }}
              color='primary'
              onClick={onSubmit}>
              Save
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
        <Alert severity='info'>Proposal information successfully saved.</Alert>
      </Dialog>
    </Box>
  );
}

import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, SelectChangeEvent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Alert from '@mui/material/Alert';

import { getCraftLoadedRate } from '../../api/totals';
import BottomPanel from '../../components/bottom_pannel';
import { useCurrentProposal } from '../../hooks/current_proposal_hook';
import { StoreState, estimatorStore } from '../../utils/store';
import WbsDataGrid from './components/wbs_data_grid';
import SelectWbsDialog from './components/select_wbs_dialog';
import { Proposal } from '../../models/proposal';
import ProposalDetails from './components/proposal_details';
import { updateSingleProposal } from '../../api/proposal'; // Import the update function
import { FirestoreProposal } from '../../models/firestore models/proposal_firestore';

function ProposalHomeScreen() {
  const { proposalId } = useParams();
  const [isSelectWbsDialogOpen, setIsSelectWbsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Proposal>>({});
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const currentProposal = useCurrentProposal({ proposalId: proposalId ?? '' });
  const prefs = estimatorStore(
    (state: StoreState) => state.preferences[proposalId!] || [],
  );
  const loadFullProposalData = estimatorStore(
    (state: StoreState) => state.loadFullProposalData,
  );

  useEffect(() => {
    loadFullProposalData(proposalId!);
  }, [proposalId, loadFullProposalData]);

  useEffect(() => {
    if (currentProposal) {
      const craftLoadedRate = getCraftLoadedRate({ proposal: currentProposal });
      console.log(craftLoadedRate);
      setEditData(currentProposal);
    }
  }, [currentProposal]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSaveClick = async () => {
    // Save the edited data
    console.log('Saving data...', editData);
    try {
      await updateSingleProposal({
        proposalId: proposalId!,
        proposal: editData as FirestoreProposal,
      });
      setIsEditMode(false);
      setSuccessDialogOpen(true);
      await loadFullProposalData(proposalId!);
    } catch (error) {
      console.error('Failed to save proposal:', error);
    }
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    setEditData(currentProposal || {});
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.name as keyof Proposal;
    const { value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <Box
      sx={{
        height: '96%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9f9f9',
        width: '100%',
      }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
        <Box
          component={Paper}
          elevation={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
          }}>
          <Box
            sx={{
              p: 4,
              width: '40%',
              borderRight: '2px solid #e0e0e0',
              backgroundColor: '#ffffff',
              overflowY: 'auto',
            }}>
            <ProposalDetails
              editData={editData}
              isEditMode={isEditMode}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleSaveClick={handleSaveClick}
              handleCancelClick={handleCancelClick}
              handleEditClick={handleEditClick}
            />
          </Box>
          <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
            <WbsDataGrid
              openSelectWbsDialog={() => setIsSelectWbsDialogOpen(true)}
            />
          </Box>
        </Box>
      </Box>
      <SelectWbsDialog
        isOpen={isSelectWbsDialogOpen}
        onClose={() => setIsSelectWbsDialogOpen(false)}
        proposalPreferences={prefs}
      />
      <Box
        sx={{
          py: 4,
          bottom: 0,
          width: '100%',
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1,
          backgroundColor: 'white', // Ensure it covers content below
        }}>
        <BottomPanel />
      </Box>
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}>
        <Alert severity='success'>
          Proposal information successfully saved.
        </Alert>
      </Dialog>
    </Box>
  );
}

export default ProposalHomeScreen;

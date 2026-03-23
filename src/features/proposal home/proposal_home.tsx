import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Dialog,
  Alert,
  SelectChangeEvent,
} from '@mui/material';

import { getCraftLoadedRate } from '../../api/totals';
import BottomPanel from '../../components/bottom_pannel';
import { useCurrentProposal } from '../../hooks/current_proposal_hook';
import { StoreState, estimatorStore } from '../../utils/store';
import WbsDataGrid from './components/wbs_data_grid';
import SelectWbsDialog from './components/select_wbs_dialog';
import { Proposal } from '../../models/proposal';
import ProposalDetails from './components/proposal_details';
import ProposalRates from './components/proposal_rates';
import { updateSingleProposal } from '../../api/proposal';
import { FirestoreProposal } from '../../models/firestore models/proposal_firestore';

function ProposalHomeScreen() {
  const { proposalId } = useParams();
  const [isSelectWbsDialogOpen, setIsSelectWbsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Proposal>>({});
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
      setEditData(currentProposal);
    }
  }, [currentProposal]);

  useEffect(() => {
    const savedTab = sessionStorage.getItem('activeTab');
    if (savedTab !== null) {
      setActiveTab(parseInt(savedTab, 10));
    }
  }, []);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSaveClick = async () => {
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

  const handleValueChange = (fieldName: keyof Proposal, value: string) => {
    setEditData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleSelectChange = (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode,
  ) => {
    const value = event.target.value as string;
    setEditData((prevData) => ({
      ...prevData,
      [event.target.name]: value,
    }));
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
    sessionStorage.setItem('activeTab', newValue.toString());
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}>
      {/* Tab bar */}
      <Paper
        square
        elevation={0}
        sx={{
          flexShrink: 0,
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
        }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant='fullWidth'
          sx={{
            'minHeight': 40,
            '& .MuiTab-root': {
              'textTransform': 'none',
              'fontWeight': 500,
              'fontSize': '0.8rem',
              'color': '#6b7280',
              'minHeight': 40,
              'py': 0,
              '&.Mui-selected': {
                color: '#111827',
                fontWeight: 600,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#111827',
              height: 2,
            },
          }}>
          <Tab label='Details' />
          <Tab label='Rates' />
          <Tab label='WBS Data Grid' />
        </Tabs>
      </Paper>

      {/* Scrollable tab content */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>
        {activeTab === 0 && (
          <ProposalDetails
            editData={editData}
            isEditMode={isEditMode}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleValueChange={handleValueChange}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
            handleEditClick={handleEditClick}
          />
        )}
        {activeTab === 1 && (
          <ProposalRates
            editData={editData}
            isEditMode={isEditMode}
            handleChange={handleChange}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
            handleEditClick={handleEditClick}
          />
        )}
        {activeTab === 2 && (
          <WbsDataGrid
            openSelectWbsDialog={() => setIsSelectWbsDialogOpen(true)}
          />
        )}
      </Box>

      <SelectWbsDialog
        isOpen={isSelectWbsDialogOpen}
        onClose={() => setIsSelectWbsDialogOpen(false)}
        proposalPreferences={prefs}
      />

      {/* Bottom panel — fixed at bottom */}
      <BottomPanel />

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

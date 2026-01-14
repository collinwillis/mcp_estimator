import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import { resolveDataset } from '../data/datasets';
import { getProposalDatasetVersions } from '../data/proposal_datasets';
import { useCurrentProposal } from '../hooks/current_proposal_hook';
import { useCurrentWbs } from '../hooks/current_wbs_hook';
import { FirestorePhase } from '../models/firestore models/phase_firestore';
import { Phase } from '../models/phase';
import { estimatorStore, StoreState } from '../utils/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

type PhaseOption = {
  wbsDatabaseId: number;
  phaseDatabaseId: number;
  description: string;
};

export default function AddPhaseDialog({ open, onClose }: Props) {
  const { wbsId, proposalId } = useParams();
  const data = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || [],
  ).filter((p) => p.wbsId === wbsId);
  const currentWbs = useCurrentWbs({
    wbsId: wbsId ?? '',
  });
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? '',
  });

  const datasetVersions = getProposalDatasetVersions(currentProposal);
  const localPhaseArray = resolveDataset<Phase[]>(
    'phases',
    datasetVersions.phases,
  );

  const [phaseOptions, setPhaseOptions] = useState<
    { wbsDatabaseId: number; phaseDatabaseId: number; description: string }[]
  >([]);
  // the selected material
  const [selectedPhaseDescription, setSelectedPhaseDescription] = useState('');
  const [selectedPhaseDatabaseId, setSelectedPhaseDatabaseId] = useState(0);

  const [newPhaseNumber, setNewPhaseNumber] = useState(0);
  const [newPhaseDescription, setNewPhaseDescription] = useState('');

  const [isDescriptionEdited, setIsDescriptionEdited] = useState(false);
  const [isPhaseNumberEdited, setIsPhaseNumberEdited] = useState(false);

  const listOfWbsNamesNoDescription = useMemo(
    () => ['MOBILIZE', 'DEMOBILIZE', 'SUPPORT'],
    [],
  );
  const listOfPhaseNumbersForSetPhaseName = useMemo(
    () => [
      10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10010,
      10011, 19999, 29987, 29998, 29999, 39982, 39987, 39991, 39998, 39999,
      49982, 49988, 49991, 49992, 49993, 49994, 49995, 49996, 49998, 49999,
      59982, 59991, 59998, 59999, 69982, 69990, 69998, 69999, 79984, 79988,
      79989, 79990, 79992, 79993, 79994, 79995, 79996, 79997, 79998, 79999,
      89999, 99986, 99990, 99998, 99999, 100001, 109999, 110001, 119999, 129998,
      129999, 139983, 139984, 139985, 139989, 139990, 139992, 139993, 139994,
      139995, 139996, 139997, 139998, 139999, 140001, 149999, 159999, 180001,
      180002, 180003, 180004, 189999, 190001, 190002, 190003, 190004, 190005,
      190006, 190007, 199999, 200100, 200200, 200300, 200400, 200500, 200600,
      200700, 200800, 200900, 201010, 201020, 201030, 201040, 201050, 201060,
      209980, 209981, 209982, 209998, 209999,
    ],
    [],
  );

  const filteredPhasesForWbs = useMemo(() => {
    return localPhaseArray.filter(
      (phase) => phase.wbsDatabaseId === currentWbs?.wbsDatabaseId,
    );
  }, [currentWbs, localPhaseArray]);

  const handleOptionSelect = (option: PhaseOption) => {
    setSelectedPhaseDescription(option.description);
    setSelectedPhaseDatabaseId(option.phaseDatabaseId);
    setIsDescriptionEdited(false);
    setIsPhaseNumberEdited(false);
  };

  useEffect(() => {
    if (
      selectedPhaseDescription &&
      selectedPhaseDatabaseId &&
      currentWbs &&
      currentWbs.wbsDatabaseId
    ) {
      // Generate the phase name
      if (
        currentWbs.name &&
        listOfWbsNamesNoDescription.includes(currentWbs.name) &&
        !isDescriptionEdited
      ) {
        setNewPhaseDescription(selectedPhaseDescription);
      }

      // Generate the phase number
      let maxPhaseNumber = currentWbs.wbsDatabaseId;
      if (
        listOfPhaseNumbersForSetPhaseName.includes(selectedPhaseDatabaseId) &&
        !isPhaseNumberEdited
      ) {
        setNewPhaseNumber(selectedPhaseDatabaseId);
      } else if (data.length > 0) {
        data.forEach((phase: Phase) => {
          if (
            phase.phaseNumber &&
            phase.phaseNumber > maxPhaseNumber &&
            !listOfPhaseNumbersForSetPhaseName.includes(phase.phaseNumber)
          ) {
            maxPhaseNumber = phase.phaseNumber;
          }
        });
        if (maxPhaseNumber && !isPhaseNumberEdited) {
          setNewPhaseNumber(maxPhaseNumber + 1);
        }
      } else if (maxPhaseNumber && !isPhaseNumberEdited) {
        setNewPhaseNumber(maxPhaseNumber + 1);
      }
    }
  }, [
    data,
    selectedPhaseDescription,
    selectedPhaseDatabaseId,
    currentWbs,
    listOfPhaseNumbersForSetPhaseName,
    listOfWbsNamesNoDescription,
    isDescriptionEdited,
    isPhaseNumberEdited,
  ]);

  const addPhaseToStore = estimatorStore((state: StoreState) => state.addPhase);

  const handlePhaseCreate = async () => {
    const newPhase: FirestorePhase = new FirestorePhase({
      phaseDatabaseName: selectedPhaseDescription,
      phaseDatabaseId: selectedPhaseDatabaseId,
      phaseNumber: newPhaseNumber,
      description:
        newPhaseDescription !== ''
          ? newPhaseDescription.toUpperCase()
          : selectedPhaseDescription.toUpperCase(),
      wbsId: currentWbs?.id,
      proposalId: currentProposal?.id,
    });
    await addPhaseToStore(newPhase);
    // Clear all states
    setSelectedPhaseDescription('');
    setSelectedPhaseDatabaseId(0);
    setNewPhaseNumber(0);
    setNewPhaseDescription('');
    setIsDescriptionEdited(false);
    setIsPhaseNumberEdited(false);
    onClose();
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add Phase</DialogTitle>
        <DialogContent sx={{ height: '300px', width: '300px' }}>
          <div
            style={{
              width: '100%',
              height: '95%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}>
            <FormControl variant='standard' sx={{ width: '100%' }} size='small'>
              <InputLabel id='demo-simple-select-filled-label'>
                Database
              </InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={selectedPhaseDescription}
                label='Description'>
                {filteredPhasesForWbs.map((option) => (
                  <MenuItem
                    value={option.description}
                    key={option.phaseDatabaseId}
                    sx={{ paddingTop: 2, paddingBottom: 2 }}
                    onClick={() => handleOptionSelect(option)}>
                    {option?.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!listOfWbsNamesNoDescription.includes(currentWbs?.name!) && (
              <TextField
                InputLabelProps={{ shrink: true }}
                variant='standard'
                label='Phase Description'
                value={newPhaseDescription}
                onChange={(event) => {
                  setNewPhaseDescription(event.target.value);
                  setIsDescriptionEdited(true);
                }}
                sx={{ width: '100%' }}
              />
            )}
            <TextField
              InputLabelProps={{ shrink: true }}
              variant='standard'
              label='Phase Number'
              disabled={
                listOfWbsNamesNoDescription.includes(currentWbs?.name!) ||
                !selectedPhaseDescription
              }
              value={newPhaseNumber}
              onChange={(event) => {
                setNewPhaseNumber(parseInt(event.target.value, 10));
                setIsPhaseNumberEdited(true);
              }}
              sx={{ width: '100%' }}
            />
            <Button variant='contained' onClick={handlePhaseCreate}>
              Add Phase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

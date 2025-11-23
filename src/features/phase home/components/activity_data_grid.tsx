import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EditRounded, FileCopy } from '@mui/icons-material';
import TrashIcon from '@mui/icons-material/DeleteForever';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  GridCellParams,
  GridColumnVisibilityModel,
  GridRowId,
  GridRowOrderChangeParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid-pro';

import {
  loadColumnVisibilityModel,
  saveColumnVisibilityModel,
} from '../../../api/helpers';
import DeleteConfirmationDialog from '../../../components/alert_dialog';
import CopyFromPhaseDialog from '../../../components/copy_from_phase_dialog';
import CopyActivitiesFromProposalDialog from '../../../components/copy_activities_from_proposal_dialog';
import { StyledDataGrid } from '../../../components/custom_data_grid';
import EditBaseRateDialog from '../../../components/edit_base_rate_dialog';
import { useUserProfile } from '../../../hooks/user_profile_hook';
import { Activity, ActivityType } from '../../../models/activity';
import { StoreState, estimatorStore } from '../../../utils/store';
import {
  numberToLetters,
  sortActivitiesWithEquipmentLogic,
  numberFields,
} from '../../../utils/utils';
import {
  costOnlyItemAvailableCells,
  customLaborItemAvailableCells,
  editableCostOnlyItemCells,
  editableEquipmentItemCells,
  editableLaborItemCells,
  editableMaterialItemCells,
  editableSubcontractorItemCells,
  equipmentItemAvailableCells,
  laborItemAvailableCells,
  materialItemAvailableCells,
  subcontractorItemAvailableCells,
} from './columns';
import { getActivityColumns } from './columns2';
import defaultConstantArray from '../../../data/constants.json';
import constants2025Array from '../../../data/2025/constants_2025.json';
import defaultPhaseArray from '../../../data/phases.json';
import phase2025Array from '../../../data/2025/phases_2025.json';
import { useCurrentProposal } from '../../../hooks/current_proposal_hook';
import FormattedNumberInput from '../../../components/formatted_number_input';

// Custom Toolbar Component - Defined outside to avoid recreation on each render
interface CustomActivityToolbarProps {
  hasWritePermissions: boolean;
  selectedRows: GridRowId[];
  phaseDatabaseOptions: {
    wbsDatabaseId: number;
    phaseDatabaseId: number;
    description: string;
  }[];
  selectedPhaseDatabaseOption: {
    wbsDatabaseId: number;
    phaseDatabaseId: number | string;
    description: string;
  };
  onChangePhaseDatabase: (option: any) => Promise<void>;
  setDeleteDialogOpen: (open: boolean) => void;
  resetConstants: (ids: string[]) => Promise<void>;
  recalculatePhase: (phaseId: string) => void;
  phaseId?: string;
  setOpenBaseRateDialog: (open: boolean) => void;
  setOpenCopyFromProposalDialog: (open: boolean) => void;
  currentPhase: any;
  handlePhaseCompletionChange: (completed: boolean) => Promise<void>;
}

function CustomActivityToolbar({
  hasWritePermissions,
  selectedRows,
  phaseDatabaseOptions,
  selectedPhaseDatabaseOption,
  onChangePhaseDatabase,
  setDeleteDialogOpen,
  resetConstants,
  recalculatePhase,
  phaseId = '',
  setOpenBaseRateDialog,
  setOpenCopyFromProposalDialog,
  currentPhase,
  handlePhaseCompletionChange,
}: CustomActivityToolbarProps) {
  const buttonWidth = '180px';
  return (
    <GridToolbarContainer
      sx={{
        marginBottom: '0px',
        borderBottom: '1px solid lightgray',
        padding: '10px 20px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
      }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: !hasWritePermissions ? 'start' : 'space-evenly',
          width: '100%',
          alignItems: 'center',
        }}>
        <FormControl
          sx={{ display: 'flex', width: '25%' }}
          variant='standard'
          size='small'>
          <InputLabel id='demo-simple-select-filled-label'>Database</InputLabel>
          <Select
            sx={{ width: '100%' }}
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={selectedPhaseDatabaseOption.description}
            label='Description'>
            {phaseDatabaseOptions.map((option) => (
              <MenuItem
                value={option.description}
                key={`${option.wbsDatabaseId}-${option.phaseDatabaseId}`}
                sx={{ paddingTop: 2, paddingBottom: 2 }}
                onClick={async () => {
                  await onChangePhaseDatabase(option);
                }}>
                {option?.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <GridToolbarColumnsButton
          sx={{
            'color': 'black',
            '&:hover': {
              backgroundColor: 'rgba(6, 124, 193, 0.1)',
            },
          }}
          onResize={undefined}
          nonce={undefined}
          onResizeCapture={undefined}
        />
        <GridToolbarDensitySelector
          sx={{
            'color': 'black',
            '&:hover': {
              backgroundColor: 'rgba(6, 124, 193, 0.1)',
            },
          }}
          onResize={undefined}
          nonce={undefined}
          onResizeCapture={undefined}
        />

        {hasWritePermissions && (
          <>
            <Button
              disabled={selectedRows == null || selectedRows.length <= 0}
              sx={{ color: '#424242', fontSize: '14px' }}
              onClick={() => setDeleteDialogOpen(true)}
              startIcon={<TrashIcon />}>
              Delete
            </Button>
            <Button
              disabled={selectedRows == null || selectedRows.length <= 0}
              sx={{ color: '#424242', fontSize: '14px' }}
              onClick={async () => {
                const ids: string[] = [];
                selectedRows.forEach((row) => {
                  ids.push(row.toString());
                });
                await resetConstants(ids);
                recalculatePhase(phaseId!);
              }}
              startIcon={<RefreshIcon />}>
              Constants / Units
            </Button>
            <Button
              disabled={selectedRows.length === 0}
              sx={{ color: '#424242', fontSize: '14px' }}
              onClick={() => {
                setOpenBaseRateDialog(true);
              }}
              startIcon={<EditRounded />}>
              Edit Rates
            </Button>
            <Button
              sx={{ color: '#424242', fontSize: '14px' }}
              onClick={() => {
                setOpenCopyFromProposalDialog(true);
              }}
              startIcon={<FileCopy />}>
              Copy From Phase
            </Button>
            <Box
              sx={{
                width: buttonWidth,
                display: 'flex',
                alignItems: 'center',
                padding: '1px 12px',
                border: `1px solid ${
                  currentPhase?.completed ? '#4caf50' : '#424242'
                }`,
                borderRadius: '4px',
                backgroundColor: currentPhase?.completed
                  ? 'rgba(76, 175, 80, 0.1)'
                  : 'rgba(66, 66, 66, 0.1)',
              }}>
              <Switch
                checked={currentPhase?.completed || false}
                onChange={() =>
                  handlePhaseCompletionChange(!currentPhase?.completed)
                }
                sx={{
                  'color': currentPhase?.completed ? '#4caf50' : '#424242',
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#4caf50',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#4caf50',
                  },
                }}
              />
              <Typography
                sx={{
                  marginLeft: 1,
                  color: currentPhase?.completed ? '#4caf50' : '#424242',
                  fontSize: '14px',
                }}>
                {currentPhase?.completed ? 'Complete' : 'Incomplete'}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </GridToolbarContainer>
  );
}

CustomActivityToolbar.defaultProps = {
  phaseId: undefined,
};

function ActivityDataGrid() {
  // Add these states for the base rate editing
  const [baseRate, setBaseRate] = useState<number>();
  const [subsistence, setSubsistence] = useState<number>();
  const [rateEditingDisabled, setRateEditingDisabled] = useState(true);
  const updateActivityRates = estimatorStore(
    (state: StoreState) => state.updateActivityRates,
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage] = useState('');
  const updatePhase = estimatorStore((state: StoreState) => state.updatePhase);
  const handleSnackbarClose = (
    event: SyntheticEvent<Element, Event> | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const { proposalId, wbsId, phaseId } = useParams();

  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? '',
  });

  const localConstantArray =
    currentProposal?.constantDataSet === '2025'
      ? constants2025Array
      : defaultConstantArray;

  const localPhaseArray =
    currentProposal?.constantDataSet === '2025'
      ? phase2025Array
      : defaultPhaseArray;

  const { hasWritePermissions } = useUserProfile();
  const [selectedRows, setSelectedRows] = React.useState<GridRowId[]>([]);
  const [openBaseRateDialog, setOpenBaseRateDialog] =
    React.useState<boolean>(false);
  const [openCopyDialog, setOpenCopyDialog] = React.useState<boolean>(false);
  const [openCopyFromProposalDialog, setOpenCopyFromProposalDialog] =
    React.useState<boolean>(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false); // New state to control delete dialog visibility

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({});
  const user = useUserProfile();
  const userId = user?.userProfile?.uid;

  const myactivities = estimatorStore(
    (state: StoreState) => state.activities[proposalId!] || [],
  );
  const updateActivity = estimatorStore(
    (state: StoreState) => state.updateActivity,
  );
  const updateEquipmentOwnership = estimatorStore(
    (state: StoreState) => state.updateEquipmentOwnership,
  );
  const updateEquipmentUnit = estimatorStore(
    (state: StoreState) => state.updateEquipmentUnit,
  );
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase,
  );
  const resetConstants = estimatorStore(
    (state: StoreState) => state.resetConstants,
  );
  const deleteActivities = estimatorStore(
    (state: StoreState) => state.deleteActivities,
  );
  const [filtered, setFiltered] = useState<Activity[]>([]);
  const changeSortOrder = estimatorStore(
    (state: StoreState) => state.changeActivitySortOrder,
  );

  const updateActivitiesBatch = estimatorStore(
    (state: StoreState) => state.updateActivitiesBatch,
  );

  // Determine the current phase from phaseList based on phaseId
  const phaseList = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || [],
  );
  const wbsList = estimatorStore(
    (state: StoreState) => state.wbs[proposalId!] || [],
  );
  const currentPhase = phaseList.find((phase) => phase.id === phaseId);
  const currentWbs = wbsList.find((wbs) => wbs.id === wbsId);

  const handlePhaseCompletionChange = React.useCallback(
    async (completed: boolean) => {
      if (currentPhase) {
        await updatePhase(currentPhase.id!, 'completed', completed);
      }
    },
    [currentPhase, updatePhase],
  );

  const [phaseDatabaseOptions, setPhaseDatabaseOptions] = useState<
    { wbsDatabaseId: number; phaseDatabaseId: number; description: string }[]
  >([]);

  const [selectedPhaseDatabaseOption, setSelectedPhaseDatabaseOption] =
    useState<{
      wbsDatabaseId: number;
      phaseDatabaseId: number | string;
      description: string;
    }>({
      wbsDatabaseId: currentWbs?.wbsDatabaseId || 0,
      phaseDatabaseId: currentPhase?.phaseDatabaseId || 0,
      description: currentPhase?.phaseDatabaseName || '',
    });

  const checkSameValue = React.useCallback(
    (array: Activity[], propName: keyof Activity): boolean => {
      if (array.length <= 1) return true;
      const firstValue = array[0][propName];
      return array.every((obj) => obj[propName] === firstValue);
    },
    [],
  );

  useEffect(() => {
    const fetchActivitiesForRates = async () => {
      if (selectedRows.length === 0) {
        setRateEditingDisabled(true);
        return;
      }

      const ids: string[] = [];
      selectedRows.forEach((row) => {
        ids.push(row.toString());
      });

      const selectedActivities = filtered.filter((activity) =>
        ids.includes(activity.id),
      );

      if (selectedActivities.length === 0) {
        setRateEditingDisabled(true);
        return;
      }

      let disabled = false;
      const phaseDatabasesAllowed = ['180002', '180003', '180004'];

      selectedActivities.forEach((activity) => {
        if (activity && currentWbs)
          if (
            activity.activityType !== ActivityType.customLaborItem &&
            currentWbs.wbsDatabaseId !== 200000 &&
            !phaseDatabasesAllowed.includes(
              currentPhase!.phaseDatabaseId!.toString(),
            )
          ) {
            disabled = true;
          }
      });

      if (selectedActivities.length > 1 && !disabled) {
        const sameBaseRates = checkSameValue(
          selectedActivities,
          'craftBaseRate',
        );
        const sameSubsistenceRate = checkSameValue(
          selectedActivities,
          'subsistenceRate',
        );
        if (!sameBaseRates || !sameSubsistenceRate) {
          disabled = true;
        }
      }

      setSubsistence(
        selectedActivities[0]?.subsistenceRate ??
          currentProposal?.subsistenceRate,
      );
      setBaseRate(
        selectedActivities[0]?.craftBaseRate ?? currentProposal?.craftBaseRate,
      );
      setRateEditingDisabled(disabled);
    };

    fetchActivitiesForRates();
  }, [
    selectedRows,
    filtered,
    currentWbs,
    currentPhase,
    currentProposal,
    checkSameValue,
  ]);

  const handleSaveRates = async () => {
    if (selectedRows.length === 0 || rateEditingDisabled) return;

    const activityIds = selectedRows.map((row) => row.toString());
    await updateActivityRates(activityIds, baseRate ?? 0, subsistence ?? 0);
    recalculatePhase(phaseId!);
  };

  useEffect(() => {
    setSelectedPhaseDatabaseOption({
      wbsDatabaseId: currentWbs?.wbsDatabaseId || 0,
      phaseDatabaseId: currentPhase?.phaseDatabaseId || 0,
      description: currentPhase?.phaseDatabaseName || '',
    });
    const filteredPhasesForWbs = localPhaseArray.filter(
      (phase) => phase.wbsDatabaseId === currentWbs?.wbsDatabaseId,
    );

    setPhaseDatabaseOptions(filteredPhasesForWbs);
  }, [currentWbs, wbsId, currentPhase, localPhaseArray]);

  const onChangePhaseDatabase = React.useCallback(
    async (newPhaseDatabase: {
      wbsDatabaseId: number;
      phaseDatabaseId: number | string;
      description: string;
    }) => {
      setSelectedPhaseDatabaseOption(newPhaseDatabase);
      console.log('HERE');
      if (!currentPhase || !currentWbs) {
        console.error('Current phase or WBS is not defined');
        return;
      }

      await updatePhase(
        phaseId!,
        'phaseDatabaseName',
        newPhaseDatabase.description,
      );
      await updatePhase(
        phaseId!,
        'phaseDatabaseId',
        newPhaseDatabase.phaseDatabaseId,
      );
      const activitiesToUpdate = filtered.map((activity) => {
        const newConstant = localConstantArray.find(
          (constant) =>
            constant.description === activity.constant?.description &&
            constant.phaseDatabaseId === newPhaseDatabase.phaseDatabaseId,
        );
        console.log(newConstant);

        return {
          activityId: activity.id,
          updates: {
            constant: newConstant || activity.constant, // Update constant if a new one is found, otherwise keep the existing one
          },
        };
      });
      try {
        // Perform the batch update
        await updateActivitiesBatch(activitiesToUpdate);
        console.log(activitiesToUpdate);
        console.log('Activities successfully updated');
      } catch (error) {
        console.error('Error updating activities:', error);
      }
    },
    [
      currentPhase,
      currentWbs,
      updatePhase,
      phaseId,
      filtered,
      localConstantArray,
      updateActivitiesBatch,
      setSelectedPhaseDatabaseOption,
    ],
  );

  useEffect(() => {
    console.log(phaseId);
    const temp = myactivities.filter(
      (activity) => activity.phaseId === phaseId,
    );
    console.log(temp);

    // Use the new equipment sorting logic
    const sortedActivities = sortActivitiesWithEquipmentLogic(temp);
    console.log(sortedActivities);

    // Process the sorted activities
    const activitiesWithRowIds = sortedActivities.map((activity, index) => {
      if (activity) {
        // Check if activity is not null or undefined
        return { ...activity, rowId: numberToLetters(index + 1) };
      }
      return activity;
    });
    setFiltered(activitiesWithRowIds);
  }, [myactivities, phaseId]);

  const handleRowOrderChange = async (params: GridRowOrderChangeParams) => {
    if (filtered && filtered.length > 0) {
      const activityId = filtered[params.oldIndex].id;
      await changeSortOrder(activityId, params.targetIndex, phaseId!);
    }
  };

  const handleRowOrderChangeByRowId = async (
    activityId: string,
    targetRowId: string,
  ) => {
    if (!filtered || filtered.length === 0) {
      console.log('No activities to reorder.');
      return;
    }

    const targetRowIdLower = targetRowId.toLowerCase();

    // Combine search for the activity and getting its index
    const targetActivityIndex = filtered.findIndex(
      (act) => act.rowId?.toLowerCase() === targetRowIdLower,
    );

    if (targetActivityIndex === -1) {
      console.log('Target activity not found for the row ID:', targetRowId);
      return;
    }

    const targetActivity = filtered[targetActivityIndex];
    if (!targetActivity) {
      console.log('No target activity found with row ID:', targetRowId);
      return;
    }

    // Assuming `phaseId!` is correctly defined elsewhere and exists
    await changeSortOrder(activityId, targetActivityIndex, phaseId!);
  };

  // Memoized callbacks for equipment updates
  const updateOwnership = React.useCallback(
    async (activity: Activity, ownership: string) => {
      await updateEquipmentOwnership(activity, ownership);
      recalculatePhase(phaseId!);
    },
    [updateEquipmentOwnership, recalculatePhase, phaseId],
  );

  const updateEquipUnit = React.useCallback(
    async (activity: Activity, unit: string) => {
      await updateEquipmentUnit(activity, unit);
      recalculatePhase(phaseId!);
    },
    [updateEquipmentUnit, recalculatePhase, phaseId],
  );

  // Load models and filter/sort settings on mount
  useEffect(() => {
    const loadModels = async () => {
      if (userId && phaseId) {
        try {
          const loadedColumnVisibilityModel = await loadColumnVisibilityModel(
            userId,
            phaseId,
            filtered,
          );
          setColumnVisibilityModel(loadedColumnVisibilityModel);
        } catch (error) {
          console.error('Error loading models from Firestore:', error);
          setColumnVisibilityModel({});
        }
      }
    };

    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, phaseId]);

  // Memoized columns using useMemo - this is the proper MUI pattern
  // Memoized columns - IMPORTANT: Should NOT depend on row data (filtered)
  // According to MUI best practices, columns should be stable
  const columns = React.useMemo(
    () =>
      getActivityColumns({
        hasWritePermissions,
        updateEquipmentOwnership: updateOwnership,
        updateEquipmentUnit: updateEquipUnit,
      }),
    [hasWritePermissions, updateOwnership, updateEquipUnit],
  );

  const handleDelete = async () => {
    const ids: string[] = [];
    selectedRows.forEach((row) => {
      ids.push(row.toString());
    });
    await deleteActivities(ids);
    recalculatePhase(phaseId!);
    setDeleteDialogOpen(false); // Close the dialog after deletion
  };

  // Memoized cell editable checker - uses params.row directly
  const isCellEditable = React.useCallback(
    (params: GridCellParams<number>) => {
      if (!hasWritePermissions) {
        return false;
      }
      const activity = params.row as Activity;
      if (!activity) return false;
      const editableCellsMap: Record<string, string[]> = {
        [ActivityType.laborItem]: editableLaborItemCells,
        [ActivityType.customLaborItem]: editableLaborItemCells,
        [ActivityType.materialItem]: editableMaterialItemCells,
        [ActivityType.equipmentItem]: editableEquipmentItemCells,
        [ActivityType.costOnlyItem]: editableCostOnlyItemCells,
        [ActivityType.subContractorItem]: editableSubcontractorItemCells,
      };
      return (
        editableCellsMap[activity.activityType]?.includes(params.field) || false
      );
    },
    [hasWritePermissions],
  );

  // Memoized cell className getter - uses params.row directly
  const getCellClassName = React.useCallback(
    (params: GridCellParams<number>) => {
      if (!hasWritePermissions) {
        return '';
      }
      const activity = params.row as Activity;
      if (activity) {
        if (params.field === '__check__') {
          return '';
        }
        if (activity.activityType === ActivityType.laborItem) {
          if (params.field === 'craftConstant') {
            if (activity.craftConstant > activity.constant?.craftConstant!) {
              return 'over';
            }
            if (activity.craftConstant < activity.constant?.craftConstant!) {
              return 'under';
            }
          } else if (params.field === 'welderConstant') {
            if (activity.welderConstant > activity.constant?.weldConstant!) {
              return 'over';
            }
            if (activity.welderConstant < activity.constant?.weldConstant!) {
              return 'under';
            }
          }
          if (editableLaborItemCells.includes(params.field)) {
            return 'editable-cell';
          }
          if (!laborItemAvailableCells.includes(params.field)) {
            return 'not-used';
          }
        }
        if (activity.activityType === ActivityType.equipmentItem) {
          if (editableEquipmentItemCells.includes(params.field)) {
            return 'editable-cell';
          }
          if (!equipmentItemAvailableCells.includes(params.field)) {
            return 'not-used';
          }
        }
        if (activity.activityType === ActivityType.materialItem) {
          if (editableMaterialItemCells.includes(params.field)) {
            return 'editable-cell';
          }
          if (!materialItemAvailableCells.includes(params.field)) {
            return 'not-used';
          }
        }
        if (activity.activityType === ActivityType.costOnlyItem) {
          if (editableCostOnlyItemCells.includes(params.field)) {
            return 'editable-cell';
          }
          if (!costOnlyItemAvailableCells.includes(params.field)) {
            return 'not-used';
          }
        }
        if (activity.activityType === ActivityType.customLaborItem) {
          if (editableLaborItemCells.includes(params.field)) {
            return 'editable-cell';
          }
          if (!customLaborItemAvailableCells.includes(params.field)) {
            return 'not-used';
          }
        }
        if (activity.activityType === ActivityType.subContractorItem) {
          if (editableSubcontractorItemCells.includes(params.field)) {
            return 'editable-cell';
          }
          if (!subcontractorItemAvailableCells.includes(params.field)) {
            return 'not-used';
          }
        }
        return 'used';
      }
      return 'used';
    },
    [hasWritePermissions],
  );

  // Memoized toolbar component with props
  const renderToolbar = React.useCallback(
    () => (
      <CustomActivityToolbar
        hasWritePermissions={hasWritePermissions}
        selectedRows={selectedRows}
        phaseDatabaseOptions={phaseDatabaseOptions}
        selectedPhaseDatabaseOption={selectedPhaseDatabaseOption}
        onChangePhaseDatabase={onChangePhaseDatabase}
        setDeleteDialogOpen={setDeleteDialogOpen}
        resetConstants={resetConstants}
        recalculatePhase={recalculatePhase}
        phaseId={phaseId}
        setOpenBaseRateDialog={setOpenBaseRateDialog}
        setOpenCopyFromProposalDialog={setOpenCopyFromProposalDialog}
        currentPhase={currentPhase}
        handlePhaseCompletionChange={handlePhaseCompletionChange}
      />
    ),
    [
      hasWritePermissions,
      selectedRows,
      phaseDatabaseOptions,
      selectedPhaseDatabaseOption,
      onChangePhaseDatabase,
      setDeleteDialogOpen,
      resetConstants,
      recalculatePhase,
      phaseId,
      setOpenBaseRateDialog,
      setOpenCopyFromProposalDialog,
      currentPhase,
      handlePhaseCompletionChange,
    ],
  );

  // Memoized components object for DataGrid
  const components = React.useMemo(
    () => ({
      Toolbar: renderToolbar,
    }),
    [renderToolbar],
  );

  return (
    <Box
      sx={{
        'height': '93%',
        '& .under': {
          backgroundColor: '#ff525240',
          color: 'primary.dark',
        },
        '& .over': {
          backgroundColor: '#ffeb3b40',
          color: 'primary.dark',
        },
        '& .not-used': {
          textDecoration: 'line-through',
          backgroundColor: '#f0f0f0', // or use 'transparent'
          color: '#d0d0d0', // Light grey to indicate it's disabled, or use 'transparent' to hide the text
          fontStyle: 'italic', // Optional, to make it distinct that it's not active or in use
        },
        '& .editable-cell': {
          color: 'primary.main',
        },
        '& .completed-row': {
          'backgroundColor': 'rgba(0, 255, 0, 0.1)', // Subtle green background
          '& .editable-cell': {
            color: 'white', // White text for editable cells
          },
          '& .true': {
            color: 'black', // Black text for non-editable cells
          },
        },
      }}>
      <StyledDataGrid
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={async (newModel) => {
          setColumnVisibilityModel(newModel); // Update state

          if (userId && phaseId) {
            try {
              // Save the new column visibility model to Firestore
              await saveColumnVisibilityModel(userId, phaseId, newModel);
              console.log(
                'Column visibility model updated successfully in Firestore.',
              );
            } catch (error) {
              console.error(
                'Error saving column visibility model to Firestore:',
                error,
              );
              // Optionally, handle the error (e.g., by showing an error message to the user)
            }
          }
        }}
        onSortModelChange={(newModel) => {
          localStorage.setItem('activities_sort', JSON.stringify(newModel));
        }}
        onFilterModelChange={(newModel) => {
          localStorage.setItem('activities_filter', JSON.stringify(newModel));
        }}
        onRowOrderChange={handleRowOrderChange}
        density='compact'
        columns={columns}
        onCellEditCommit={async (params) => {
          const { id, field, value } = params;
          if (field === 'rowId') {
            await handleRowOrderChangeByRowId(id.toString(), value);
          } else {
            // Transform text fields to uppercase before saving
            const shouldUppercase =
              typeof value === 'string' && !numberFields.includes(field);

            const finalValue = shouldUppercase ? value.toUpperCase() : value;
            await updateActivity(id.toString(), field, finalValue);
            recalculatePhase(phaseId!);
          }
        }}
        rows={filtered}
        pageSize={100}
        onSelectionModelChange={(newSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
        components={components}
        isCellEditable={isCellEditable}
        getCellClassName={getCellClassName}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          padding: '15px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid #e0e0e0',
          height: '60px',
        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mr: 4,
          }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 'bold', color: '#424242' }}>
            Quick Edit Rates:
          </Typography>
          <Typography variant='caption' sx={{ color: '#757575' }}>
            {selectedRows.length} {selectedRows.length === 1 ? 'row' : 'rows'}{' '}
            selected
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
            gap: 3,

            backgroundColor: 'transparent',
            padding: '10px 15px',
          }}>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', width: '180px' }}>
            <FormattedNumberInput
              label='Base Rate'
              disabled={rateEditingDisabled}
              value={baseRate?.toString()}
              prefix='$'
              setValue={(_) => setBaseRate(parseFloat(_))}
            />
          </Box>

          <Box
            sx={{ display: 'flex', flexDirection: 'column', width: '180px' }}>
            <FormattedNumberInput
              disabled={rateEditingDisabled}
              value={subsistence?.toString()}
              prefix='$'
              setValue={(_) => setSubsistence(parseFloat(_))}
              label='Subsistence'
            />
          </Box>

          <Button
            variant='contained'
            disabled={rateEditingDisabled}
            onClick={handleSaveRates}
            sx={{
              'height': '36px',
              'ml': 2,
              'backgroundColor': rateEditingDisabled ? '#e0e0e0' : '#1976d2',
              '&:hover': {
                backgroundColor: rateEditingDisabled ? '#e0e0e0' : '#1565c0',
              },
            }}>
            Save Rates
          </Button>
        </Box>
      </Box>
      <EditBaseRateDialog
        open={openBaseRateDialog}
        onClose={() => setOpenBaseRateDialog(false)}
        selectedRowIds={selectedRows}
      />
      <DeleteConfirmationDialog
        title='Are you sure you want to delete the selected activity?'
        content='Once deleted, this activity cannot be recovered.'
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete} // Delete activities when confirmed
      />
      <CopyFromPhaseDialog
        open={openCopyDialog}
        onClose={() => setOpenCopyDialog(false)}
      />
      <CopyActivitiesFromProposalDialog
        open={openCopyFromProposalDialog}
        onClose={() => setOpenCopyFromProposalDialog(false)}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          onClose={handleSnackbarClose}
          severity='error'
          sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export default ActivityDataGrid;

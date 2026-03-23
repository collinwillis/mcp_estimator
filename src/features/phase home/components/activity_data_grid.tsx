import React, {
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  GridRowClassNameParams,
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
import { ExcelNavigationDataGrid } from '../../../components/excel_navigation_data_grid';
import EditBaseRateDialog from '../../../components/edit_base_rate_dialog';
import { useUserProfile } from '../../../hooks/user_profile_hook';
import { Activity, ActivityType } from '../../../models/activity';
import { Constant } from '../../../models/constant';
import { Phase } from '../../../models/phase';
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
import { resolveDataset } from '../../../data/datasets';
import { getProposalDatasetVersions } from '../../../data/proposal_datasets';
import { useCurrentProposal } from '../../../hooks/current_proposal_hook';
import FormattedNumberInput from '../../../components/formatted_number_input';

const AUTO_VISIBILITY_FIELDS = [
  'equipmentOwnership',
  'equipmentCost',
  'materialCost',
  'costOnlyCost',
  'subContractorCost',
  'price',
  'time',
  'craftConstant',
  'welderConstant',
  'craftManHours',
  'welderManHours',
  'craftCost',
  'welderCost',
] as const;

const ACTIVITY_BASELINE_VISIBILITY: Record<number, GridColumnVisibilityModel> =
  {
    10000: { time: false, price: false, equipmentOwnership: false },
    30000: { time: false, price: false, equipmentOwnership: false },
    40000: { time: false, price: false, equipmentOwnership: false },
    50000: { time: false, price: false, equipmentOwnership: false },
    60000: { time: false, price: false, equipmentOwnership: false },
    70000: { time: false, price: false, equipmentOwnership: false },
    80000: { time: false, price: false, equipmentOwnership: false },
    100000: { time: false, price: false, equipmentOwnership: false },
    110000: { time: false, price: false, equipmentOwnership: false },
    130000: { time: false, price: false, equipmentOwnership: false },
    150000: { time: false, price: false, equipmentOwnership: false },
    180000: { time: false, price: false, equipmentOwnership: false },
    190000: { time: false, price: false, equipmentOwnership: false },
    20000: { welderConstant: false, welderManHours: false, welderCost: false },
  };

const getActivityBaselineVisibility = (
  wbsDatabaseId?: number,
): GridColumnVisibilityModel => {
  if (!wbsDatabaseId) {
    return {};
  }

  return ACTIVITY_BASELINE_VISIBILITY[wbsDatabaseId] || {};
};

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
  const toolbarButtonSx = {
    'textTransform': 'none' as const,
    'fontWeight': 500,
    'fontSize': '0.85rem',
    'borderRadius': 1,
    'px': 1.5,
    'py': 0.4,
    'minWidth': 0,
    'border': '1px solid #e5e7eb',
    'color': '#374151',
    '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
    '&.Mui-disabled': { opacity: 0.4 },
  };
  const toolbarIconButtonSx = {
    'borderRadius': 1,
    'border': '1px solid #e5e7eb',
    'px': 1,
    'height': 30,
    'color': '#374151',
    'fontWeight': 500,
    'fontSize': '0.825rem',
    '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
  };
  const toolbarSelectSx = {
    'minWidth': 200,
    'flex': '1 1 220px',
    '& .MuiInputLabel-root': {
      fontSize: '0.825rem',
      fontWeight: 500,
      color: '#6b7280',
    },
    '& .MuiOutlinedInput-root': {
      'borderRadius': 1,
      'backgroundColor': '#f3f4f6',
      'fontSize': '0.875rem',
      'fontWeight': 500,
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: '#d1d5db' },
      '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
    },
  };

  return (
    <GridToolbarContainer
      sx={{
        'borderRadius': 0,
        'borderBottom': '1px solid #e5e7eb',
        'backgroundColor': '#ffffff',
        'boxShadow': 'none',
        'px': 1.5,
        'py': 0.75,
        '& .MuiButton-startIcon': {
          mr: 0.5,
          '& svg': { fontSize: '14px !important' },
        },
      }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          gap: { xs: 1, md: 1.5 },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        }}>
        <Box
          sx={{
            display: 'flex',
            flex: '1 1 35%',
            minWidth: 260,
            gap: 0.75,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
          <FormControl
            sx={{ ...toolbarSelectSx, flex: '1 1 240px' }}
            variant='outlined'
            size='small'>
            <InputLabel id='activity-database-select'>Database</InputLabel>
            <Select
              labelId='activity-database-select'
              id='activity-database'
              value={selectedPhaseDatabaseOption.description}
              label='Database'>
              {phaseDatabaseOptions.map((option) => (
                <MenuItem
                  value={option.description}
                  key={`${option.wbsDatabaseId}-${option.phaseDatabaseId}`}
                  sx={{
                    py: 1,
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  }}
                  onClick={async () => {
                    await onChangePhaseDatabase(option);
                  }}>
                  {option?.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
            <GridToolbarColumnsButton
              sx={toolbarIconButtonSx}
              onResize={undefined}
              onResizeCapture={undefined}
              nonce={undefined}
            />
            <GridToolbarDensitySelector
              sx={toolbarIconButtonSx}
              onResize={undefined}
              onResizeCapture={undefined}
              nonce={undefined}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: '1px solid #e5e7eb',
                backgroundColor: currentPhase?.completed ? '#f0fdf4' : 'transparent',
              }}>
              <Switch
                checked={currentPhase?.completed || false}
                onChange={() =>
                  handlePhaseCompletionChange(!currentPhase?.completed)
                }
                size='small'
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#111827' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#111827' },
                }}
              />
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: '0.825rem',
                  color: currentPhase?.completed ? '#111827' : '#6b7280',
                  whiteSpace: 'nowrap',
                }}>
                {currentPhase?.completed ? 'Complete' : 'Incomplete'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {hasWritePermissions && (
          <Box
            sx={{
              display: 'flex',
              flex: '1 1 40%',
              minWidth: 260,
              flexWrap: 'wrap',
              gap: 0.75,
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}>
            <Button
              disabled={selectedRows == null || selectedRows.length <= 0}
              variant='outlined'
              size='small'
              sx={{
                ...toolbarButtonSx,
                'color': '#dc2626',
                'borderColor': '#fecaca',
                '&:hover': { backgroundColor: '#fef2f2', borderColor: '#f87171' },
              }}
              onClick={() => setDeleteDialogOpen(true)}
              startIcon={<TrashIcon />}>
              Delete
            </Button>
            <Button
              disabled={selectedRows == null || selectedRows.length <= 0}
              variant='outlined'
              size='small'
              sx={toolbarButtonSx}
              onClick={async () => {
                const ids: string[] = [];
                selectedRows.forEach((row) => {
                  ids.push(row.toString());
                });
                await resetConstants(ids);
                recalculatePhase(phaseId!);
              }}
              startIcon={<RefreshIcon />}>
              Reset Constants
            </Button>
            <Button
              disabled={selectedRows.length === 0}
              variant='outlined'
              size='small'
              sx={toolbarButtonSx}
              onClick={() => {
                setOpenBaseRateDialog(true);
              }}
              startIcon={<EditRounded />}>
              Edit Rates
            </Button>
            <Button
              variant='outlined'
              size='small'
              sx={{
                ...toolbarButtonSx,
                'fontWeight': 600,
                'backgroundColor': '#111827',
                'color': '#ffffff',
                'borderColor': '#111827',
                '&:hover': { backgroundColor: '#1f2937', borderColor: '#1f2937' },
              }}
              onClick={() => {
                setOpenCopyFromProposalDialog(true);
              }}
              startIcon={<FileCopy />}>
              Copy From Phase
            </Button>
          </Box>
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

  const datasetVersions = getProposalDatasetVersions(currentProposal);
  const localConstantArray = resolveDataset<Constant[]>(
    'labor',
    datasetVersions.labor,
  );
  const localPhaseArray = resolveDataset<Phase[]>(
    'phases',
    datasetVersions.phases,
  );

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
  const sanitizeVisibilityModel = React.useCallback(
    (model: GridColumnVisibilityModel) => {
      return { ...model };
    },
    [],
  );
  const hasLoadedVisibility = useRef(false);

  const user = useUserProfile();
  const userId = user?.userProfile?.uid;

  useEffect(() => {
    // Reset visibility overrides when navigating to a different phase/user context
    hasLoadedVisibility.current = false;
    setColumnVisibilityModel({});
  }, [phaseId, userId]);

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
    const effectiveBaseRate =
      baseRate ?? currentProposal?.craftBaseRate ?? 0;
    const effectiveSubsistence =
      subsistence ?? currentProposal?.subsistenceRate ?? 0;
    await updateActivityRates(activityIds, effectiveBaseRate, effectiveSubsistence);
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

    setPhaseDatabaseOptions(filteredPhasesForWbs as any);
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

  const {
    hasEquipmentItems,
    hasMaterialItems,
    hasCostOnlyItems,
    hasSubcontractorItems,
    hasLaborItems,
  } = useMemo(() => {
    const flags = {
      hasEquipmentItems: false,
      hasMaterialItems: false,
      hasCostOnlyItems: false,
      hasSubcontractorItems: false,
      hasLaborItems: false,
    };

    filtered.forEach((activity) => {
      switch (activity?.activityType) {
        case ActivityType.equipmentItem:
          flags.hasEquipmentItems = true;
          break;
        case ActivityType.materialItem:
          flags.hasMaterialItems = true;
          break;
        case ActivityType.costOnlyItem:
          flags.hasCostOnlyItems = true;
          break;
        case ActivityType.subContractorItem:
          flags.hasSubcontractorItems = true;
          break;
        case ActivityType.laborItem:
        case ActivityType.customLaborItem:
          flags.hasLaborItems = true;
          break;
        default:
          break;
      }
    });

    return flags;
  }, [filtered]);

  const showEquipmentColumns = hasEquipmentItems || hasSubcontractorItems;
  const showMaterialColumn = hasMaterialItems || hasSubcontractorItems;
  const showCostOnlyColumn = hasCostOnlyItems;
  const showSubcontractorColumn = hasSubcontractorItems;
  const showPriceColumn =
    hasEquipmentItems || hasMaterialItems || hasCostOnlyItems;
  const showTimeColumn = hasEquipmentItems || hasSubcontractorItems;
  const showLaborColumns = hasLaborItems;

  const baselineVisibility = React.useMemo(
    () => getActivityBaselineVisibility(currentWbs?.wbsDatabaseId),
    [currentWbs?.wbsDatabaseId],
  );

  const autoVisibilityModel = useMemo(() => {
    const model: GridColumnVisibilityModel = { ...baselineVisibility };
    const applyVisibility = (field: string, condition: boolean) => {
      const baseValue = baselineVisibility[field];
      if (baseValue === undefined) {
        model[field] = condition;
      } else {
        model[field] = baseValue || condition;
      }
    };

    AUTO_VISIBILITY_FIELDS.forEach((field) => {
      switch (field) {
        case 'equipmentOwnership':
        case 'equipmentCost':
          applyVisibility(field, showEquipmentColumns);
          break;
        case 'materialCost':
          applyVisibility(field, showMaterialColumn);
          break;
        case 'costOnlyCost':
          applyVisibility(field, showCostOnlyColumn);
          break;
        case 'subContractorCost':
          applyVisibility(field, showSubcontractorColumn);
          break;
        case 'price':
          applyVisibility(field, showPriceColumn);
          break;
        case 'time':
          applyVisibility(field, showTimeColumn);
          break;
        case 'craftConstant':
        case 'welderConstant':
        case 'craftManHours':
        case 'welderManHours':
        case 'craftCost':
        case 'welderCost':
          applyVisibility(field, showLaborColumns);
          break;
        default:
          break;
      }
    });
    return model;
  }, [
    showCostOnlyColumn,
    showEquipmentColumns,
    showMaterialColumn,
    showPriceColumn,
    showSubcontractorColumn,
    showTimeColumn,
    showLaborColumns,
    baselineVisibility,
  ]);

  // Load models and filter/sort settings on mount
  useEffect(() => {
    const loadModels = async () => {
      if (hasLoadedVisibility.current) return;
      if (userId && phaseId) {
        try {
          const loadedColumnVisibilityModel = await loadColumnVisibilityModel(
            userId,
            phaseId,
            filtered,
          );
          const sanitizedModel = sanitizeVisibilityModel(
            loadedColumnVisibilityModel,
          );
          const overrides: GridColumnVisibilityModel = {};
          Object.entries(sanitizedModel).forEach(([field, value]) => {
            const isAutoManaged = AUTO_VISIBILITY_FIELDS.includes(
              field as (typeof AUTO_VISIBILITY_FIELDS)[number],
            );
            const autoValue = autoVisibilityModel[field];
            if (isAutoManaged && autoValue === value) {
              return;
            }
            overrides[field] = value;
          });
          setColumnVisibilityModel(overrides);
          hasLoadedVisibility.current = true;
        } catch (error) {
          console.error('Error loading models from Firestore:', error);
          setColumnVisibilityModel({});
          hasLoadedVisibility.current = true;
        }
      }
    };

    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, phaseId, autoVisibilityModel, filtered]);

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
          const classes: string[] = [];

          // Check for over/under conditions
          if (params.field === 'craftConstant') {
            if (activity.craftConstant < activity.constant?.craftConstant!) {
              classes.push('over');
            } else if (
              activity.craftConstant > activity.constant?.craftConstant!
            ) {
              classes.push('under');
            }
          } else if (params.field === 'welderConstant') {
            if (activity.welderConstant < activity.constant?.weldConstant!) {
              classes.push('over');
            } else if (
              activity.welderConstant > activity.constant?.weldConstant!
            ) {
              classes.push('under');
            }
          }

          // Check if editable (important for navigation)
          if (editableLaborItemCells.includes(params.field)) {
            classes.push('editable-cell');
          } else if (!laborItemAvailableCells.includes(params.field)) {
            classes.push('not-used');
          }

          return classes.join(' ');
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
          const classes: string[] = [];

          // Check for over/under conditions (custom labor can have constants too)
          if (params.field === 'craftConstant') {
            if (activity.craftConstant < activity.constant?.craftConstant!) {
              classes.push('over');
            } else if (
              activity.craftConstant > activity.constant?.craftConstant!
            ) {
              classes.push('under');
            }
          } else if (params.field === 'welderConstant') {
            if (activity.welderConstant < activity.constant?.weldConstant!) {
              classes.push('over');
            } else if (
              activity.welderConstant > activity.constant?.weldConstant!
            ) {
              classes.push('under');
            }
          }

          // Check if editable
          if (editableLaborItemCells.includes(params.field)) {
            classes.push('editable-cell');
          } else if (!customLaborItemAvailableCells.includes(params.field)) {
            classes.push('not-used');
          }

          return classes.length > 0 ? classes.join(' ') : '';
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

  const mergedColumnVisibilityModel = useMemo(() => {
    const merged: GridColumnVisibilityModel = { ...autoVisibilityModel };
    Object.entries(columnVisibilityModel).forEach(([field, value]) => {
      const autoValue = merged[field];
      const isAutoManaged = AUTO_VISIBILITY_FIELDS.includes(
        field as (typeof AUTO_VISIBILITY_FIELDS)[number],
      );
      if (isAutoManaged && autoValue === value) {
        // If user selection matches auto default, let auto handle it
        return;
      }
      merged[field] = value;
    });
    return merged;
  }, [columnVisibilityModel, autoVisibilityModel]);

  // When auto rules change (e.g., items added/removed), drop overrides that now match auto defaults
  useEffect(() => {
    setColumnVisibilityModel((prev) => {
      const updated = { ...prev };
      AUTO_VISIBILITY_FIELDS.forEach((field) => {
        const autoValue = autoVisibilityModel[field];
        if (field in updated && updated[field] === autoValue) {
          delete updated[field];
        }
      });
      return updated;
    });
  }, [autoVisibilityModel]);

  const zebraRowClassName = React.useCallback(
    (params: GridRowClassNameParams) =>
      params.indexRelativeToCurrentPage % 2 === 0 ? 'row-even' : 'row-odd',
    [],
  );

  return (
    <Box
      sx={{
        'display': 'flex',
        'flexDirection': 'column',
        'flex': 1,
        'minHeight': 0,
        '& .under': {
          backgroundColor: 'rgba(251, 191, 36, 0.15)',
          color: '#92400e',
        },
        '& .over': {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#991b1b',
        },
        '& .not-used': {
          textDecoration: 'line-through',
          backgroundColor: '#f9fafb',
          color: '#d1d5db',
        },
        '& .editable-cell': {
          color: '#111827',
          fontWeight: 500,
        },
        '& .completed-row': {
          'backgroundColor': '#f0fdf4 !important',
          '& .MuiDataGrid-cell': { color: '#111827' },
        },
      }}>
      <ExcelNavigationDataGrid
        columnVisibilityModel={mergedColumnVisibilityModel}
        onColumnVisibilityModelChange={async (newModel) => {
          const overrides: GridColumnVisibilityModel = {};
          Object.entries(newModel).forEach(([field, value]) => {
            const isAutoManaged = AUTO_VISIBILITY_FIELDS.includes(
              field as (typeof AUTO_VISIBILITY_FIELDS)[number],
            );
            const autoValue = autoVisibilityModel[field];
            // Only persist an override if it differs from the current auto value (for auto-managed fields)
            if (isAutoManaged && autoValue === value) {
              return;
            }
            overrides[field] = value;
          });
          const sanitizedModel = sanitizeVisibilityModel(overrides);
          setColumnVisibilityModel(sanitizedModel); // Update state

          if (userId && phaseId) {
            try {
              // Save the new column visibility model to Firestore
              await saveColumnVisibilityModel(userId, phaseId, sanitizedModel);
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
        // Use the new editing API with processRowUpdate (MUI best practice)
        onProcessRowUpdate={async (newRow, oldRow) => {
          const { id } = newRow;

          // Check which field changed
          const changedField = Object.keys(newRow).find(
            (key) => newRow[key] !== oldRow[key],
          );

          if (!changedField) return newRow;

          const value = newRow[changedField];

          if (changedField === 'rowId') {
            await handleRowOrderChangeByRowId(id.toString(), value);
          } else {
            // Transform text fields to uppercase before saving
            const shouldUppercase =
              typeof value === 'string' && !numberFields.includes(changedField);

            const finalValue = shouldUppercase ? value.toUpperCase() : value;
            await updateActivity(id.toString(), changedField, finalValue);
            recalculatePhase(phaseId!);

            // Return the updated row with uppercase value if needed
            if (shouldUppercase) {
              return { ...newRow, [changedField]: finalValue };
            }
          }

          return newRow;
        }}
        rows={filtered}
        pageSize={100}
        onSelectionModelChange={(newSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
        components={components}
        isCellEditable={isCellEditable}
        getCellClassName={getCellClassName}
        getRowClassName={zebraRowClassName}
        // Enable Excel-like navigation with enhanced settings
        enableExcelNavigation={true}
        autoCommitOnNavigation={true}
        enterBehavior='next-row'
        tabBehavior='next-cell'
        skipNonEditableCells={true}
        wrapNavigation={true}
        debugMode={false}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 1.5,
          px: 2,
          py: 0.5,
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          flexShrink: 0,
          minHeight: 40,
        }}>
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 500,
            color: '#6b7280',
            mr: 'auto',
          }}>
          {selectedRows.length > 0
            ? `${selectedRows.length} ${selectedRows.length === 1 ? 'row' : 'rows'} selected`
            : 'Select rows to edit rates'}
        </Typography>

        <Box sx={{ width: { xs: 120, sm: 140 } }}>
          <FormattedNumberInput
            label='Base Rate'
            disabled={rateEditingDisabled}
            value={baseRate?.toString()}
            prefix='$'
            setValue={(_) => setBaseRate(parseFloat(_))}
          />
        </Box>

        <Box sx={{ width: { xs: 120, sm: 140 } }}>
          <FormattedNumberInput
            disabled={rateEditingDisabled}
            value={subsistence?.toString()}
            prefix='$'
            setValue={(_) => setSubsistence(parseFloat(_))}
            label='Subsistence'
          />
        </Box>

        <Button
          variant='outlined'
          disabled={rateEditingDisabled}
          onClick={handleSaveRates}
          disableElevation
          size='small'
          sx={{
            'textTransform': 'none',
            'fontWeight': 600,
            'fontSize': '0.85rem',
            'borderRadius': 1,
            'px': 2,
            'py': 0.4,
            'backgroundColor': rateEditingDisabled ? 'transparent' : '#111827',
            'color': rateEditingDisabled ? '#9ca3af' : '#ffffff',
            'borderColor': rateEditingDisabled ? '#e5e7eb' : '#111827',
            '&:hover': {
              backgroundColor: rateEditingDisabled ? 'transparent' : '#1f2937',
              borderColor: rateEditingDisabled ? '#e5e7eb' : '#1f2937',
            },
            '&.Mui-disabled': { opacity: 0.5 },
          }}>
          Save Rates
        </Button>
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

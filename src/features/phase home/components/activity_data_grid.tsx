import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, EditRounded } from '@mui/icons-material';
import TrashIcon from '@mui/icons-material/DeleteForever';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Button, Divider, Snackbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  GridCellParams,
  GridColumnVisibilityModel,
  GridColumns,
  GridFilterModel,
  GridRowId,
  GridRowOrderChangeParams,
  GridSortModel,
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
import { StyledDataGrid } from '../../../components/custom_data_grid';
import EditBaseRateDialog from '../../../components/edit_base_rate_dialog';
import { useCurrentPhase } from '../../../hooks/current_phase_hook';
import { useUserProfile } from '../../../hooks/user_profile_hook';
import { Activity, ActivityType } from '../../../models/activity';
import { Phase } from '../../../models/phase';
import { StoreState, estimatorStore } from '../../../utils/store';
import { numberToLetters } from '../../../utils/utils';
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

function ActivityDataGrid() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
  const currentPhase = useCurrentPhase({
    phaseId: phaseId ?? '',
  });
  const { hasWritePermissions } = useUserProfile();
  const [selectedRows, setSelectedRows] = React.useState<GridRowId[]>([]);
  const [columns, setColumns] = React.useState<GridColumns>([]);
  const [openBaseRateDialog, setOpenBaseRateDialog] =
    React.useState<boolean>(false);
  const [openCopyDialog, setOpenCopyDialog] = React.useState<boolean>(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false); // New state to control delete dialog visibility

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({});
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const [sortModel, setSortModel] = React.useState<GridSortModel>();
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
  const changeActivityOrder = estimatorStore(
    (state: StoreState) => state.changeActivityOrder,
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
  useEffect(() => {
    console.log(phaseId);
    const temp = myactivities.filter(
      (activity) => activity.phaseId === phaseId,
    );
    console.log(temp);
    const sortedActivities = [...temp].sort(
      (a, b) => a!.sortOrder - b!.sortOrder,
    );
    console.log(sortedActivities);

    // Process the sorted activities
    sortedActivities.forEach((activity, index) => {
      if (activity) {
        // Check if activity is not null or undefined
        activity.rowId = numberToLetters(index + 1);
      }
    });
    setFiltered([...sortedActivities]);
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

  useEffect(() => {
    const loadModels = async () => {
      if (userId && phaseId) {
        try {
          // Load the column visibility model from Firestore
          const loadedColumnVisibilityModel = await loadColumnVisibilityModel(
            userId,
            phaseId,
            filtered,
          );
          setColumnVisibilityModel(loadedColumnVisibilityModel);
        } catch (error) {
          console.error('Error loading models from Firestore:', error);
          // Handle errors or set defaults
          setColumnVisibilityModel({});
        }
      }
    };

    const updateOwnership = async (activity: Activity, ownership: string) => {
      await updateEquipmentOwnership(activity, ownership);
      recalculatePhase(phaseId!);
    };

    const updateEquipUnit = async (activity: Activity, unit: string) => {
      await updateEquipmentUnit(activity, unit);
      recalculatePhase(phaseId!);
    };

    const filterJSON = localStorage.getItem('activities_filter');
    const initialFilterModel = filterJSON
      ? JSON.parse(filterJSON)
      : { items: [] };
    setFilterModel(initialFilterModel);
    const sortJSON = localStorage.getItem('activities_sort');
    const initialSortModel = sortJSON ? JSON.parse(sortJSON) : [];
    setSortModel(initialSortModel);
    loadModels();
    const temp = getActivityColumns({
      activities: filtered,
      hasWritePermissions,
      updateEquipmentOwnership: updateOwnership,
      updateEquipmentUnit: updateEquipUnit,
    });
    setColumns(temp);
  }, [filtered, hasWritePermissions]);

  const handleDelete = async () => {
    const ids: string[] = [];
    selectedRows.map((row) => {
      ids.push(row.toString());
    });
    await deleteActivities(ids);
    recalculatePhase(phaseId!);
    setDeleteDialogOpen(false); // Close the dialog after deletion
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ marginBottom: '0px', borderBottom: '1px solid lightgray' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div>
            <GridToolbarColumnsButton
              sx={{ color: '#424242' }}
              onResize={undefined}
              nonce={undefined}
              onResizeCapture={undefined}
            />
            <GridToolbarDensitySelector
              sx={{ color: '#424242' }}
              onResize={undefined}
              nonce={undefined}
              onResizeCapture={undefined}
            />
          </div>
          <Typography variant='h5'>
            {currentPhase?.phaseDatabaseName}
          </Typography>
          {hasWritePermissions && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <Button
                disabled={selectedRows == null || selectedRows.length <= 0}
                sx={{ color: '#424242', fontSize: '14px' }}
                onClick={() => setDeleteDialogOpen(true)} // Open delete confirmation dialog
                startIcon={<TrashIcon />}
              >
                Delete
              </Button>
              <Divider
                light
                orientation='vertical'
                sx={{
                  width: '1px',
                  backgroundColor: 'lightgray',
                  margin: '0px 14px',
                }}
              />
              <Button
                disabled={selectedRows == null || selectedRows.length <= 0}
                sx={{ color: '#424242', fontSize: '14px' }}
                onClick={async () => {
                  const ids: string[] = [];
                  selectedRows.map((row) => {
                    ids.push(row.toString());
                  });
                  await resetConstants(ids);
                  recalculatePhase(phaseId!);
                }}
                startIcon={<RefreshIcon />}
              >
                Constants / Units
              </Button>
              <Divider
                light
                orientation='vertical'
                sx={{
                  width: '1px',
                  backgroundColor: 'lightgray',
                  margin: '0px 14px',
                }}
              />
              <Button
                disabled={selectedRows.length == 0}
                sx={{ color: '#424242', fontSize: '14px' }}
                onClick={() => {
                  setOpenBaseRateDialog(true);
                }}
                startIcon={<EditRounded />}
              >
                Edit Rates
              </Button>
              <Divider
                light
                orientation='vertical'
                sx={{
                  width: '1px',
                  backgroundColor: 'lightgray',
                  margin: '0px 14px',
                }}
              />
              <Button
                sx={{ color: '#424242', fontSize: '14px' }}
                onClick={() => {
                  setOpenCopyDialog(true);
                }}
                startIcon={<Download />}
              >
                Copy from Phase
              </Button>
            </div>
          )}
        </div>
      </GridToolbarContainer>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
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
          color: 'primary.dark',
        },
      }}
    >
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
        sortModel={sortModel}
        onSortModelChange={(newModel) => {
          localStorage.setItem('activities_sort', JSON.stringify(newModel));
          setSortModel(newModel);
        }}
        filterModel={filterModel}
        onFilterModelChange={(newModel) => {
          localStorage.setItem('activities_filter', JSON.stringify(newModel));
          setFilterModel(newModel);
        }}
        onRowOrderChange={handleRowOrderChange}
        density='compact'
        columns={columns}
        onCellEditCommit={async (params, event) => {
          const { id, field, value } = params;
          if (field == 'rowId') {
            await handleRowOrderChangeByRowId(id.toString(), value);
          } else {
            await updateActivity(id.toString(), field, value);
            recalculatePhase(phaseId!);
          }
        }}
        rows={filtered}
        pageSize={100}
        onSelectionModelChange={(newSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
        components={{ Toolbar: CustomToolbar }}
        isCellEditable={(params: GridCellParams<number>) => {
          if (!hasWritePermissions) {
            return false;
          }
          const activity = filtered.find(
            (activity) => activity.id === params.row.id,
          );
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
            editableCellsMap[activity.activityType]?.includes(params.field) ||
            false
          );
        }}
        getCellClassName={(params: GridCellParams<number>) => {
          if (!hasWritePermissions) {
            // Check if the user has write permissions
            return ''; // Return an empty string to not apply any additional styling
          }
          const activity = filtered.find(
            (activity) => activity.id === params.row.id,
          );
          if (activity) {
            if (params.field == '__check__') {
              return '';
            }
            if (activity.activityType == ActivityType.laborItem) {
              if (params.field === 'craftConstant') {
                if (
                  activity.craftConstant > activity.constant?.craftConstant!
                ) {
                  return 'over';
                }
                if (
                  activity.craftConstant < activity.constant?.craftConstant!
                ) {
                  return 'under';
                }
              } else if (params.field === 'welderConstant') {
                if (
                  activity.welderConstant > activity.constant?.weldConstant!
                ) {
                  return 'over';
                }
                if (
                  activity.welderConstant < activity.constant?.weldConstant!
                ) {
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
            if (activity.activityType == ActivityType.equipmentItem) {
              if (editableEquipmentItemCells.includes(params.field)) {
                return 'editable-cell';
              }
              if (!equipmentItemAvailableCells.includes(params.field)) {
                return 'not-used';
              }
            }
            if (activity.activityType == ActivityType.materialItem) {
              if (editableMaterialItemCells.includes(params.field)) {
                return 'editable-cell';
              }
              if (!materialItemAvailableCells.includes(params.field)) {
                return 'not-used';
              }
            }
            if (activity.activityType == ActivityType.costOnlyItem) {
              if (editableCostOnlyItemCells.includes(params.field)) {
                return 'editable-cell';
              }
              if (!costOnlyItemAvailableCells.includes(params.field)) {
                return 'not-used';
              }
            }
            if (activity.activityType == ActivityType.customLaborItem) {
              if (editableLaborItemCells.includes(params.field)) {
                return 'editable-cell';
              }
              if (!customLaborItemAvailableCells.includes(params.field)) {
                return 'not-used';
              }
            }
            if (activity.activityType == ActivityType.subContractorItem) {
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
        }}
      />
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity='error'
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export default ActivityDataGrid;

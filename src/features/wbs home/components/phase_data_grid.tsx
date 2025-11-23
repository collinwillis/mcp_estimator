import React from 'react';
import { ControlPointDuplicate } from '@mui/icons-material';
import TrashIcon from '@mui/icons-material/DeleteForever';
import { Button, Checkbox } from '@mui/material';
import { Box } from '@mui/system';
import {
  GridCellEditCommitParams,
  GridCellParams,
  GridColumnVisibilityModel,
  GridColumns,
  GridRowId,
  GridSelectionModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridValueFormatterParams,
} from '@mui/x-data-grid-pro';

import DeleteConfirmationDialog from '../../../components/alert_dialog';
import { StyledDataGrid } from '../../../components/custom_data_grid';
import { useUserProfile } from '../../../hooks/user_profile_hook';
import { Phase } from '../../../models/phase';
import { StoreState, estimatorStore } from '../../../utils/store';
import { numberFields } from '../../../utils/utils';

// Custom Toolbar Component - Defined outside to avoid recreation on each render
interface CustomToolbarProps {
  hasWritePermissions: boolean;
  selectedRows: GridRowId[];
  duplicatePhases: (ids: string[]) => Promise<void>;
  setDeleteDialogOpen: (open: boolean) => void;
}

function CustomToolbar({
  hasWritePermissions,
  selectedRows,
  duplicatePhases,
  setDeleteDialogOpen,
}: CustomToolbarProps) {
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
        {hasWritePermissions && (
          <>
            <Button
              disabled={selectedRows == null || selectedRows.length <= 0}
              color='error'
              sx={{
                color: '#424242',
                fontSize: '14px',
              }}
              onClick={async () => {
                const ids: string[] = [];
                selectedRows.forEach((row) => {
                  ids.push(row.toString());
                });
                await duplicatePhases(ids);
              }}
              startIcon={<ControlPointDuplicate />}>
              Duplicate
            </Button>
            <Button
              disabled={selectedRows == null || selectedRows.length <= 0}
              color='error'
              sx={{ color: '#424242', fontSize: '14px' }}
              onClick={() => setDeleteDialogOpen(true)}
              startIcon={<TrashIcon />}>
              Delete
            </Button>
          </>
        )}
      </Box>
    </GridToolbarContainer>
  );
}

function PhaseDataGrid({
  phaseList,
  isLoading,
}: {
  phaseList: Phase[];
  isLoading: boolean;
}) {
  const { hasWritePermissions } = useUserProfile();
  const [selectedRows, setSelectedRows] = React.useState<GridRowId[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const updatePhase = estimatorStore((state: StoreState) => state.updatePhase);
  const deletePhases = estimatorStore(
    (state: StoreState) => state.deletePhases,
  );
  const duplicatePhases = estimatorStore(
    (state: StoreState) => state.duplicatePhases,
  );

  const handleDelete = async () => {
    const ids: string[] = [];
    selectedRows.forEach((row) => {
      ids.push(row.toString());
    });
    await deletePhases(ids);
    setDeleteDialogOpen(false); // Close dialog after deletion
  };

  const visibilityJSON = localStorage.getItem('phases_visibility');
  const visibilityModel = visibilityJSON ? JSON.parse(visibilityJSON) : {};
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>(visibilityModel);

  // Memoized checkbox change handler
  const handleCheckboxChange = React.useCallback(
    async (id: string, completed: boolean) => {
      await updatePhase(id, 'completed', completed);
    },
    [updatePhase],
  );

  // Memoized columns - following MUI best practices
  const columns: GridColumns = React.useMemo(
    () => [
      {
        field: 'completed',
        headerName: 'Completed',
        width: 100,
        renderCell: (params: GridCellParams) => (
          // render checkbox in center of cell
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Checkbox
              size='medium'
              checked={params.value as boolean}
              onChange={(event) => {
                handleCheckboxChange(
                  params.id.toString(),
                  event.target.checked,
                ).then((r) => r);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </div>
        ),
      },
      {
        field: 'phaseNumber',
        headerName: 'Phase',
        minWidth: 100,
        editable: true,
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'size',
        headerName: 'Size',
        editable: true,
        align: 'right',
        flex: 1,
        minWidth: 80,
        headerAlign: 'center',
      },
      {
        field: 'flc',
        headerName: 'FLC',
        editable: true,
        align: 'right',
        flex: 1,
        minWidth: 80,
        headerAlign: 'center',
      },
      {
        field: 'description',
        headerName: 'Line / Description',
        editable: true,
        minWidth: 250,
        align: 'left',
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'spec',
        headerName: 'Spec',
        editable: true,
        minWidth: 80,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'insulation',
        headerName: 'Insul',
        editable: true,
        minWidth: 80,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'insulationSize',
        headerName: 'Insl. Size',
        editable: true,
        minWidth: 80,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'sheet',
        headerName: 'Sht',
        minWidth: 80,
        editable: true,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'area',
        headerName: 'Area',
        minWidth: 80,
        editable: true,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 80,
        align: 'right',
        editable: true,
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'sys',
        headerName: 'Sys',
        editable: true,
        align: 'right',
        flex: 1,
        minWidth: 80,
        headerAlign: 'center',
      },
      {
        field: 'quantity',
        headerName: 'Quantity',
        minWidth: 100,
        align: 'right',
        editable: true,
        flex: 1,
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          return `${valueFormatted}`;
        },
      },
      {
        field: 'unit',
        headerName: 'Units',
        minWidth: 80,
        align: 'right',
        editable: true,
        flex: 1,
        headerAlign: 'center',
      },
      {
        field: 'craftManHours',
        headerName: 'Craft MH',
        editable: true,
        align: 'right',
        flex: 1,
        minWidth: 100,
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          return `${valueFormatted}`;
        },
      },
      {
        field: 'craftCost',
        headerName: 'Craft Total',
        editable: true,
        minWidth: 120,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return `$${valueFormatted}`;
        },
      },
      {
        field: 'welderManHours',
        headerName: 'Welder MH',
        editable: true,
        minWidth: 120,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          return `${valueFormatted}`;
        },
      },
      {
        field: 'welderCost',
        headerName: 'Welder Total',
        editable: true,
        minWidth: 120,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return `$${valueFormatted}`;
        },
      },
      {
        field: 'materialCost',
        headerName: 'Material Total',
        minWidth: 120,
        hide: true,
        editable: true,
        flex: 1,
        align: 'right',
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return `$${valueFormatted}`;
        },
      },
      {
        field: 'equipmentCost',
        headerName: 'Equip Total',
        minWidth: 120,
        hide: true,
        editable: true,
        flex: 1,
        align: 'right',
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return `$${valueFormatted}`;
        },
      },
      {
        field: 'subContractorCost',
        headerName: 'Sub Total',
        minWidth: 120,
        hide: true,
        editable: true,
        flex: 1,
        align: 'right',
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return `$${valueFormatted}`;
        },
      },
      {
        field: 'costOnlyCost',
        headerName: 'Cost Only Total',
        editable: true,
        minWidth: 120,
        hide: true,
        align: 'right',
        flex: 1,
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return `$${valueFormatted}`;
        },
      },
      {
        field: 'totalCost',
        headerName: 'Total',
        minWidth: 120,
        editable: true,
        flex: 1,
        align: 'right',
        headerAlign: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          const valueFormatted = params.value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return `$${valueFormatted}`;
        },
      },
    ],
    [handleCheckboxChange],
  );

  const notEditableCells = React.useMemo(
    () => [
      'craftCost',
      'welderCost',
      'materialCost',
      'equipmentCost',
      'subContractorCost',
      'costOnlyCost',
      'totalCost',
    ],
    [],
  );

  // Memoized cell editable checker
  const isCellEditable = React.useCallback(
    (params: GridCellParams<number>) => {
      if (!hasWritePermissions) {
        return false;
      }
      if (notEditableCells.includes(params.field)) {
        return false;
      }
      return true;
    },
    [hasWritePermissions, notEditableCells],
  );

  // Memoized cell className getter
  const getCellClassName = React.useCallback(
    (params: GridCellParams<number>) => {
      let className = '';
      if (params.row.completed) {
        className += 'completed-row ';
      }
      if (!notEditableCells.includes(params.field)) {
        className += 'editable-cell';
      }
      return className;
    },
    [notEditableCells],
  );

  // Memoized toolbar component with props
  const renderToolbar = React.useCallback(
    () => (
      <CustomToolbar
        hasWritePermissions={hasWritePermissions}
        selectedRows={selectedRows}
        duplicatePhases={duplicatePhases}
        setDeleteDialogOpen={setDeleteDialogOpen}
      />
    ),
    [hasWritePermissions, selectedRows, duplicatePhases, setDeleteDialogOpen],
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
        'height': '100%',
        '& .under': {
          backgroundColor: '#ff525240',
          color: 'primary.dark',
        },
        '& .over': {
          backgroundColor: '#ffeb3b40',
          color: 'primary.dark',
        },
        '& .not-used': {
          backgroundColor: '#2d2d2d',
          color: '#2d2d2d',
        },
        '& .editable-cell': {
          color: 'primary.dark',
        },
        '& .completed-row-light': {
          'backgroundColor': '#c0e8d4 !important', // Light green background for completed rows
          '& .editable-cell': {
            color: 'white', // White text for editable cells
          },
          '& .MuiDataGrid-cell--editable': {
            color: 'white', // White text for editable cells
          },
          '& .MuiDataGrid-cell': {
            color: 'black', // Black text for non-editable cells
          },
        },
        '& .completed-row-dark': {
          'backgroundColor': '#9fcbb9 !important', // Darker green background for completed rows
          '& .editable-cell': {
            color: 'white', // White text for editable cells
          },
          '& .MuiDataGrid-cell--editable': {
            color: 'white', // White text for editable cells
          },
          '& .MuiDataGrid-cell': {
            color: 'black', // Black text for non-editable cells
          },
        },
      }}>
      <StyledDataGrid
        onSortModelChange={(newModel) => {
          localStorage.setItem('phases_sort', JSON.stringify(newModel));
        }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) => {
          localStorage.setItem('phases_visibility', JSON.stringify(newModel));
          setColumnVisibilityModel(newModel);
        }}
        onFilterModelChange={(newModel) => {
          localStorage.setItem('phases_filter', JSON.stringify(newModel));
        }}
        density='compact'
        loading={isLoading}
        columns={columns}
        rows={phaseList}
        pageSize={100}
        onSelectionModelChange={(newSelectionModel: GridSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
        components={components}
        onCellEditCommit={(params: GridCellEditCommitParams) => {
          const { id, field, value } = params;
          // Transform text fields to uppercase before saving
          const shouldUppercase =
            typeof value === 'string' && !numberFields.includes(field);
          const finalValue = shouldUppercase ? value.toUpperCase() : value;
          updatePhase(id.toString(), field, finalValue);
        }}
        isCellEditable={isCellEditable}
        getCellClassName={getCellClassName}
        getRowClassName={(params) => {
          if (params.row.completed) {
            return params.indexRelativeToCurrentPage % 2 === 0
              ? 'completed-row-light'
              : 'completed-row-dark';
          }
          return '';
        }}
      />
      <DeleteConfirmationDialog
        title='Are you sure you want to delete the selected phase?'
        content='Once deleted, this phase and its associated activities cannot be recovered.'
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete} // Pass the delete logic to onConfirm prop
      />
    </Box>
  );
}

export default PhaseDataGrid;

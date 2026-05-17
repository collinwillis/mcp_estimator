import React from 'react';
import { useRef } from 'react';
import { ControlPointDuplicate } from '@mui/icons-material';
import TrashIcon from '@mui/icons-material/DeleteForever';
import { Button, Checkbox } from '@mui/material';
import { Box } from '@mui/system';
import {
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
import { ExcelNavigationDataGrid } from '../../../components/excel_navigation_data_grid';
import { useUserProfile } from '../../../hooks/user_profile_hook';
import { Phase } from '../../../models/phase';
import { StoreState, estimatorStore } from '../../../utils/store';
import { numberFields } from '../../../utils/utils';

const COMMON_PHASE_COLUMN_RULE: GridColumnVisibilityModel = {
  size: false,
  flc: false,
  spec: false,
  insulation: false,
  insulationSize: false,
  sheet: false,
};

const PHASE_AUTO_COLUMN_RULES: Record<number, GridColumnVisibilityModel> = {
  10000: COMMON_PHASE_COLUMN_RULE,
  20000: COMMON_PHASE_COLUMN_RULE,
  30000: COMMON_PHASE_COLUMN_RULE,
  40000: COMMON_PHASE_COLUMN_RULE,
  50000: COMMON_PHASE_COLUMN_RULE,
  60000: COMMON_PHASE_COLUMN_RULE,
  80000: COMMON_PHASE_COLUMN_RULE,
  110000: COMMON_PHASE_COLUMN_RULE,
  150000: COMMON_PHASE_COLUMN_RULE,
  180000: COMMON_PHASE_COLUMN_RULE,
  190000: COMMON_PHASE_COLUMN_RULE,
  200000: COMMON_PHASE_COLUMN_RULE,
};

const sanitizePhaseColumnVisibilityModel = (
  model: GridColumnVisibilityModel,
  _wbsDatabaseId?: number,
): GridColumnVisibilityModel => {
  return { ...model };
};

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
  const toolbarButtonSx = {
    'textTransform': 'none' as const,
    'fontWeight': 500,
    'fontSize': '0.775rem',
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
    'fontSize': '0.75rem',
    '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
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
          flexWrap: 'wrap',
          gap: 1.5,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <GridToolbarColumnsButton
            sx={toolbarIconButtonSx}
            onResize={undefined}
            nonce={undefined}
            onResizeCapture={undefined}
          />
          <GridToolbarDensitySelector
            sx={toolbarIconButtonSx}
            onResize={undefined}
            nonce={undefined}
            onResizeCapture={undefined}
          />
        </Box>
        {hasWritePermissions && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 1,
            }}>
            <Button
              disabled={selectedRows == null || selectedRows.length <= 0}
              sx={toolbarButtonSx}
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
          </Box>
        )}
      </Box>
    </GridToolbarContainer>
  );
}

function PhaseDataGrid({
  phaseList,
  isLoading,
  wbsDatabaseId,
}: {
  phaseList: Phase[];
  isLoading: boolean;
  wbsDatabaseId?: number;
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
  const hasLoadedVisibility = useRef(false);
  const handleDelete = async () => {
    const ids: string[] = [];
    selectedRows.forEach((row) => {
      ids.push(row.toString());
    });
    await deletePhases(ids);
    setDeleteDialogOpen(false); // Close dialog after deletion
  };

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({});

  React.useEffect(() => {
    hasLoadedVisibility.current = false;
    setColumnVisibilityModel({});
  }, [wbsDatabaseId]);

  const autoManagedPhaseFields = React.useMemo(
    () => Object.keys(PHASE_AUTO_COLUMN_RULES[wbsDatabaseId ?? -1] || {}),
    [wbsDatabaseId],
  );
  const autoManagedPhaseSet = React.useMemo(
    () => new Set(autoManagedPhaseFields),
    [autoManagedPhaseFields],
  );

  const autoVisibilityModel = React.useMemo(() => {
    if (!wbsDatabaseId) {
      return {};
    }
    return PHASE_AUTO_COLUMN_RULES[wbsDatabaseId] || {};
  }, [wbsDatabaseId]);

  React.useEffect(() => {
    if (hasLoadedVisibility.current) return;
    try {
      const visibilityJSON = localStorage.getItem('phases_visibility');
      const parsedModel = visibilityJSON ? JSON.parse(visibilityJSON) : {};
      const sanitizedModel = sanitizePhaseColumnVisibilityModel(
        parsedModel,
        wbsDatabaseId,
      );
      const overrides: GridColumnVisibilityModel = {};
      Object.entries(sanitizedModel).forEach(([field, value]) => {
        const autoValue = autoVisibilityModel[field];
        if (autoManagedPhaseSet.has(field) && autoValue === value) {
          return;
        }
        overrides[field] = value;
      });
      setColumnVisibilityModel(overrides);
    } catch (error) {
      console.error('Failed to parse stored phase column visibility', error);
      setColumnVisibilityModel({});
    } finally {
      hasLoadedVisibility.current = true;
    }
  }, [autoManagedPhaseSet, autoVisibilityModel, wbsDatabaseId]);

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
      'craftManHours',
      'welderManHours',
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

  const mergedColumnVisibilityModel = React.useMemo(() => {
    const merged: GridColumnVisibilityModel = { ...autoVisibilityModel };
    Object.entries(columnVisibilityModel).forEach(([field, value]) => {
      const autoValue = merged[field];
      if (autoManagedPhaseSet.has(field) && autoValue === value) {
        return;
      }
      merged[field] = value;
    });
    return merged;
  }, [columnVisibilityModel, autoVisibilityModel, autoManagedPhaseSet]);

  // When auto rules change, drop overrides that now match the auto defaults
  React.useEffect(() => {
    setColumnVisibilityModel((prev) => {
      const updated = { ...prev };
      autoManagedPhaseSet.forEach((field) => {
        const autoValue = autoVisibilityModel[field];
        if (field in updated && updated[field] === autoValue) {
          delete updated[field];
        }
      });
      return updated;
    });
  }, [autoManagedPhaseSet, autoVisibilityModel]);

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
      <ExcelNavigationDataGrid
        onSortModelChange={(newModel) => {
          localStorage.setItem('phases_sort', JSON.stringify(newModel));
        }}
        columnVisibilityModel={mergedColumnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) => {
          const overrides: GridColumnVisibilityModel = {};
          Object.entries(newModel).forEach(([field, value]) => {
            const autoValue = autoVisibilityModel[field];
            const isAutoManaged = autoManagedPhaseSet.has(field);
            if (isAutoManaged && autoValue === value) {
              return;
            }
            overrides[field] = value;
          });
          const sanitizedModel = sanitizePhaseColumnVisibilityModel(
            overrides,
            wbsDatabaseId,
          );
          localStorage.setItem(
            'phases_visibility',
            JSON.stringify(sanitizedModel),
          );
          setColumnVisibilityModel(sanitizedModel);
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
        // Use the new editing API with processRowUpdate (MUI best practice)
        onProcessRowUpdate={async (newRow, oldRow) => {
          const { id } = newRow;

          // Check which field changed
          const changedField = Object.keys(newRow).find(
            (key) => newRow[key] !== oldRow[key],
          );

          if (!changedField) return newRow;

          const value = newRow[changedField];

          // Transform text fields to uppercase before saving
          const shouldUppercase =
            typeof value === 'string' && !numberFields.includes(changedField);
          const finalValue = shouldUppercase ? value.toUpperCase() : value;

          await updatePhase(id.toString(), changedField, finalValue);

          // Return the updated row with uppercase value if needed
          if (shouldUppercase) {
            return { ...newRow, [changedField]: finalValue };
          }

          return newRow;
        }}
        isCellEditable={isCellEditable}
        getCellClassName={getCellClassName}
        getRowClassName={(params) => {
          const isEven = params.indexRelativeToCurrentPage % 2 === 0;
          if (params.row.completed) {
            return isEven ? 'completed-row-light' : 'completed-row-dark';
          }
          return isEven ? 'row-even' : 'row-odd';
        }}
        // Enable Excel-like navigation with enhanced settings
        enableExcelNavigation
        autoCommitOnNavigation
        enterBehavior='next-row'
        tabBehavior='next-cell'
        skipNonEditableCells
        wrapNavigation
        debugMode={false}
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

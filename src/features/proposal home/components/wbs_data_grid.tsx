import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { Box } from '@mui/system';
import {
  GridCellEditCommitParams,
  GridCellParams,
  GridColumns,
  GridRowId,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridValueFormatterParams,
} from '@mui/x-data-grid';

import { updateWbs } from '../../../api/wbs';
import { StyledDataGrid } from '../../../components/custom_data_grid';
import { useProposalPreferences } from '../../../hooks/proposal_preferences_hook';
import { useUserProfile } from '../../../hooks/user_profile_hook';
import { Wbs } from '../../../models/wbs';
import { StoreState, estimatorStore } from '../../../utils/store';
import { numberFields } from '../../../utils/utils';
import ExportMenu from './export_menu';

function WbsDataGrid({
  openSelectWbsDialog,
}: {
  openSelectWbsDialog: () => void;
}) {
  const { proposalId, wbsId, phaseId } = useParams();
  const wbs = estimatorStore(
    (state: StoreState) => state.visibleWbs[proposalId!] || [],
  );
  const loading = estimatorStore((state: StoreState) => state.loading);
  const proposalPreferences = useProposalPreferences(proposalId ?? '');
  const [selectedRows, setSelectedRows] = React.useState<GridRowId[]>([]);
  const [data, setData] = React.useState<Wbs[]>([]);

  const { hasWritePermissions } = useUserProfile();
  useEffect(() => {
    const temp = [...wbs].sort((a, b) => a.wbsDatabaseId! - b.wbsDatabaseId!);
    setData(temp);
  }, [wbs]);

  function CustomToolbar() {
    const btnSx = {
      'borderRadius': 1,
      'border': '1px solid #e5e7eb',
      'px': 1,
      'height': 30,
      'color': '#374151',
      'fontWeight': 500,
      'fontSize': '0.75rem',
      'textTransform': 'none' as const,
      '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
    };
    return (
      <GridToolbarContainer
        sx={{
          'borderBottom': '1px solid #e5e7eb',
          'backgroundColor': '#ffffff',
          'px': 1.5,
          'py': 0.75,
          '& .MuiButton-startIcon svg': { fontSize: '14px !important' },
        }}>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <GridToolbarColumnsButton sx={btnSx} onResize={undefined} nonce={undefined} onResizeCapture={undefined} />
            <GridToolbarDensitySelector sx={btnSx} onResize={undefined} nonce={undefined} onResizeCapture={undefined} />
            <ExportMenu proposalId={proposalId!} proposalPreferences={proposalPreferences!} />
          </Box>
          <Button sx={btnSx} onClick={openSelectWbsDialog}>WBS Select</Button>
        </Box>
      </GridToolbarContainer>
    );
  }

  return (
    <Box
      sx={{
        'height': '100%',
        'width': '100%',

        '& .under': {
          backgroundColor: 'rgba(251, 191, 36, 0.12)',
          color: '#92400e',
        },
        '& .over': {
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: '#991b1b',
        },
        '& .not-used': {
          backgroundColor: '#f9fafb',
          color: '#d1d5db',
          textDecoration: 'line-through',
        },
        '& .editable-cell': {
          color: '#111827',
          fontWeight: 500,
        },
        '& .completed-row-light': {
          'backgroundColor': '#f0fdf4 !important',
          '& .MuiDataGrid-cell': { color: '#111827' },
        },
        '& .completed-row-dark': {
          'backgroundColor': '#ecfdf5 !important',
          '& .MuiDataGrid-cell': { color: '#111827' },
        },
      }}>
      <StyledDataGrid
        loading={loading}
        columns={columns}
        rows={data}
        pageSize={100}
        onSelectionModelChange={(newSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
        components={{ Toolbar: CustomToolbar }}
        onCellEditCommit={(params: GridCellEditCommitParams, event) => {
          const { id, field, value } = params;
          // Transform text fields to uppercase before saving
          const shouldUppercase = typeof value === 'string' && !numberFields.includes(field);
          const finalValue = shouldUppercase ? value.toUpperCase() : value;
          updateWbs(id.toString(), field, finalValue);
        }}
        isCellEditable={(params: GridCellParams<number>) => {
          if (!hasWritePermissions) {
            return false;
          }
          if (notEditableCells.includes(params.field)) {
            return false;
          }
          return true;
        }}
        getCellClassName={(params: GridCellParams<number>) => {
          let className = '';
          if (params.row.completed) {
            className += 'completed-row ';
          }
          if (!notEditableCells.includes(params.field)) {
            className += 'editable-cell';
          }
          return className;
        }}
        getRowClassName={(params) => {
          if (params.row.completed) {
            return params.indexRelativeToCurrentPage % 2 === 0
              ? 'completed-row-light'
              : 'completed-row-dark';
          }
          return '';
        }}
      />
    </Box>
  );
}

export default WbsDataGrid;

const columns: GridColumns = [
  {
    field: 'name',
    headerName: 'Wbs',
    minWidth: 100,
    editable: false,
    flex: 1,
    headerAlign: 'center',
  },

  {
    field: 'quantity',
    headerName: 'Quantity',
    minWidth: 80,
    align: 'right',
    flex: 1,
    headerAlign: 'center',
    editable: false,
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
    flex: 1,
    headerAlign: 'center',
    editable: false,
  },

  {
    field: 'craftManHours',
    headerName: 'Craft MH',
    editable: false,
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
    editable: false,
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
      return `$${valueFormatted}`;
    },
  },

  {
    field: 'welderManHours',
    headerName: 'Welder MH',
    editable: false,
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
    editable: false,
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
      return `$${valueFormatted}`;
    },
  },
  {
    field: 'materialCost',
    headerName: 'Material Total',
    minWidth: 120,
    hide: true,
    editable: false,
    flex: 1,
    align: 'right',
    headerAlign: 'center',
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return '';
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
  {
    field: 'equipmentCost',
    headerName: 'Equip Total',
    minWidth: 120,
    hide: true,
    editable: false,
    flex: 1,
    align: 'right',
    headerAlign: 'center',
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return '';
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },

  {
    field: 'subContractorCost',
    headerName: 'Sub Total',
    minWidth: 120,
    hide: true,
    editable: false,
    flex: 1,
    align: 'right',
    headerAlign: 'center',
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return '';
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
  {
    field: 'costOnlyCost',
    headerName: 'Cost Only Total',
    editable: false,
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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
  {
    field: 'totalCost',
    headerName: 'Total',
    minWidth: 120,
    editable: false,
    flex: 1,
    align: 'right',
    headerAlign: 'center',
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return '';
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
];

const notEditableCells = [
  'craftManHours',
  'craftCost',
  'welderManHours',
  'welderCost',
  'materialCost',
  'equipmentCost',
  'subContractorCost',
  'costOnlyCost',
  'totalCost',
];

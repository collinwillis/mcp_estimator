import { MenuItem, Select } from '@mui/material';
import { GridColumns, GridValueFormatterParams } from '@mui/x-data-grid-pro';

import { Activity, ActivityType } from '../../../models/activity';
import { EquipmentOwnership, EquipmentUnit } from '../../../models/equipment';

export const getActivityColumns = ({
  activities,
  hasWritePermissions,
  updateEquipmentOwnership,
  updateEquipmentUnit,
}: {
  activities: Activity[];
  hasWritePermissions: boolean;
  updateEquipmentUnit: (activity: Activity, unit: string) => Promise<void>;
  updateEquipmentOwnership: (
    activity: Activity,
    ownership: string,
  ) => Promise<void>;
}) => {
  const baseColumns: GridColumns = [
    {
      flex: 1,
      field: 'rowId',
      headerName: 'Item',
      editable: true,
      headerAlign: 'center',
      align: 'center',
      sortComparator: comparator,
    },
    {
      flex: 1,
      field: 'description',
      minWidth: 250,
      headerName: 'Description',
      editable: true,
      headerAlign: 'center',
    },
    {
      flex: 1,
      field: 'quantity',
      headerName: 'Quantity',
      editable: true,
      align: 'right',
      headerAlign: 'center',
    },
    {
      flex: 1,
      field: 'unit',
      renderCell: (params) => {
        const fullActivity = activities.find(
          (activity) => activity.id === params.id,
        );
        if (fullActivity?.activityType == ActivityType.equipmentItem) {
          return (
            <Select
              disabled={!hasWritePermissions}
              sx={{
                width: '100%',

                color: 'primary.dark',
                boxShadow: 'none',
                '.MuiOutlinedInput-notchedOutline': { border: 0 },
                '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':
                  {
                    border: 0,
                  },
                '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                  {
                    border: 0,
                  },
              }}
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={fullActivity.unit}
              onChange={(event) =>
                updateEquipmentUnit(fullActivity, event.target.value)
              }
            >
              {fullActivity.equipmentOwnership ===
              EquipmentOwnership.purchase ? (
                <MenuItem value={EquipmentUnit.each}>
                  {EquipmentUnit.each}
                </MenuItem>
              ) : (
                Object.values(EquipmentUnit).map(
                  (unit) =>
                    unit !== EquipmentUnit.each && (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ),
                )
              )}
            </Select>
          );
        }
      },
      headerName: 'Unit',
      editable: true,
      align: 'right',

      headerAlign: 'center',
    },
    {
      field: 'time',
      headerName: 'Duration',
      editable: true,
      align: 'right',
      hide: false,

      headerAlign: 'center',
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
      hide: false,
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
      flex: 1,
      field: 'equipmentOwnership',
      renderCell: (params) => {
        const fullActivity = activities.find(
          (activity) => activity.id === params.id,
        );
        if (fullActivity?.activityType == ActivityType.equipmentItem) {
          return (
            <Select
              disabled={!hasWritePermissions}
              sx={{
                width: '100%',

                color: 'primary.dark',
                boxShadow: 'none',
                '.MuiOutlinedInput-notchedOutline': { border: 0 },
                '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':
                  {
                    border: 0,
                  },
                '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                  {
                    border: 0,
                  },
              }}
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={
                fullActivity.equipmentOwnership ?? EquipmentOwnership.rental
              }
              onChange={(event) =>
                updateEquipmentOwnership(fullActivity, event.target.value)
              }
            >
              <MenuItem value={EquipmentOwnership.rental}>
                {EquipmentOwnership.rental}
              </MenuItem>
              <MenuItem value={EquipmentOwnership.owned}>
                {EquipmentOwnership.owned}
              </MenuItem>
              <MenuItem value={EquipmentOwnership.purchase}>
                {EquipmentOwnership.purchase}
              </MenuItem>
            </Select>
          );
        }
      },
      headerName: 'Ownership',
      editable: true,
      align: 'right',

      headerAlign: 'center',
    },
    {
      flex: 1,
      field: 'craftConstant',
      headerName: 'Craft Const.',
      editable: true,
      align: 'right',

      headerAlign: 'center',
    },
    {
      flex: 1,
      field: 'welderConstant',
      headerName: 'Welder Const.',
      editable: true,

      align: 'right',

      headerAlign: 'center',
    },
    {
      flex: 1,
      field: 'craftManHours',
      headerName: 'Craft Hours',

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
        return `${valueFormatted}`;
      },
    },

    {
      flex: 1,
      field: 'welderManHours',
      headerName: 'Welder Hours',

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
        return `${valueFormatted}`;
      },
    },

    {
      flex: 1,
      field: 'welderCost',
      headerName: 'Welder Total',

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
      flex: 1,
      field: 'craftCost',
      headerName: 'Craft Total',
      align: 'right',
      editable: true,
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
      flex: 1,
      field: 'craftBaseRate',
      headerName: 'Craft Base',

      align: 'right',
      headerAlign: 'center',
      valueFormatter: (params: GridValueFormatterParams<number>) => {
        if (params.value == null) {
          return '';
        }
        const valueFormatted = Number(params.value).toLocaleString();
        return `$${valueFormatted}`;
      },
      hide: true,
    },
    {
      flex: 1,
      field: 'subsistenceRate',
      headerName: 'Subsistence',

      align: 'right',
      headerAlign: 'center',
      valueFormatter: (params: GridValueFormatterParams<number>) => {
        if (params.value == null) {
          return '';
        }
        const valueFormatted = Number(params.value).toLocaleString();
        return `$${valueFormatted}`;
      },
      hide: true,
    },
    {
      flex: 1,
      field: 'equipmentCost',
      headerName: 'Equipment Total',

      align: 'right',
      editable: true,
      hide: false,

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

      align: 'right',
      editable: true,
      hide: false,
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

      hide: false,

      editable: true,
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
      headerName: 'Subcontractor Total',

      align: 'right',
      hide: false,

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
      flex: 1,
      field: 'totalCost',
      headerName: 'Total',

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
  // Return the static baseColumns array. Visibility of specific columns to be managed via columnVisibilityModel in the component.
  return baseColumns;
};
const comparator = (v1: String, v2: String) => {
  const lengthDifference = v1.length - v2.length;
  if (lengthDifference !== 0) return lengthDifference;
  if (v1 < v2) return -1;
  if (v1 > v2) return 1;
  return 0;
};

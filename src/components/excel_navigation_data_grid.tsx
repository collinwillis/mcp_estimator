import React, { useCallback, forwardRef, useRef, useEffect } from 'react';
import {
  DataGridPro,
  DataGridProProps,
  useGridApiRef,
  GridCellParams,
  GridCallbackDetails,
  GridColDef,
  GridEventListener,
  GridRowId,
  GridApi,
  GridCellEditStopParams,
  GridCellEditStopReasons,
} from '@mui/x-data-grid-pro';
import { styled, alpha } from '@mui/material';

/**
 * Excel-like Keyboard Navigation for MUI DataGrid Pro
 *
 * This component embraces the MUI v5 “new editing API” so that navigation
 * and editing follow the documented behaviors. The custom logic below simply
 * ensures that Tab/Enter commit edits before moving focus and that focus
 * stays inside the grid while editing.
 */

const StyledExcelGrid = styled(DataGridPro)(({ theme }) => {
  const surface =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : theme.palette.common.white;
  const borderColor = alpha('#0f172a', 0.12);
  const headerColor = '#f6f7fa';
  const zebraEven = alpha('#0f172a', 0.015);
  const zebraOdd = alpha('#0f172a', 0.035);
  const focusRing = alpha(theme.palette.primary.main, 0.45);

  return {
    'border': `1px solid ${borderColor}`,
    'borderRadius': 0,
    'backgroundColor': surface,
    'boxShadow': '0 12px 24px rgba(15, 23, 42, 0.08)',
    'overflow': 'hidden',
    'fontFamily': '"Barlow","Inter","Roboto","Helvetica",sans-serif',
    'color': '#0f172a',
    'WebkitFontSmoothing': 'antialiased',
    'MozOsxFontSmoothing': 'grayscale',
    'transition': 'none !important',
    '& *, & *::before, & *::after': {
      transition: 'none !important',
    },
    '& .MuiDataGrid-main': {
      backgroundColor: surface,
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: headerColor,
      borderBottom: `1px solid ${borderColor}`,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: '#475467',
      fontSize: '0.75rem',
      fontWeight: 600,
      minHeight: 52,
    },
    '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
      padding: '0 12px',
    },
    '& .MuiDataGrid-columnHeaderTitleContainer': {
      paddingLeft: 4,
    },
    '& .MuiDataGrid-virtualScrollerRenderZone': {
      '& .MuiDataGrid-row': {
        transition: 'transform 80ms ease-out',
      },
    },
    '& .MuiDataGrid-columnSeparator': {
      'width': 12,
      'maxWidth': 12,
      'right': -6,
      'transform': 'translateX(6px)',
      'cursor': 'col-resize',
      'color': alpha('#0f172a', 0.4),
      'opacity': 1,
      '& svg': {
        display: 'block',
        color: alpha('#0f172a', 0.4),
      },
      '&:hover svg': {
        color: theme.palette.primary.main,
      },
    },
    '& .MuiDataGrid-cell': {
      'display': 'flex',
      'alignItems': 'center',
      'padding': '0 12px',
      'lineHeight': 1.4,
      'fontSize': '0.95rem',
      'fontVariantNumeric': 'tabular-nums',
      'color': '#0f172a',
      'borderBottom': `1px solid ${alpha('#0f172a', 0.05)}`,
      'backgroundColor': 'transparent',
      'transition':
        'background-color 80ms ease-out, color 80ms ease-out, box-shadow 120ms ease-out',
      '&:focus': {
        transition: 'none !important',
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-1px',
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
      '&:focus-within': {
        transition: 'none !important',
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-1px',
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    },
    '& .MuiDataGrid-row': {
      'position': 'relative',
      'borderRadius': 0,
      '&.row-even .MuiDataGrid-cell:not(.over):not(.under):not(.not-used)': {
        backgroundColor: zebraEven,
      },
      '&.row-odd .MuiDataGrid-cell:not(.over):not(.under):not(.not-used)': {
        backgroundColor: zebraOdd,
      },
      '&:hover .MuiDataGrid-cell:not(.over):not(.under):not(.not-used)': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    },
    '& .MuiDataGrid-row.Mui-hovered': {
      boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '& .MuiDataGrid-row.Mui-selected': {
      'boxShadow': `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.25)}`,
      '& .MuiDataGrid-cell': {
        backgroundColor: `${alpha(theme.palette.primary.main, 0.05)} !important`,
      },
    },
    '& .MuiDataGrid-cell--editing': {
      'transition': 'none !important',
      'padding': '0 !important',
      'backgroundColor': '#ffffff !important',
      'borderRadius': 2,
      'outline': `2px solid ${focusRing}`,
      'outlineOffset': '-1px',
      'border': 'none !important',
      'boxShadow': '0 8px 20px rgba(15, 23, 42, 0.12)',
      '& .MuiInputBase-root': {
        backgroundColor: 'transparent !important',
        padding: 0,
        height: '100%',
        width: '100%',
      },
      '& .MuiInputBase-input': {
        padding: '0 8px',
        height: '100%',
        backgroundColor: 'transparent',
        fontWeight: 600,
        letterSpacing: '0.04em',
      },
    },
    '& .MuiDataGrid-cell.Mui-selected': {
      backgroundColor: `${alpha(theme.palette.primary.main, 0.08)} !important`,
    },
    '& .MuiDataGrid-cell[data-editable="false"]': {
      backgroundColor: alpha(theme.palette.action.disabled, 0.04),
      cursor: 'default',
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: `1px solid ${borderColor}`,
      backgroundColor: headerColor,
      minHeight: 52,
    },
    '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
      fontSize: '0.8rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#475467',
    },
    '& .MuiTablePagination-actions button': {
      color: '#475467',
    },
  };
});

interface ExcelNavigationDataGridProps
  extends Omit<DataGridProProps, 'apiRef'> {
  onProcessRowUpdate?: (newRow: any, oldRow: any) => Promise<any> | any;
  enableExcelNavigation?: boolean;
  autoCommitOnNavigation?: boolean;
  enterBehavior?: 'next-row' | 'stay' | 'next-cell';
  tabBehavior?: 'next-cell' | 'next-row' | 'default';
  skipNonEditableCells?: boolean;
  wrapNavigation?: boolean;
  debugMode?: boolean;
}

const isNavigableColumn = (col: GridColDef): boolean => {
  if (col.field === '__check__') return false;
  if (col.field === 'actions') return false;
  if (col.type === 'actions') return false;
  if (col.type === 'checkboxSelection') return false;
  if (col.field.startsWith('__')) return false;
  return col.editable !== false;
};

const isCellRuntimeEditable = (
  rowId: GridRowId,
  field: string,
  apiRef: React.MutableRefObject<GridApi>,
  isCellEditableProp?: (params: GridCellParams) => boolean,
): boolean => {
  try {
    const column = apiRef.current.getColumn(field);
    if (!column || column.editable === false) return false;

    if (isCellEditableProp) {
      const params = apiRef.current.getCellParams(rowId, field);
      return isCellEditableProp(params);
    }

    return column?.editable === true;
  } catch {
    const column = apiRef.current.getColumn(field);
    return column?.editable === true;
  }
};

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

export const ExcelNavigationDataGrid = forwardRef<
  GridApi,
  ExcelNavigationDataGridProps
>((props, ref) => {
  const {
    onProcessRowUpdate,
    enableExcelNavigation = true,
    autoCommitOnNavigation = true,
    enterBehavior = 'next-row',
    tabBehavior = 'next-cell',
    skipNonEditableCells = true,
    wrapNavigation = true,
    debugMode = false,
    columns,
    rows,
    onCellKeyDown,
    onCellDoubleClick,
    onCellEditStop,
    ...otherProps
  } = props;

  const apiRef = useGridApiRef();
  const isNavigating = useRef(false);
  const lastFocusedCell = useRef<{ id: GridRowId; field: string } | null>(null);
  const skipEditStopNavigation = useRef(false);

  React.useImperativeHandle(ref, () => apiRef.current, [apiRef]);

  const getNavigableColumns = useCallback(() => {
    const allColumns = apiRef.current.getAllColumns();
    return allColumns.filter(isNavigableColumn);
  }, [apiRef]);

  const findNextEditableCell = useCallback(
    (
      currentRowIndex: number,
      currentColIndex: number,
      direction: 'up' | 'down' | 'left' | 'right',
      navigableColumns: GridColDef[],
      allRows: GridRowId[],
    ): { rowIndex: number; colIndex: number } | null => {
      let rowIndex = currentRowIndex;
      let colIndex = currentColIndex;
      const maxIterations = allRows.length * navigableColumns.length;
      let iterations = 0;

      const moveToNext = () => {
        iterations += 1;
        if (iterations > maxIterations) return false;
        switch (direction) {
          case 'right':
            colIndex += 1;
            if (colIndex >= navigableColumns.length) {
              if (wrapNavigation && rowIndex < allRows.length - 1) {
                colIndex = 0;
                rowIndex += 1;
              } else if (wrapNavigation && rowIndex === allRows.length - 1) {
                colIndex = 0;
                rowIndex = 0;
              } else {
                colIndex = navigableColumns.length - 1;
                return false;
              }
            }
            break;
          case 'left':
            colIndex -= 1;
            if (colIndex < 0) {
              if (wrapNavigation && rowIndex > 0) {
                colIndex = navigableColumns.length - 1;
                rowIndex -= 1;
              } else if (wrapNavigation && rowIndex === 0) {
                colIndex = navigableColumns.length - 1;
                rowIndex = allRows.length - 1;
              } else {
                colIndex = 0;
                return false;
              }
            }
            break;
          case 'down':
            rowIndex += 1;
            if (rowIndex >= allRows.length) {
              if (wrapNavigation) {
                rowIndex = 0;
              } else {
                rowIndex = allRows.length - 1;
                return false;
              }
            }
            break;
          case 'up':
            rowIndex -= 1;
            if (rowIndex < 0) {
              if (wrapNavigation) {
                rowIndex = allRows.length - 1;
              } else {
                rowIndex = 0;
                return false;
              }
            }
            break;
          default:
            break;
        }
        return true;
      };

      if (!moveToNext()) return null;

      if (skipNonEditableCells) {
        while (true) {
          const currentRowId = allRows[rowIndex];
          const currentField = navigableColumns[colIndex]?.field;
          if (!currentField) break;

          const editable = isCellRuntimeEditable(
            currentRowId,
            currentField,
            apiRef,
            otherProps.isCellEditable,
          );

          if (editable) break;
          if (!moveToNext()) break;
        }
      }

      if (
        rowIndex >= 0 &&
        rowIndex < allRows.length &&
        colIndex >= 0 &&
        colIndex < navigableColumns.length
      ) {
        return { rowIndex, colIndex };
      }
      return null;
    },
    [skipNonEditableCells, wrapNavigation, apiRef, otherProps.isCellEditable],
  );

  const getNextCellPosition = useCallback(
    (
      currentCell: GridCellParams,
      direction: 'up' | 'down' | 'left' | 'right',
    ) => {
      const navigableColumns = getNavigableColumns();
      const allRows = apiRef.current.getAllRowIds();

      const currentColIndex = navigableColumns.findIndex(
        (col) => col.field === currentCell.field,
      );
      const currentRowIndex = allRows.findIndex(
        (rowId) => rowId === currentCell.id,
      );

      if (currentColIndex === -1 || currentRowIndex === -1) {
        if (debugMode) {
          console.warn('Unable to determine current cell position', {
            field: currentCell.field,
            id: currentCell.id,
          });
        }
        return null;
      }

      const nextPosition = findNextEditableCell(
        currentRowIndex,
        currentColIndex,
        direction,
        navigableColumns,
        allRows,
      );

      if (nextPosition) {
        return {
          id: allRows[nextPosition.rowIndex],
          field: navigableColumns[nextPosition.colIndex].field,
        };
      }
      return null;
    },
    [apiRef, getNavigableColumns, findNextEditableCell, debugMode],
  );

  const commitActiveCell = useCallback(
    async (params: GridCellParams) => {
      if (params.cellMode !== 'edit') return true;
      try {
        apiRef.current.stopCellEditMode({
          id: params.id,
          field: params.field,
        });
        await nextTick();
        return true;
      } catch (error) {
        if (debugMode) {
          console.error('Failed to commit cell', error);
        }
        return false;
      }
    },
    [apiRef, debugMode],
  );

  const navigateToCell = useCallback(
    async (
      cellPosition: { id: GridRowId; field: string } | null,
      startEdit: boolean = false,
    ) => {
      if (!cellPosition || isNavigating.current) return;
      try {
        isNavigating.current = true;
        apiRef.current.setCellFocus(cellPosition.id, cellPosition.field);
        lastFocusedCell.current = cellPosition;

        if (startEdit) {
          await nextTick();
          const column = apiRef.current.getColumn(cellPosition.field);
          if (column?.editable !== false) {
            apiRef.current.startCellEditMode({
              id: cellPosition.id,
              field: cellPosition.field,
            });
          }
        }
      } finally {
        setTimeout(() => {
          isNavigating.current = false;
        }, 30);
      }
    },
    [apiRef],
  );

  const handleCellKeyDown: GridEventListener<'cellKeyDown'> = useCallback(
    async (params: GridCellParams, event, details: GridCallbackDetails) => {
      if (!enableExcelNavigation) {
        if (onCellKeyDown) {
          onCellKeyDown(params, event, details);
        }
        return;
      }

      const key = event.key;
      const shiftKey = event.shiftKey;
      const isInEditMode = params.cellMode === 'edit';

      const commitIfNeeded = async (force: boolean = false) => {
        if (!force && !autoCommitOnNavigation) return true;
        return commitActiveCell(params);
      };

      if (isInEditMode) {
        if (key === 'Tab') {
          if (tabBehavior === 'default') {
            if (onCellKeyDown) onCellKeyDown(params, event, details);
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          if (isNavigating.current) return;

          skipEditStopNavigation.current = true;

          const direction =
            tabBehavior === 'next-row'
              ? shiftKey
                ? 'up'
                : 'down'
              : shiftKey
                ? 'left'
                : 'right';

          const committed = await commitIfNeeded(true);
          if (!committed) {
            skipEditStopNavigation.current = false;
            return;
          }

          const nextCell = getNextCellPosition(params, direction);
          await navigateToCell(nextCell, true);
          return;
        }

        if (key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();

          skipEditStopNavigation.current = true;

          if (enterBehavior === 'stay') {
            const committed = await commitIfNeeded(true);
            if (!committed) {
              skipEditStopNavigation.current = false;
              return;
            }
            await navigateToCell({ id: params.id, field: params.field }, true);
            return;
          }

          const direction =
            enterBehavior === 'next-cell'
              ? shiftKey
                ? 'left'
                : 'right'
              : shiftKey
                ? 'up'
                : 'down';

          const committed = await commitIfNeeded(true);
          if (!committed) {
            skipEditStopNavigation.current = false;
            return;
          }

          const nextCell = getNextCellPosition(params, direction);
          await navigateToCell(nextCell, true);
          return;
        }

        if (key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          skipEditStopNavigation.current = false;
          apiRef.current.stopCellEditMode({
            id: params.id,
            field: params.field,
            ignoreModifications: true,
          });
          return;
        }

        if (onCellKeyDown) {
          onCellKeyDown(params, event, details);
        }
        return;
      }
      if (key === 'Tab') {
        if (tabBehavior === 'default') {
          if (onCellKeyDown) onCellKeyDown(params, event, details);
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (isNavigating.current) return;

        const direction =
          tabBehavior === 'next-row'
            ? shiftKey
              ? 'up'
              : 'down'
            : shiftKey
              ? 'left'
              : 'right';

        const committed = await commitIfNeeded();
        if (!committed) return;

        const nextCell = getNextCellPosition(params, direction);
        await navigateToCell(nextCell, isInEditMode);
        return;
      }

      if (key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();

        if (enterBehavior === 'stay') {
          await commitIfNeeded();
          return;
        }

        const direction =
          enterBehavior === 'next-cell'
            ? shiftKey
              ? 'left'
              : 'right'
            : shiftKey
              ? 'up'
              : 'down';

        const committed = await commitIfNeeded();
        if (!committed) return;

        const nextCell = getNextCellPosition(params, direction);
        await navigateToCell(nextCell, isInEditMode);
        return;
      }

      if (key === 'F2') {
        event.preventDefault();
        event.stopPropagation();
        if (!isInEditMode) {
          const column = apiRef.current.getColumn(params.field);
          if (column?.editable !== false) {
            apiRef.current.startCellEditMode({
              id: params.id,
              field: params.field,
            });
          }
        } else {
          await commitActiveCell(params);
        }
        return;
      }

      if (onCellKeyDown) {
        onCellKeyDown(params, event, details);
      }
    },
    [
      enableExcelNavigation,
      autoCommitOnNavigation,
      tabBehavior,
      enterBehavior,
      onCellKeyDown,
      getNextCellPosition,
      navigateToCell,
      commitActiveCell,
    ],
  );

  const handleCellDoubleClick: GridEventListener<'cellDoubleClick'> =
    useCallback(
      (params: GridCellParams, event, details) => {
        const column = apiRef.current.getColumn(params.field);
        if (column?.editable !== false) {
          apiRef.current.startCellEditMode({
            id: params.id,
            field: params.field,
          });
        }

        if (onCellDoubleClick) {
          onCellDoubleClick(params, event, details);
        }
      },
      [apiRef, onCellDoubleClick],
    );

  const processRowUpdate = useCallback(
    async (newRow: any, oldRow: any) => {
      if (onProcessRowUpdate) {
        return onProcessRowUpdate(newRow, oldRow);
      }
      return newRow;
    },
    [onProcessRowUpdate],
  );

  const handleProcessRowUpdateError = useCallback((error: any) => {
    console.error('Error updating row:', error);
  }, []);

  const handleCellEditStop: GridEventListener<'cellEditStop'> = useCallback(
    async (params: GridCellEditStopParams, event, details) => {
      if (onCellEditStop) {
        onCellEditStop(params, event, details);
      }

      if (skipEditStopNavigation.current) {
        skipEditStopNavigation.current = false;
        return;
      }

      if (!enableExcelNavigation) {
        return;
      }

      const reason = params.reason;
      const keyboardEvent = event as React.KeyboardEvent;
      const shiftKey = keyboardEvent?.shiftKey ?? false;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      if (reason === GridCellEditStopReasons.enterKeyDown) {
        if (enterBehavior === 'stay') {
          await nextTick();
          await navigateToCell({ id: params.id, field: params.field }, false);
          return;
        }

        direction =
          enterBehavior === 'next-cell'
            ? shiftKey
              ? 'left'
              : 'right'
            : shiftKey
              ? 'up'
              : 'down';
      } else if (reason === GridCellEditStopReasons.tabKeyDown) {
        if (tabBehavior === 'default') {
          return;
        }

        direction =
          tabBehavior === 'next-row'
            ? shiftKey
              ? 'up'
              : 'down'
            : shiftKey
              ? 'left'
              : 'right';
      }

      if (!direction) {
        return;
      }

      await nextTick();
      const currentCell = apiRef.current.getCellParams(params.id, params.field);
      const nextCell = getNextCellPosition(currentCell, direction);
      if (nextCell) {
        await navigateToCell(nextCell, true);
      }
    },
    [
      onCellEditStop,
      enableExcelNavigation,
      enterBehavior,
      tabBehavior,
      apiRef,
      getNextCellPosition,
      navigateToCell,
    ],
  );

  useEffect(() => {
    if (lastFocusedCell.current && !isNavigating.current) {
      const { id, field } = lastFocusedCell.current;
      const rowExists = rows.some((row: any) => row.id === id);
      const columnExists = columns.some((col: any) => col.field === field);

      if (rowExists && columnExists) {
        requestAnimationFrame(() => {
          apiRef.current.setCellFocus(id, field);
        });
      }
    }
  }, [rows, columns, apiRef]);

  return (
    <StyledExcelGrid
      {...otherProps}
      apiRef={apiRef}
      columns={columns}
      rows={rows}
      editMode='cell'
      onCellKeyDown={handleCellKeyDown}
      onCellDoubleClick={handleCellDoubleClick}
      onCellEditStop={handleCellEditStop}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      experimentalFeatures={{
        ...(otherProps.experimentalFeatures || {}),
        newEditingApi: true,
      }}
      sx={{
        ...otherProps.sx,
        '& .MuiDataGrid-cell[data-editable="true"]:hover': {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
          cursor: 'text',
        },
        '& .MuiDataGrid-cell[data-editable="false"]:hover': {
          cursor: 'default',
        },
      }}
    />
  );
});

ExcelNavigationDataGrid.displayName = 'ExcelNavigationDataGrid';

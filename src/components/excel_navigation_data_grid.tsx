import React, { useCallback, forwardRef, useRef } from 'react';
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
  GridCellEditStartReasons,
} from '@mui/x-data-grid-pro';
import { styled, alpha } from '@mui/material';

/**
 * Excel-like Keyboard Navigation for MUI DataGrid Pro v5 (new editing API)
 *
 * Works WITH MUI's built-in editing system rather than fighting it:
 *
 *   - onCellEditStop  (high-priority prop handler, fires BEFORE MUI internals)
 *     Prevents MUI's default stop handling via `event.defaultMuiPrevented`,
 *     then commits + navigates to the next editable cell.
 *
 *   - onCellEditStart (high-priority prop handler, fires BEFORE MUI internals)
 *     Intercepts Enter in view mode to navigate instead of edit.
 *     Adds select-all on double-click edit.
 *
 *   - onCellKeyDown
 *     Only handles keys MUI doesn't: F2 (toggle edit) and Tab in view mode.
 *
 * MUI handles natively (untouched):
 *   - Printable key in view mode → type-to-replace (initialValue)
 *   - Arrow keys → grid navigation
 *   - Double-click → enter edit mode
 *   - Focus out → commit cell
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
    onCellKeyDown: onCellKeyDownProp,
    onCellDoubleClick: onCellDoubleClickProp,
    onCellEditStop: onCellEditStopProp,
    onCellEditStart: onCellEditStartProp,
    ...otherProps
  } = props;

  const apiRef = useGridApiRef();
  const lastFocusedCell = useRef<{ id: GridRowId; field: string } | null>(
    null,
  );
  const suppressSelectOnEdit = useRef(false);

  React.useImperativeHandle(ref, () => apiRef.current, [apiRef]);

  // ---------------------------------------------------------------------------
  //  Helpers
  // ---------------------------------------------------------------------------

  /** Select all text in the currently-editing cell's input (Excel-like). */
  const selectEditingCellInput = useCallback(() => {
    if (suppressSelectOnEdit.current) {
      suppressSelectOnEdit.current = false;
      return;
    }
    requestAnimationFrame(() => {
      const input = document.querySelector(
        '.MuiDataGrid-cell--editing input, .MuiDataGrid-cell--editing textarea',
      ) as HTMLInputElement | HTMLTextAreaElement | null;
      if (input) {
        input.select();
      }
    });
  }, []);

  const getNavigableColumns = useCallback(() => {
    const visibilityModel =
      (apiRef.current.state as any)?.columnVisibilityModel || {};
    const visibleColumns = apiRef.current.getVisibleColumns
      ? apiRef.current.getVisibleColumns()
      : apiRef.current
          .getAllColumns()
          .filter((col) => visibilityModel[col.field] !== false);
    return visibleColumns.filter(isNavigableColumn);
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
      currentCell: { id: GridRowId; field: string },
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

  /**
   * Navigate to a cell and optionally enter edit mode with text selected.
   * Uses requestAnimationFrame to let MUI finish processing the previous
   * stopCellEditMode before starting a new edit session.
   */
  const navigateAndEdit = useCallback(
    (
      cellPosition: { id: GridRowId; field: string } | null,
      startEdit: boolean,
    ) => {
      if (!cellPosition) return;

      lastFocusedCell.current = cellPosition;

      // Use rAF so MUI fully processes the stop before we start a new edit
      requestAnimationFrame(() => {
        apiRef.current.setCellFocus(cellPosition.id, cellPosition.field);

        if (startEdit) {
          const column = apiRef.current.getColumn(cellPosition.field);
          if (column?.editable !== false) {
            try {
              apiRef.current.startCellEditMode({
                id: cellPosition.id,
                field: cellPosition.field,
              });
              selectEditingCellInput();
            } catch (e) {
              if (debugMode) console.warn('Could not start edit mode:', e);
            }
          }
        }
      });
    },
    [apiRef, selectEditingCellInput, debugMode],
  );

  // ---------------------------------------------------------------------------
  //  Direction helpers
  // ---------------------------------------------------------------------------

  const getTabDirection = useCallback(
    (shiftKey: boolean): 'up' | 'down' | 'left' | 'right' =>
      tabBehavior === 'next-row'
        ? shiftKey
          ? 'up'
          : 'down'
        : shiftKey
          ? 'left'
          : 'right',
    [tabBehavior],
  );

  const getEnterDirection = useCallback(
    (shiftKey: boolean): 'up' | 'down' | 'left' | 'right' =>
      enterBehavior === 'next-cell'
        ? shiftKey
          ? 'left'
          : 'right'
        : shiftKey
          ? 'up'
          : 'down',
    [enterBehavior],
  );

  // ---------------------------------------------------------------------------
  //  onCellEditStop — fires BEFORE MUI's internal handler (high priority).
  //  We set event.defaultMuiPrevented = true so MUI never double-handles.
  // ---------------------------------------------------------------------------

  const handleCellEditStop = useCallback(
    (params: GridCellEditStopParams, event: any, details: any) => {
      // Forward to consumer's callback first
      if (onCellEditStopProp) {
        (onCellEditStopProp as any)(params, event, details);
      }

      if (!enableExcelNavigation) return;

      // Prevent MUI's internal handleCellEditStop from running
      event.defaultMuiPrevented = true;

      const { id, field, reason } = params;

      // Escape → discard modifications, stay on cell in view mode
      if (reason === GridCellEditStopReasons.escapeKeyDown) {
        apiRef.current.stopCellEditMode({
          id,
          field,
          ignoreModifications: true,
        });
        // Restore focus (MUI's internal handler won't since we prevented it)
        requestAnimationFrame(() => {
          apiRef.current.setCellFocus(id, field);
        });
        return;
      }

      // Focus out (click away) → commit, no navigation
      if (reason === ('cellFocusOut' as GridCellEditStopReasons)) {
        apiRef.current.stopCellEditMode({ id, field });
        return;
      }

      // Tab / Enter → commit + navigate to next editable cell + enter edit

      // Commit the current cell
      apiRef.current.stopCellEditMode({ id, field });

      const shiftKey = (event as React.KeyboardEvent)?.shiftKey ?? false;

      // Enter
      if (reason === GridCellEditStopReasons.enterKeyDown) {
        if (enterBehavior === 'stay') {
          // Re-enter edit on the same cell
          navigateAndEdit({ id, field }, true);
          return;
        }
        const direction = getEnterDirection(shiftKey);
        const nextCell = getNextCellPosition({ id, field }, direction);
        navigateAndEdit(nextCell, false);
        return;
      }

      // Tab / Shift+Tab
      if (
        reason === GridCellEditStopReasons.tabKeyDown ||
        reason === ('shiftTabKeyDown' as GridCellEditStopReasons)
      ) {
        if (tabBehavior === 'default') return;
        const direction =
          reason === ('shiftTabKeyDown' as GridCellEditStopReasons)
            ? getTabDirection(true)
            : getTabDirection(false);
        const nextCell = getNextCellPosition({ id, field }, direction);
        navigateAndEdit(nextCell, false);
        return;
      }
    },
    [
      onCellEditStopProp,
      enableExcelNavigation,
      apiRef,
      enterBehavior,
      tabBehavior,
      getEnterDirection,
      getTabDirection,
      getNextCellPosition,
      navigateAndEdit,
    ],
  );

  // ---------------------------------------------------------------------------
  //  onCellEditStart — fires BEFORE MUI's internal handler (high priority).
  //  Intercepts Enter in view mode to navigate instead of editing.
  //  Adds select-all text on double-click edit.
  // ---------------------------------------------------------------------------

  const handleCellEditStart = useCallback(
    (params: any, event: any) => {
      // Forward to consumer's callback
      if (onCellEditStartProp) {
        (onCellEditStartProp as any)(params, event);
      }

      if (!enableExcelNavigation) return;

      const reason = params.reason as GridCellEditStartReasons | undefined;

      // Enter in view mode → navigate instead of entering edit mode
      if (reason === GridCellEditStartReasons.enterKeyDown) {
        event.defaultMuiPrevented = true;

        if (enterBehavior === 'stay') return;

        const shiftKey = (event as React.KeyboardEvent)?.shiftKey ?? false;
        const direction = getEnterDirection(shiftKey);
        const nextCell = getNextCellPosition(
          { id: params.id, field: params.field },
          direction,
        );

        if (nextCell) {
          apiRef.current.setCellFocus(nextCell.id, nextCell.field);
          lastFocusedCell.current = nextCell;
        }
        return;
      }

      // Double-click → MUI enters edit mode natively.
      // Let it handle cursor placement (Excel = cursor at click position).
      if (reason === GridCellEditStartReasons.cellDoubleClick) {
        return;
      }

      // Printable key → MUI handles with initialValue (type-to-replace). Perfect.
      // Delete/Backspace → MUI handles with deleteValue (clears cell, enters edit).
    },
    [
      onCellEditStartProp,
      enableExcelNavigation,
      enterBehavior,
      getEnterDirection,
      getNextCellPosition,
      apiRef,
      selectEditingCellInput,
    ],
  );

  // ---------------------------------------------------------------------------
  //  onCellKeyDown — only for keys MUI doesn't handle:
  //    F2:  toggle edit mode
  //    Tab in view mode:  navigate to next editable cell
  //    Delete/Backspace in view mode:  clear + immediate commit
  // ---------------------------------------------------------------------------

  const handleCellKeyDown: GridEventListener<'cellKeyDown'> = useCallback(
    (params: GridCellParams, event, details: GridCallbackDetails) => {
      if (!enableExcelNavigation) {
        if (onCellKeyDownProp) onCellKeyDownProp(params, event, details);
        return;
      }

      const key = event.key;
      const isInEditMode = params.cellMode === 'edit';

      // F2: toggle edit mode (MUI has no default F2 handling)
      if (key === 'F2') {
        event.preventDefault();
        if (!isInEditMode) {
          const column = apiRef.current.getColumn(params.field);
          if (column?.editable !== false) {
            suppressSelectOnEdit.current = true;
            apiRef.current.startCellEditMode({
              id: params.id,
              field: params.field,
            });
          }
        } else {
          apiRef.current.stopCellEditMode({
            id: params.id,
            field: params.field,
          });
        }
        return;
      }

      // Tab in view mode (MUI only handles Tab in edit mode)
      if (key === 'Tab' && !isInEditMode) {
        if (tabBehavior === 'default') {
          if (onCellKeyDownProp) onCellKeyDownProp(params, event, details);
          return;
        }

        event.preventDefault();
        const direction = getTabDirection(event.shiftKey);
        const nextCell = getNextCellPosition(params, direction);
        if (nextCell) {
          apiRef.current.setCellFocus(nextCell.id, nextCell.field);
          lastFocusedCell.current = nextCell;
        }
        return;
      }

      // Delete in view mode: clear cell content, stay in view mode (Excel behavior)
      if (key === 'Delete' && !isInEditMode) {
        const column = apiRef.current.getColumn(params.field);
        if (!column || column.editable === false) {
          if (onCellKeyDownProp) onCellKeyDownProp(params, event, details);
          return;
        }

        // MUI enters edit with deleteValue; we immediately commit to clear + stay in view
        setTimeout(() => {
          try {
            apiRef.current.stopCellEditMode({
              id: params.id,
              field: params.field,
            });
          } catch {
            // Cell may already be in view mode
          }
        }, 0);
        return;
      }

      // Backspace in view mode: clear cell content and enter edit mode (Excel behavior)
      // Let MUI handle it natively — it enters edit with deleteValue (empty input, ready to type)
      if (key === 'Backspace' && !isInEditMode) {
        // MUI's default deleteValue behavior is exactly what we want here
        return;
      }

      // Pass everything else through
      if (onCellKeyDownProp) onCellKeyDownProp(params, event, details);
    },
    [
      enableExcelNavigation,
      onCellKeyDownProp,
      apiRef,
      tabBehavior,
      getTabDirection,
      getNextCellPosition,
    ],
  );

  // ---------------------------------------------------------------------------
  //  processRowUpdate wrapper
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  //  Restore focus after row/column data changes
  // ---------------------------------------------------------------------------

  React.useEffect(() => {
    if (lastFocusedCell.current) {
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

  // ---------------------------------------------------------------------------
  //  Render
  // ---------------------------------------------------------------------------

  return (
    <StyledExcelGrid
      {...otherProps}
      apiRef={apiRef}
      columns={columns}
      rows={rows}
      editMode='cell'
      onCellKeyDown={handleCellKeyDown}
      onCellEditStop={handleCellEditStop as any}
      onCellEditStart={handleCellEditStart as any}
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

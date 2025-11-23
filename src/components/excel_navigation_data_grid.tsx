import React, { useCallback, forwardRef, useRef, useEffect } from 'react';
import {
  DataGridPro,
  DataGridProProps,
  useGridApiRef,
  GridCellParams,
  GridRowParams,
  GridColDef,
  GridEventListener,
  GridCallbackDetails,
  GridCellModesModel,
  GridRowModesModel,
  GridRowId,
  gridClasses,
  GridApiPro,
  GridColumnHeaderParams,
} from '@mui/x-data-grid-pro';
import { styled, alpha } from '@mui/material';

/**
 * Excel-like Keyboard Navigation for MUI DataGrid Pro
 *
 * Following MUI Best Practices and Documentation:
 * - Uses apiRef for programmatic control
 * - Implements processRowUpdate for the new editing API
 * - Provides Excel-standard keyboard shortcuts
 * - Keeps focus within the grid during editing
 *
 * Version 2.0 - Polished and Production Ready
 */

// Enhanced styled wrapper with Excel-like visual feedback
const StyledExcelGrid = styled(DataGridPro)(({ theme }) => ({
  'border': 0,
  '& .MuiDataGrid-cell': {
    '&:focus': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '-1px',
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    '&:focus-within': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '-1px',
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  // Highlight the current editing cell with stronger visual feedback
  '& .MuiDataGrid-cell--editing': {
    'backgroundColor': 'rgb(255,255,255) !important',
    'border': `2px solid ${theme.palette.primary.main} !important`,
    'boxShadow': `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    '& .MuiInputBase-input': {
      padding: '0 8px',
      height: '100%',
    },
  },
  // Visual feedback for navigation
  '& .MuiDataGrid-cell.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  // Ensure proper focus styles
  '& .MuiDataGrid-cell:focus-within': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '-1px',
  },
  // Make non-editable cells visually distinct
  '& .MuiDataGrid-cell[data-editable="false"]': {
    backgroundColor: alpha(theme.palette.action.disabled, 0.04),
    cursor: 'default',
  },
}));

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

// Helper function to check if a column should be included in navigation
const isNavigableColumn = (col: GridColDef): boolean => {
  // Skip these column types
  if (col.field === '__check__') return false;
  if (col.field === 'actions') return false;
  if (col.type === 'actions') return false;
  if (col.type === 'checkboxSelection') return false;
  if (col.field.startsWith('__')) return false; // Skip internal columns

  // Only include editable columns or columns explicitly marked as navigable
  return col.editable !== false;
};

// Helper to check if a specific cell is editable at runtime
// This handles cases where getCellClassName might mark cells as non-editable
const isCellRuntimeEditable = (
  rowId: GridRowId,
  field: string,
  apiRef: React.MutableRefObject<GridApiPro>,
  isCellEditableProp?: (params: GridCellParams) => boolean,
): boolean => {
  try {
    // First check column-level editability
    const column = apiRef.current.getColumn(field);
    if (!column || column.editable === false) return false;

    // Get the row data
    const row = apiRef.current.getRow(rowId);
    if (!row) return false;

    // If there's a custom isCellEditable function, use it
    if (isCellEditableProp) {
      const params: GridCellParams = {
        id: rowId,
        field,
        row,
        value: row[field],
        colDef: column,
        cellMode: 'view',
        tabIndex: -1,
        hasFocus: false,
        isEditable: true,
        // @ts-ignore - GridCellParams might have more properties
      };
      return isCellEditableProp(params);
    }

    // Default to column's editable setting
    return column.editable !== false;
  } catch (error) {
    // If we can't determine, assume it's editable if the column allows it
    const column = apiRef.current.getColumn(field);
    return column?.editable !== false;
  }
};

// Helper to wait for next tick
const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Enhanced DataGrid with Excel-like keyboard navigation
 * Based on MUI DataGrid Pro documentation best practices
 * Version 2.0 with improved polish and bug fixes
 */
export const ExcelNavigationDataGrid = forwardRef<
  GridApiPro,
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
    ...otherProps
  } = props;

  // Use apiRef for programmatic control (MUI best practice)
  const apiRef = useGridApiRef();

  // Track if we're currently navigating to prevent race conditions
  const isNavigating = useRef(false);

  // Track the last focused cell
  const lastFocusedCell = useRef<{ id: GridRowId; field: string } | null>(null);

  // Expose apiRef through forwardRef if needed
  React.useImperativeHandle(ref, () => apiRef.current, [apiRef]);

  /**
   * Get all navigable columns (skip checkboxes, actions, etc.)
   */
  const getNavigableColumns = useCallback(() => {
    const allColumns = apiRef.current.getAllColumns();
    return allColumns.filter(isNavigableColumn);
  }, [apiRef]);

  /**
   * Find the next editable cell in a given direction
   * Properly handles wrapping and non-editable cells
   */
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

      // Helper to move to next position
      const moveToNext = () => {
        iterations++;
        if (iterations > maxIterations) return false; // Prevent infinite loop

        switch (direction) {
          case 'right':
            colIndex++;
            if (colIndex >= navigableColumns.length) {
              if (wrapNavigation && rowIndex < allRows.length - 1) {
                colIndex = 0;
                rowIndex++;
              } else {
                colIndex = navigableColumns.length - 1;
                return false;
              }
            }
            break;

          case 'left':
            colIndex--;
            if (colIndex < 0) {
              if (wrapNavigation && rowIndex > 0) {
                colIndex = navigableColumns.length - 1;
                rowIndex--;
              } else {
                colIndex = 0;
                return false;
              }
            }
            break;

          case 'down':
            rowIndex++;
            if (rowIndex >= allRows.length) {
              if (wrapNavigation) {
                rowIndex = 0; // Wrap to first row
              } else {
                rowIndex = allRows.length - 1;
                return false;
              }
            }
            break;

          case 'up':
            rowIndex--;
            if (rowIndex < 0) {
              if (wrapNavigation) {
                rowIndex = allRows.length - 1; // Wrap to last row
              } else {
                rowIndex = 0;
                return false;
              }
            }
            break;
        }
        return true;
      };

      // Move at least once
      if (!moveToNext()) return null;

      // If we should skip non-editable cells, keep moving until we find an editable one
      if (skipNonEditableCells) {
        while (true) {
          const currentRowId = allRows[rowIndex];
          const currentField = navigableColumns[colIndex]?.field;

          if (!currentField) break;

          // Check if this specific cell is editable at runtime
          // This handles cells with multiple classes (e.g., 'over editable-cell')
          const isEditable = isCellRuntimeEditable(
            currentRowId,
            currentField,
            apiRef,
            otherProps.isCellEditable,
          );

          if (isEditable) break; // Found an editable cell

          if (!moveToNext()) break; // Can't move further
        }
      }

      // Validate the final position
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

  /**
   * Get the next cell coordinates based on navigation direction
   * Enhanced with proper editable cell detection
   */
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

      // If current position is invalid, return null
      if (currentColIndex === -1 || currentRowIndex === -1) {
        if (debugMode) {
          console.warn('Current cell position not found in navigable cells', {
            field: currentCell.field,
            id: currentCell.id,
            navigableColumns: navigableColumns.map((c) => c.field),
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
   * Navigate to a cell and optionally start edit mode
   * Enhanced with proper async handling and error recovery
   */
  const navigateToCell = useCallback(
    async (
      cellPosition: { id: GridRowId; field: string } | null,
      startEdit: boolean = false,
    ) => {
      if (!cellPosition || isNavigating.current) return;

      try {
        isNavigating.current = true;

        // Set focus to the cell
        apiRef.current.setCellFocus(cellPosition.id, cellPosition.field);
        lastFocusedCell.current = cellPosition;

        if (startEdit) {
          // Wait for focus to be established
          await nextTick();

          // Check if the cell is actually editable
          const column = apiRef.current.getColumn(cellPosition.field);
          if (column?.editable !== false) {
            // Start edit mode
            const result = apiRef.current.startCellEditMode({
              id: cellPosition.id,
              field: cellPosition.field,
            });

            if (debugMode && !result) {
              console.warn('Failed to start edit mode for cell', cellPosition);
            }
          }
        }
      } catch (error) {
        if (debugMode) {
          console.error('Error navigating to cell:', error);
        }
      } finally {
        // Reset navigation flag after a small delay
        setTimeout(() => {
          isNavigating.current = false;
        }, 50);
      }
    },
    [apiRef, debugMode],
  );

  /**
   * Enhanced keyboard navigation handler
   * Implements Excel-standard keyboard shortcuts with polish
   */
  const handleCellKeyDown: GridEventListener<'cellKeyDown'> = useCallback(
    async (
      params: GridCellParams,
      event: React.KeyboardEvent,
      details: GridCallbackDetails,
    ) => {
      // Only handle navigation if Excel navigation is enabled
      if (!enableExcelNavigation) {
        // Call parent handler if provided
        if (onCellKeyDown) {
          onCellKeyDown(params, event, details);
        }
        return;
      }

      const key = event.key;
      const shiftKey = event.shiftKey;
      const ctrlKey = event.ctrlKey || event.metaKey;
      const isInEditMode = params.cellMode === 'edit';

      // Handle different keys
      switch (key) {
        case 'Tab': {
          // CRITICAL: Always prevent Tab from leaving the grid
          event.preventDefault();
          event.stopPropagation();

          // Don't navigate if we're already navigating (prevent double navigation)
          if (isNavigating.current) return;

          // Determine navigation direction
          const direction = shiftKey ? 'left' : 'right';

          // Get next cell position
          const nextCell = getNextCellPosition(params, direction);

          if (nextCell) {
            // If in edit mode, commit current cell first
            if (isInEditMode && autoCommitOnNavigation) {
              apiRef.current.stopCellEditMode({
                id: params.id,
                field: params.field,
              });

              // Wait for edit to complete
              await nextTick();
            }

            // Navigate to next cell and optionally start edit
            await navigateToCell(nextCell, isInEditMode);
          }
          break;
        }

        case 'Enter': {
          // Handle Enter key based on modifiers
          if (!ctrlKey) {
            event.preventDefault();
            event.stopPropagation();

            // Don't navigate if we're already navigating
            if (isNavigating.current) return;

            // Determine direction based on Shift key
            const direction = shiftKey ? 'up' : 'down';

            // Handle based on enterBehavior setting
            let navigationDirection = direction;
            if (!shiftKey && enterBehavior === 'next-cell') {
              navigationDirection = 'right' as any;
            } else if (!shiftKey && enterBehavior === 'stay') {
              // Stay in current cell
              if (isInEditMode) {
                apiRef.current.stopCellEditMode({
                  id: params.id,
                  field: params.field,
                });
              }
              return;
            }

            // Get next cell position
            const nextCell = getNextCellPosition(params, navigationDirection);

            if (nextCell) {
              // If in edit mode, commit current cell first
              if (isInEditMode) {
                apiRef.current.stopCellEditMode({
                  id: params.id,
                  field: params.field,
                });

                // Wait for edit to complete
                await nextTick();
              }

              // Navigate to next cell
              await navigateToCell(nextCell, isInEditMode);
            }
          }
          break;
        }

        case 'Escape': {
          // Cancel edit without saving
          if (isInEditMode) {
            event.preventDefault();
            event.stopPropagation();

            apiRef.current.stopCellEditMode({
              id: params.id,
              field: params.field,
              ignoreModifications: true,
            });
          }
          break;
        }

        case 'F2': {
          // Toggle edit mode (Excel standard)
          event.preventDefault();
          event.stopPropagation();

          if (!isInEditMode) {
            // Check if cell is editable
            const column = apiRef.current.getColumn(params.field);
            if (column?.editable !== false) {
              apiRef.current.startCellEditMode({
                id: params.id,
                field: params.field,
              });
            }
          } else {
            // Exit edit mode
            apiRef.current.stopCellEditMode({
              id: params.id,
              field: params.field,
            });
          }
          break;
        }

        case 'Delete':
        case 'Backspace': {
          // Clear cell content and enter edit mode
          if (!isInEditMode) {
            event.preventDefault();
            event.stopPropagation();

            // Check if cell is editable
            const column = apiRef.current.getColumn(params.field);
            if (column?.editable !== false) {
              // Clear the value and start edit mode
              const rowUpdate = { ...params.row, [params.field]: '' };
              apiRef.current.updateRows([rowUpdate]);

              // Start edit mode
              apiRef.current.startCellEditMode({
                id: params.id,
                field: params.field,
              });
            }
          }
          break;
        }

        // Arrow key navigation enhancements
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          // Only handle arrow keys when not in edit mode
          if (!isInEditMode) {
            // Let MUI handle default arrow navigation
            // But we can enhance it to skip non-editable cells if needed
            if (skipNonEditableCells) {
              event.preventDefault();
              event.stopPropagation();

              const direction = key.replace('Arrow', '').toLowerCase() as any;
              const nextCell = getNextCellPosition(params, direction);

              if (nextCell) {
                await navigateToCell(nextCell, false);
              }
            }
          }
          // If in edit mode, allow arrow keys to work within the input
          break;
        }

        // Copy/Paste support
        case 'c': {
          if (ctrlKey && !isInEditMode) {
            event.preventDefault();
            const value = params.value?.toString() || '';

            try {
              await navigator.clipboard.writeText(value);

              if (debugMode) {
                console.log('Copied to clipboard:', value);
              }
            } catch (error) {
              console.error('Failed to copy to clipboard:', error);
            }
          }
          break;
        }

        case 'v': {
          if (ctrlKey && !isInEditMode) {
            event.preventDefault();

            // Check if cell is editable
            const column = apiRef.current.getColumn(params.field);
            if (column?.editable === false) return;

            try {
              const text = await navigator.clipboard.readText();
              if (text) {
                // Update the cell value
                const rowUpdate = { ...params.row, [params.field]: text };
                apiRef.current.updateRows([rowUpdate]);

                // Trigger processRowUpdate if provided
                if (onProcessRowUpdate) {
                  await onProcessRowUpdate(rowUpdate, params.row);
                }
              }
            } catch (error) {
              console.error('Failed to paste from clipboard:', error);
            }
          }
          break;
        }

        // Select all in edit mode
        case 'a': {
          if (ctrlKey && isInEditMode) {
            // Let default behavior handle select all in input
            // Don't prevent default
          } else if (ctrlKey && !isInEditMode) {
            // Could implement cell range selection here
            event.preventDefault();
          }
          break;
        }

        // Home/End key support (Excel standard)
        case 'Home': {
          if (!isInEditMode) {
            event.preventDefault();
            event.stopPropagation();

            const navigableColumns = getNavigableColumns();
            const allRows = apiRef.current.getAllRowIds();
            const currentRowIndex = allRows.findIndex((id) => id === params.id);

            if (ctrlKey) {
              // Ctrl+Home: Go to first cell
              if (navigableColumns.length > 0 && allRows.length > 0) {
                await navigateToCell(
                  {
                    id: allRows[0],
                    field: navigableColumns[0].field,
                  },
                  false,
                );
              }
            } else {
              // Home: Go to first cell in current row
              if (navigableColumns.length > 0 && currentRowIndex >= 0) {
                await navigateToCell(
                  {
                    id: params.id,
                    field: navigableColumns[0].field,
                  },
                  false,
                );
              }
            }
          }
          break;
        }

        case 'End': {
          if (!isInEditMode) {
            event.preventDefault();
            event.stopPropagation();

            const navigableColumns = getNavigableColumns();
            const allRows = apiRef.current.getAllRowIds();
            const currentRowIndex = allRows.findIndex((id) => id === params.id);

            if (ctrlKey) {
              // Ctrl+End: Go to last cell
              if (navigableColumns.length > 0 && allRows.length > 0) {
                await navigateToCell(
                  {
                    id: allRows[allRows.length - 1],
                    field: navigableColumns[navigableColumns.length - 1].field,
                  },
                  false,
                );
              }
            } else {
              // End: Go to last cell in current row
              if (navigableColumns.length > 0 && currentRowIndex >= 0) {
                await navigateToCell(
                  {
                    id: params.id,
                    field: navigableColumns[navigableColumns.length - 1].field,
                  },
                  false,
                );
              }
            }
          }
          break;
        }
      }

      // Call parent handler if provided
      if (onCellKeyDown) {
        onCellKeyDown(params, event, details);
      }
    },
    [
      apiRef,
      enableExcelNavigation,
      autoCommitOnNavigation,
      enterBehavior,
      getNextCellPosition,
      navigateToCell,
      onProcessRowUpdate,
      onCellKeyDown,
      skipNonEditableCells,
      getNavigableColumns,
      debugMode,
    ],
  );

  /**
   * Handle cell double click - enter edit mode (Excel standard)
   */
  const handleCellDoubleClick: GridEventListener<'cellDoubleClick'> =
    useCallback(
      (
        params: GridCellParams,
        event: React.MouseEvent,
        details: GridCallbackDetails,
      ) => {
        // Check if cell is editable
        const column = apiRef.current.getColumn(params.field);
        if (column?.editable !== false) {
          apiRef.current.startCellEditMode({
            id: params.id,
            field: params.field,
          });
        }

        // Call parent handler if provided
        if (onCellDoubleClick) {
          onCellDoubleClick(params, event, details);
        }
      },
      [apiRef, onCellDoubleClick],
    );

  /**
   * Process row updates with the new editing API
   * Following MUI DataGrid Pro documentation
   */
  const processRowUpdate = useCallback(
    async (newRow: any, oldRow: any) => {
      try {
        // Call the parent's processRowUpdate if provided
        if (onProcessRowUpdate) {
          return await onProcessRowUpdate(newRow, oldRow);
        }
        return newRow;
      } catch (error) {
        console.error('Error processing row update:', error);
        throw error; // Re-throw to trigger error handler
      }
    },
    [onProcessRowUpdate],
  );

  /**
   * Handle process row update error
   */
  const handleProcessRowUpdateError = useCallback((error: any) => {
    console.error('Error updating row:', error);
    // Could show a snackbar or other error notification here
  }, []);

  // Add effect to restore focus after data changes
  useEffect(() => {
    if (lastFocusedCell.current && !isNavigating.current) {
      const { id, field } = lastFocusedCell.current;
      // Check if the cell still exists
      const rowExists = rows.some((row: any) => row.id === id);
      const columnExists = columns.some((col: any) => col.field === field);

      if (rowExists && columnExists) {
        // Restore focus to last focused cell
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
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      // Disable cell selection on single click (use double-click for edit like Excel)
      disableCellSelectionOnClick
      // Keep focus visible
      hideFooterSelectedRowCount
      disableRowSelectionOnClick
      // Experimental features for better keyboard control
      experimentalFeatures={{
        // Enable new editing API if available
        newEditingApi: true,
      }}
      // Enhanced column configuration
      // @ts-ignore - columnHeaderHeight might not be in types yet
      columnHeaderHeight={56}
      // Ensure cells are focusable
      tabIndex={0}
      // Additional props for better keyboard navigation
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

// Export helper hook for advanced usage
export const useExcelNavigation = (
  apiRef: React.MutableRefObject<GridApiPro>,
) => {
  const navigateToCell = useCallback(
    (rowId: GridRowId, field: string) => {
      apiRef.current.setCellFocus(rowId, field);
    },
    [apiRef],
  );

  const startEditingCell = useCallback(
    (rowId: GridRowId, field: string) => {
      apiRef.current.startCellEditMode({ id: rowId, field });
    },
    [apiRef],
  );

  const stopEditingCell = useCallback(
    (rowId: GridRowId, field: string, ignoreModifications = false) => {
      apiRef.current.stopCellEditMode({
        id: rowId,
        field,
        ignoreModifications,
      });
    },
    [apiRef],
  );

  const getNavigableCells = useCallback(() => {
    const columns = apiRef.current.getAllColumns();
    return columns.filter(isNavigableColumn);
  }, [apiRef]);

  return {
    navigateToCell,
    startEditingCell,
    stopEditingCell,
    getNavigableCells,
  };
};

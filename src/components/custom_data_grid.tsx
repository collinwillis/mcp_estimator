import { styled } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';

export const StyledDataGrid = styled(DataGridPro)(() => ({
  'border': 'none',
  'color': '#111827',
  'fontFamily': '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
  'WebkitFontSmoothing': 'antialiased',
  'fontSize': '0.875rem',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    minHeight: '36px !important',
    maxHeight: '36px !important',
  },
  '& .MuiDataGrid-columnHeader': {
    padding: '0 10px',
  },
  '& .MuiDataGrid-cell': {
    'padding': '0 10px',
    'borderBottom': '1px solid #f3f4f6',
    'fontVariantNumeric': 'tabular-nums',
    '&:focus': {
      outline: '2px solid #2563eb',
      outlineOffset: '-2px',
    },
  },
  '& .MuiDataGrid-row': {
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
    '&:nth-of-type(odd)': {
      backgroundColor: '#fafafa',
    },
  },
  '& .MuiDataGrid-row.Mui-selected': {
    'backgroundColor': 'rgba(37, 99, 235, 0.04)',
    '&:hover': {
      backgroundColor: 'rgba(37, 99, 235, 0.06)',
    },
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    minHeight: '36px !important',
  },
  '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  '& .MuiCheckbox-root': {
    'color': '#d1d5db',
    '&.Mui-checked': {
      color: '#111827',
    },
  },
}));

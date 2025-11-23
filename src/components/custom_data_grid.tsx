import { styled } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';

function CustomCheckBox() {
  return {
    '& .MuiCheckbox-root svg': {
      width: 16,
      height: 16,
      backgroundColor: 'transparent',
      border: '1px solid #d9d9d9',
      borderRadius: 2,
    },
    '& .MuiCheckbox-root svg path': {
      display: 'none',
    },
    '& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg': {
      backgroundColor: '#067cc1',
      borderColor: '#067cc1',
    },
    '& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after': {
      position: 'absolute',
      display: 'table',
      border: '2px solid #fff',
      borderTop: 0,
      borderLeft: 0,
      transform: 'rotate(45deg) translate(-50%,-50%)',
      opacity: 1,
      transition: 'all .2s cubic-bezier(.12,.4,.29,1.46) .1s',
      content: '""',
      top: '50%',
      left: '39%',
      width: 5.71428571,
      height: 9.14285714,
    },
    '& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after':
      {
        width: 8,
        height: 8,
        backgroundColor: '#067cc1',
        transform: 'none',
        top: '39%',
        border: 0,
      },
  };
}

export const StyledDataGrid = styled(DataGridPro)(() => ({
  'border': 0,
  'color': 'rgba(0,0,0,.85)',
  'fontFamily': [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  'WebkitFontSmoothing': 'auto',
  'letterSpacing': 'normal',
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: '#ffffff', // Header background color
    fontWeight: 'bold', // Make header text bold
    borderBottom: '2px solid #e0e0e0', // Slightly thicker border for header
  },
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: '#ffffff', // Footer background color
    borderTop: '2px solid #e0e0e0', // Slightly thicker border for footer
  },
  '& .MuiPaginationItem-root': {
    'backgroundColor': '#067cc1', // Primary color for pagination items
    'color': '#ffffff', // White text for pagination items
    'borderRadius': '50%', // Rounded pagination items
    '&:hover': {
      backgroundColor: '#005a8c', // Darker primary color on hover
    },
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: '1px solid #e0e0e0',
    padding: '8px', // Consistent padding for cells
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: '1px solid #e0e0e0',
  },
  '& .MuiDataGrid-cell': {
    'color': 'rgba(0,0,0,.85)',
    '&:hover': {
      backgroundColor: '#f5f5f5', // Light background on hover
    },
  },
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: '#f5f5f5', // Light background for headers
  },
  '& .MuiDataGrid-row': {
    '&:nth-of-type(even)': {
      backgroundColor: '#fafafa', // Light background for alternate rows
    },
    '&:hover': {
      backgroundColor: '#f0f0f0', // Light background on hover for rows
    },
  },
  // Custom checkbox styles
  ...CustomCheckBox(),
}));

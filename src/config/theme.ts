// export const estimatorTheme = createTheme({
//   palette: {
//     primary: {
//       main: "#007AFF",
//       light: "#80B5FF",
//       dark: "#0050B5",
//     },
//     secondary: {
//       main: "#FF9800",
//       light: "#FFB74D",
//       dark: "#FB8C00",
//     },
//     error: red,
//     warning: amber,
//     success: green,
//     info: lightBlue,
//     background: {
//       default: "blue",
//     },
//   },
//   typography: {
//     fontFamily: ["Open Sans", "sans-serif"].join(","),
//   },
// });

// export const estimatorTheme = createTheme({
//   palette: {
//     background: {
//       default: "#F5F5F5",
//     },
//     text: {
//       primary: "#9B9B9B",
//     },
//     primary: {
//       main: "#007AFF",
//       light: "#80B5FF",
//       dark: "#0050B5",
//     },
//     secondary: {
//       main: "#FF9800",
//       light: "#FFB74D",
//       dark: "#FB8C00",
//     },
//   },
//   typography: {
//     fontFamily: ["Open Sans", "sans-serif"].join(","),
//   },
// });

import { createTheme } from '@mui/material/styles';

export const estimatorTheme = createTheme({
  palette: {
    primary: {
      main: '#424242', // Changed to a dark gray for a professional look
      light: '#6d6d6d',
      dark: '#1b1b1b',
    },
    secondary: {
      main: '#bdbdbd', // Light gray as a secondary color
      light: '#efefef',
      dark: '#8d8d8d',
    },
    error: {
      main: '#d32f2f', // Standard Material-UI error color
      light: '#e57373',
      dark: '#b71c1c',
    },
    warning: {
      main: '#ffa000', // Standard Material-UI warning color
      light: '#ffb300',
      dark: '#ff6f00',
    },
    info: {
      main: '#1976d2', // Muted blue for informational elements
      light: '#2196f3',
      dark: '#1565c0',
    },
    success: {
      main: '#388e3c', // Standard Material-UI success color
      light: '#4caf50',
      dark: '#2e7d32',
    },
    background: {
      default: '#f9f9f9', // Off-white background
      paper: '#ffffff', // White paper for cards and surfaces
    },
    text: {
      primary: '#333333', // Dark gray text for better readability
      secondary: '#555555', // Medium gray for secondary text
    },
    divider: '#e0e0e0', // Light gray dividers
  },
  typography: {
    fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      color: '#212121', // Dark gray for headings
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      color: '#212121',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
      color: '#212121',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.5,
      color: '#212121',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.6,
      color: '#212121',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
      color: '#212121',
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      color: '#424242',
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      color: '#424242',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#424242',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: '#424242',
    },
    button: {
      fontSize: '0.875rem',
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      color: '#757575',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      lineHeight: 2.66,
      color: '#757575',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px', // Slightly sharper corners for a modern look
          textTransform: 'none',
          padding: '6px 12px',
        },
        containedPrimary: {
          'backgroundColor': '#424242',
          'color': '#ffffff',
          '&:hover': {
            backgroundColor: '#1b1b1b',
          },
        },
        containedSecondary: {
          'backgroundColor': '#bdbdbd',
          'color': '#000000',
          '&:hover': {
            backgroundColor: '#8d8d8d',
          },
        },
        outlinedPrimary: {
          'borderColor': '#424242',
          'color': '#424242',
          '&:hover': {
            borderColor: '#1b1b1b',
            backgroundColor: '#f0f0f0',
          },
        },
        outlinedSecondary: {
          'borderColor': '#bdbdbd',
          'color': '#424242',
          '&:hover': {
            borderColor: '#8d8d8d',
            backgroundColor: '#f0f0f0',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#424242',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333333',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#333333',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f0f0f0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#424242',
        },
        body: {
          color: '#555555',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e0e0',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          'color': '#424242',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
        input: {
          color: '#333333',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          'backgroundColor': '#ffffff',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#424242',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#424242',
          },
        },
        notchedOutline: {
          borderColor: '#bdbdbd',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#424242',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#424242',
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#424242',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: '#bdbdbd',
        },
        track: {
          backgroundColor: '#bdbdbd',
        },
        colorPrimary: {
          '&.Mui-checked': {
            color: '#424242',
          },
        },
      },
    },
  },
});

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
      main: '#067cc1',
      light: '#5aa7d4',
      dark: '#004f7e',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#fb8c00',
    },
    error: {
      main: '#e53935',
      light: '#ef5350',
      dark: '#b71c1c',
    },
    warning: {
      main: '#ffb300',
      light: '#ffca28',
      dark: '#ff6f00',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
    },
    success: {
      main: '#43a047',
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: ['Open Sans', 'sans-serif'].join(','),
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '1rem',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.2,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          padding: '8px 16px',
        },
        containedPrimary: {
          'backgroundColor': '#067cc1',
          '&:hover': {
            backgroundColor: '#005a8c',
          },
        },
        containedSecondary: {
          'backgroundColor': '#ff9800',
          '&:hover': {
            backgroundColor: '#fb8c00',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#067cc1',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          color: '#333',
        },
        h2: {
          color: '#333',
        },
        h3: {
          color: '#333',
        },
        h4: {
          color: '#333',
        },
        h5: {
          color: '#333',
        },
        h6: {
          color: '#333',
        },
        body1: {
          color: '#555',
        },
        body2: {
          color: '#555',
        },
      },
    },
  },
});

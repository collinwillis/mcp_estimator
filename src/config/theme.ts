import { createTheme } from "@mui/material";
import {
  amber,
  blue,
  deepOrange,
  green,
  lightBlue,
  red,
} from "@mui/material/colors";
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

export const estimatorTheme = createTheme({
  palette: {
    primary: {
      main: "#007AFF",
      light: "#80B5FF",
      dark: "#0050B5",
    },
    secondary: {
      main: "#FF9800",
      light: "#FFB74D",
      dark: "#FB8C00",
    },
    error: {
      main: "#F44336",
    },
    warning: {
      main: "#FFC107",
    },
    info: {
      main: "#03A9F4",
    },
    success: {
      main: "#4CAF50",
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: ["Open Sans", "sans-serif"].join(","),
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: "3.5rem",
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: "2.5rem",
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: "2rem",
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.2,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      fontSize: "1rem",
      textTransform: "none",
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.2,
    },
  },
});

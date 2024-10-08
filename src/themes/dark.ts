import { createTheme } from "@mui/material/styles";

// neon green
const outlineColor = "#dddddd";
const softBorderRadius = "12px";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiCardHeader: {
      styleOverrides: {
        title: {
          font: "bold 1.5rem/1.5em 'Orbitron', sans-serif",
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: "h1" },
          style: {
            font: "bold 1.5rem/1.5em 'Orbitron', sans-serif",
          },
        },
      ],
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          font: "bold 1.5rem/1.5em 'Orbitron', sans-serif",
        },
      },
      variants: [
        {
          props: { variant: "regular" },
          style: {
            border: `1px solid ${outlineColor}`,
            borderRadius: softBorderRadius,
          },
        },
      ],
    },
    MuiCard: {
      variants: [
        {
          props: { variant: "outlined" },
          style: {
            border: `1px solid ${outlineColor}`,
            borderRadius: softBorderRadius,
            padding: "4px",
          },
        },
      ],
    },
  },
});

export default theme;

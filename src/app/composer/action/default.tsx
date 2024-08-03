"use client";
import { FC, PropsWithChildren } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import dark from "@/themes/dark";

export const DefaultProvider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <ThemeProvider theme={dark}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

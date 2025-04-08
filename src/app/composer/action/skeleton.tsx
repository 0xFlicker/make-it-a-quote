import React, { FC } from "react";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";

export const Skeleton: FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Toolbar />
      <Box sx={{ flexGrow: 1, overflow: "auto" }}></Box>
      <BottomNavigation />
    </Box>
  );
};

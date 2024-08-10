import React, { FC } from "react";
import Toolbar from "@mui/material/Toolbar";
import { FileMenu } from "./FileMenu";

export const EmptyBar: FC<{
  onImport: () => void;
}> = ({ onImport }) => {
  return (
    <Toolbar>
      <FileMenu onImport={onImport} />
    </Toolbar>
  );
};

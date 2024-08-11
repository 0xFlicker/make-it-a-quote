import React, { FC } from "react";
import Toolbar from "@mui/material/Toolbar";
import { FileMenu } from "./FileMenu";

export const EmptyBar: FC<{
  onImport: () => void;
  onImportEmbed: (embed: string) => void;
  onImportParentPfp: (parentPfp: string) => void;
  embeds?: string[];
  parentPfp?: string;
}> = ({ onImport, onImportEmbed, onImportParentPfp, embeds, parentPfp }) => {
  return (
    <Toolbar>
      <FileMenu
        onImport={onImport}
        onImportEmbed={onImportEmbed}
        onImportParentPfp={onImportParentPfp}
        embeds={embeds}
        parentPfp={parentPfp}
      />
    </Toolbar>
  );
};

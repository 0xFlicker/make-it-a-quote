import React, { FC, useCallback, useMemo } from "react";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { FileMenu } from "./FileMenu";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";
import { ZOrderButtonGroup } from "./ZOrderButtnGroup";

export const ImageBar: FC<{
  onImport: () => void;
  onImportEmbed: (embed: string) => void;
  onImportParentPfp: (parentPfp: string) => void;
  embeds?: string[];
  parentPfp?: string;
  fabricCanvas?: CanvasWithSafeArea | null;
}> = ({
  onImport,
  onImportEmbed,
  onImportParentPfp,
  embeds,
  parentPfp,
  fabricCanvas,
}) => {
  return (
    <Toolbar>
      <FileMenu
        onImport={onImport}
        onImportEmbed={onImportEmbed}
        onImportParentPfp={onImportParentPfp}
        embeds={embeds}
        parentPfp={parentPfp}
      />
      <Box sx={{ flexGrow: 1 }} />
      <ZOrderButtonGroup fabricCanvas={fabricCanvas} />
    </Toolbar>
  );
};

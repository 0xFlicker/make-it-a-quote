import React, { FC } from "react";
import Toolbar from "@mui/material/Toolbar";
import { FileMenu } from "./FileMenu";

export const EmptyBar: FC<{
  onDownload: () => void;
  onImport: () => void;
  onImportEmbed: (embed: string) => void;
  onImportParentPfp: (parentPfp: string) => void;
  embeds?: string[];
  parentPfp?: string;
}> = ({
  onDownload,
  onImport,
  onImportEmbed,
  onImportParentPfp,
  embeds,
  parentPfp,
}) => {
  return (
    <Toolbar>
      <FileMenu
        onDownload={onDownload}
        onImport={onImport}
        onImportEmbed={onImportEmbed}
        onImportParentPfp={onImportParentPfp}
        embeds={embeds}
        parentPfp={parentPfp}
      />
    </Toolbar>
  );
};

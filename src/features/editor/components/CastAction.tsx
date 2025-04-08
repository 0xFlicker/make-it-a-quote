"use client";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { PfpCanvas } from "./PfpCanvas";
import SendIcon from "@mui/icons-material/Send";
import DocumentIcon from "@mui/icons-material/Download";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";
import { useEditableImage } from "../hooks/useEditableImage";
import { useCast } from "../hooks/useCast";
import { useExport } from "../hooks/useExport";
import { FormatsProvider } from "./Formats/useFormats";
import {
  BottomNavigation,
  BottomNavigationAction,
  Toolbar,
} from "@mui/material";
import { FileMenu } from "./FileMenu";

interface CastActionProps {
  imageUrl: string;
  aspectRatio?: number;
  castId?: `0x${string}`;
}

export const CastAction: FC<CastActionProps> = ({
  imageUrl,
  aspectRatio = 1,
  castId,
}) => {
  const [fabricCanvas, setFabricCanvas] = useState<CanvasWithSafeArea | null>(
    null,
  );
  const toolbarHeight = 64;

  const onCanvasReady = useCallback((canvas: CanvasWithSafeArea | null) => {
    setFabricCanvas(canvas);
  }, []);

  // Load the image onto the canvas
  useEditableImage({
    aspectRatio,
    canvas: fabricCanvas,
    src: imageUrl,
    onLoaded: () => {
      console.log("Image loaded successfully");
    },
    onSelected: () => {
      console.log("Image selected");
    },
  });

  // Setup cast functionality
  const doCast = useCast({
    fabricCanvas,
    castId,
  });

  // Setup download functionality (for FormatBar)
  const download = useExport({
    fabricCanvas,
    exportHeight: 512,
  });

  // Dummy functions for FormatBar
  const onImport = useCallback(() => {
    console.log("Import not available in CastAction");
  }, []);

  const onImportEmbed = useCallback(() => {
    console.log("Import embed not available in CastAction");
  }, []);

  const onImportParentPfp = useCallback(() => {
    console.log("Import parent pfp not available in CastAction");
  }, []);

  const onDownload = useCallback(() => {
    console.log("Download not available in CastAction");
  }, []);

  return (
    <FormatsProvider>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Toolbar>
          <FileMenu
            onImport={onImport}
            onImportEmbed={onImportEmbed}
            onImportParentPfp={onImportParentPfp}
            onDownload={onDownload}
          />
        </Toolbar>
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            height: `calc(100vh - ${toolbarHeight}px)`,
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            <PfpCanvas
              onCanvasReady={onCanvasReady}
              aspectRatio={aspectRatio}
            />
          </Box>
        </Container>
        <BottomNavigation
          showLabels
          sx={{ width: "100%" }}
          onChange={(_, newValue: number) => {
            switch (newValue) {
              case 0: {
                doCast();
                break;
              }
              default: {
                break;
              }
            }
          }}
        >
          <BottomNavigationAction label="Cast" icon={<SendIcon />} />
        </BottomNavigation>
      </Box>
    </FormatsProvider>
  );
};

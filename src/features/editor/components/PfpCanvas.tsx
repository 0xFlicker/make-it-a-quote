import { CSSProperties, FC, useRef } from "react";
import Box from "@mui/material/Box";
import { FabricCanvasWrapper } from "./FabricCanvasWrapper";
import { handleResizeImage } from "../helpers/resizeImage";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";

export const PfpCanvas: FC<{
  onCanvasReady: (canvas: CanvasWithSafeArea | null) => void;
}> = ({ onCanvasReady }) => {
  const safeAreaRef = useRef<HTMLDivElement>(null);
  const centerControlsRef = useRef<HTMLDivElement>(null);
  return (
    <Box
      ref={centerControlsRef}
      flexGrow={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
      padding="16px 0px"
      height="100%"
    >
      <FabricCanvasWrapper
        contentResizeHandler={handleResizeImage}
        onCanvasReady={onCanvasReady}
        safeAreaRef={safeAreaRef}
        safeAreaContainerRef={centerControlsRef}
      />
      <Box
        ref={safeAreaRef}
        style={{ "--aspect-ratio": 1 } as CSSProperties}
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="calc(400px * var(--aspect-ratio))"
        maxWidth={`calc(100% - ${2 * 16}px)`}
        sx={{
          aspectRatio: 1,
        }}
      ></Box>
    </Box>
  );
};

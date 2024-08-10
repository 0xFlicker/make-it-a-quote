import { CSSProperties, FC, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { FabricCanvasWrapper } from "./FabricCanvasWrapper";
import { handleResizeImage } from "../helpers/resizeImage";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";

export const PfpCanvas: FC<{
  onCanvasReady: (canvas: CanvasWithSafeArea | null) => void;
  aspectRatio?: number;
  width?: number;
  height?: number;
}> = ({ aspectRatio, onCanvasReady, width, height }) => {
  const safeAreaRef = useRef<HTMLDivElement>(null);
  const centerControlsRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const styles = useMemo(() => {
    return {
      safeArea: {
        backgroundColor: theme.palette.grey[300],
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 600,
        width: 600,
        maxWidth: `calc(100% - ${2 * 16}px)`,
        // [theme.breakpoints.up("sm")]: {
        //   width: "calc(300px * var(--aspect-ratio))", // Example for extra small screens
        // },
        // [theme.breakpoints.up("md")]: {
        //   width: "calc(400px * var(--aspect-ratio))", // Small screens
        // },
        // [theme.breakpoints.up("lg")]: {
        //   width: "calc(500px * var(--aspect-ratio))", // Medium screens
        // },
        // [theme.breakpoints.up("xl")]: {
        //   width: "calc(600px * var(--aspect-ratio))", // Large screens
        // },
        "--aspect-ratio": aspectRatio ?? 1,
      } as CSSProperties,
    };
  }, [
    aspectRatio,
    theme.breakpoints,
    theme.palette.grey,
    theme.shadows,
    theme.shape.borderRadius,
  ]);
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
      <Box ref={safeAreaRef} style={styles.safeArea}></Box>
    </Box>
  );
};

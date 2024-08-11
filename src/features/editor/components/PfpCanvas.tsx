import {
  CSSProperties,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { FabricCanvasWrapper } from "./FabricCanvasWrapper";
import { handleResizeImage } from "../helpers/resizeImage";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";

export const PfpCanvas: FC<{
  onCanvasReady: (canvas: CanvasWithSafeArea | null) => void;
  aspectRatio?: number;
}> = ({ aspectRatio = 1, onCanvasReady }) => {
  const safeAreaRef = useRef<HTMLDivElement>(null);
  const centerControlsRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<CanvasWithSafeArea | null>(null);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    setZoom((prevZoom) =>
      Math.min(Math.max(prevZoom + event.deltaY * 0.001, 0.75), 2),
    );
    canvasRef.current?.renderAll();
  };

  const handlePinch = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      const distance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      );
      setZoom((prevZoom) =>
        Math.min(Math.max(prevZoom * (distance / 100), 0.75), 2),
      );
      canvasRef.current?.renderAll();
    }
  };

  useEffect(() => {
    const centerControls = centerControlsRef.current;
    if (centerControls) {
      centerControls.addEventListener("wheel", handleWheel);
      centerControls.addEventListener("touchmove", handlePinch);
    }
    return () => {
      if (centerControls) {
        centerControls.removeEventListener("wheel", handleWheel);
        centerControls.removeEventListener("touchmove", handlePinch);
      }
    };
  }, []);
  const styles = useMemo(() => {
    const minSize = Math.min(
      centerControlsRef.current?.clientWidth || 0,
      centerControlsRef.current?.clientHeight || 0,
    );
    const size = Math.max(minSize * 0.85, 600 * zoom);
    const width = size * aspectRatio;
    const height = size / aspectRatio;
    return {
      safeArea: {
        backgroundColor: theme.palette.grey[300],
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height,
        width,
        // maxWidth: `calc(100% - ${2 * 16}px)`,
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
    theme.palette.grey,
    theme.shadows,
    theme.shape.borderRadius,
    zoom,
  ]);

  const handleCanvasReady = useCallback(
    (canvas: CanvasWithSafeArea | null) => {
      onCanvasReady(canvas);
      canvasRef.current = canvas;
    },
    [onCanvasReady],
  );
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
      overflow="hidden"
    >
      <FabricCanvasWrapper
        contentResizeHandler={handleResizeImage}
        onCanvasReady={handleCanvasReady}
        safeAreaRef={safeAreaRef}
        safeAreaContainerRef={centerControlsRef}
      />
      <Box ref={safeAreaRef} style={styles.safeArea}></Box>
    </Box>
  );
};

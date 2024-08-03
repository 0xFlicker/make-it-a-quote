/*
 * Handles init, resizing. measuring safe area.
 * Handles mount/remount
 */
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const setDimensions = (
  fabricCanvas: CanvasWithSafeArea,
  safeAreaContainerRect: DOMRect,
) => {
  const { width: safeAreaContainerWidth, height: safeAreaContainerHeight } =
    safeAreaContainerRect;

  const nextHeight = Math.trunc(safeAreaContainerHeight);
  const nextWidth = Math.trunc(safeAreaContainerWidth);

  const currentHeight = Math.trunc(fabricCanvas.getHeight());
  const currentWidth = Math.trunc(fabricCanvas.getWidth());

  if (currentHeight === nextHeight && currentWidth === nextWidth) return;

  fabricCanvas.setDimensions({ width: nextWidth, height: nextHeight });
};

function calcCanUseResizeObserver(): boolean {
  // See https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
  // for a list of supported browsers/versions.
  return typeof global.ResizeObserver !== "undefined";
}

export type CanvasProps = {
  safeAreaRef?: RefObject<HTMLElement>;
  safeAreaContainerRef?: RefObject<HTMLElement>;
  contentResizeHandler?: (fabricCanvas: CanvasWithSafeArea) => void;
  onCanvasReady?: (canvas: CanvasWithSafeArea | null) => void;
  /**
   * This attribute has been added to support a case in DA where we have a canvas and we want the brush cursor to display
   * but there is no image on the canvas. With this we set a canvas class property to be accessed anywhere we need
   * some condition to work with a canvas without an image.
   */
  isCanvasWithoutImage?: boolean;
  disablePointerEvents?: boolean;
  shouldFabricCanvasBeOnWindow?: boolean;
};

const useThrottleResize = (
  resizeFunction: () => void,
  delay: number,
): (() => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(() => {
    if (!timeoutRef.current) {
      // We want to call it once during the beginning, if the delay is large
      // because in non-window resizing contexts we don't want to wait
      if (delay > 0) resizeFunction();

      timeoutRef.current = setTimeout(() => {
        resizeFunction();
        timeoutRef.current = null;
      }, delay);
    }
  }, [resizeFunction, delay]);
};

declare global {
  interface Window {
    fabricCanvas?: CanvasWithSafeArea;
  }
}

/**
 * This Wrapper has a specific role:
 * - connects a canvas HTML element to a fabric instance
 * - adds the fabricInstance to the correct context, getting the setter from outside
 * - takes care of resizing the html element when the layout change size
 * - takes care of resizing executing a custom content resizing function
 * - dispose the canvas when the html element is unmounted
 */
export const FabricCanvasWrapper = ({
  safeAreaRef,
  safeAreaContainerRef,
  onCanvasReady,
  contentResizeHandler,
  isCanvasWithoutImage,
  disablePointerEvents = false,
  shouldFabricCanvasBeOnWindow = false,
}: CanvasProps): JSX.Element => {
  const canvasRef = useRef(null);
  // we can't use context anymore here.
  const [internalFabricCanvas, setInternalFabricCanvas] =
    useState<CanvasWithSafeArea | null>(null);

  // handles mount and unmount
  useEffect(() => {
    if (canvasRef.current) {
      // create the canvas instance
      const fabricCanvas = new CanvasWithSafeArea(canvasRef.current, {
        isCanvasWithoutImage,
      });

      if (shouldFabricCanvasBeOnWindow && typeof window !== "undefined") {
        window.fabricCanvas = fabricCanvas;
      }

      // set it in the state of the provider.
      // this will cause an app react re-render.
      onCanvasReady?.(fabricCanvas);
      setInternalFabricCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
        onCanvasReady?.(null);
        setInternalFabricCanvas(null);
      };
    }

    return () => {};
  }, [isCanvasWithoutImage, onCanvasReady, shouldFabricCanvasBeOnWindow]);

  const handleResizeCanvas = useCallback(() => {
    const { current: currentSafeAreaContainer } = safeAreaContainerRef ?? {};
    const { current: currentSafeArea } = safeAreaRef ?? {};

    if (currentSafeArea && currentSafeAreaContainer && internalFabricCanvas) {
      const safeAreaContainerRect =
        currentSafeAreaContainer.getBoundingClientRect();
      const safeAreaRect = currentSafeArea.getBoundingClientRect();

      setDimensions(internalFabricCanvas, safeAreaContainerRect);

      // The safeArea x and y must be in relation to the _canvas_ coordinate space
      // not to the window coordinate space. This assumes the safe area
      // element is overlaying the canvas element.
      internalFabricCanvas.updateSafeArea({
        width: safeAreaRect.width,
        height: safeAreaRect.height,
        x: safeAreaRect.x - safeAreaContainerRect.x,
        y: safeAreaRect.y - safeAreaContainerRect.y,
      });

      contentResizeHandler?.(internalFabricCanvas);
    }
  }, [
    safeAreaRef,
    safeAreaContainerRef,
    internalFabricCanvas,
    contentResizeHandler,
  ]);

  const throttledHandleResizeCanvas = useThrottleResize(
    handleResizeCanvas,
    // Firefox freezes if we set the canvas dimensions too often,
    // Chrome & Safari glitch flash if we don't use a timeout.
    typeof window !== "undefined" &&
      window?.navigator.userAgent.includes("Firefox")
      ? 300
      : 0,
  );

  // ResizeObserver for the canvas container.
  useEffect(() => {
    // We need to resize once before the resize observer to ensure
    // the canvas is ready for the first image load
    handleResizeCanvas();

    if (calcCanUseResizeObserver()) {
      // We don't actually care about what's in the entries array that can be
      // accessed as an argument to the `ResizeObserver` callback, we just want
      // to know _when_ one of the observed elements has changed size. We
      // _always_ need to know the size of all the observed elements, and the
      // entries array is not guaranteed to contain all of them, only the ones
      // that have changed.
      const resizeObserver = new ResizeObserver(throttledHandleResizeCanvas);

      const safeArea = safeAreaRef?.current;
      const safeAreaContainer = safeAreaContainerRef?.current;

      if (safeArea && safeAreaContainer) {
        resizeObserver.observe(safeArea);
        resizeObserver.observe(safeAreaContainer);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }

    return () => {};
  }, [
    handleResizeCanvas,
    throttledHandleResizeCanvas,
    internalFabricCanvas,
    safeAreaRef,
    safeAreaContainerRef,
  ]);

  return (
    <div
      style={{
        pointerEvents: disablePointerEvents ? "none" : "auto",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <canvas id="fabric-canvas-id" ref={canvasRef} />
    </div>
  );
};

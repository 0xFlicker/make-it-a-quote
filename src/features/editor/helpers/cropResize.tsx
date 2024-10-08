import { EditableImage } from "../fabric/EditableImage";
import { handleResizeImage } from "./resizeImage";
import { CanvasWithSafeArea } from "./CanvasWithSafeArea";
import { fixedAspectRatioCroppingControlSet } from "./fixedAssetCropHandlers";
import { autoFill, getZoomValue, zoomHelper } from "./zoomInsideCropArea";
import Crop from "@mui/icons-material/Crop";
import { useState } from "react";

import type { CanvasContext, CanvasTool, CropState } from "./canvasTool";
import { canvasToolDefault } from "./canvasTool";
import { croppingControlSet } from "./crop";

const noop = () => {};

type AspectIdAndRatio = {
  ratio: number;
};

type LocalCropState = {
  ratio: number;
};

const MOUSE_WHEEL_THROTTLE_AMOUNT = 64;

const DEFAULT_LOCAL_CROP_STATE: LocalCropState = {
  ratio: -1,
};

export const DEFAULT_CROP_RENDER_STATE: CropState = {
  zoomValue: 1,
  cropX: 0,
  cropY: 0,
  // TODO investigate if there is a reliable way to know how large
  // image width and height is from the asset ( it needs to pick up a size )
  width: 1,
  height: 1,
};

export const getCropRenderState = (
  zoomValue: number,
  target: EditableImage,
) => {
  const { cropX, cropY, width, height } = target;
  const dimensions = target.getOriginalSize();

  const ret = {
    zoomValue,
    cropX: cropX / dimensions.width,
    cropY: cropY / dimensions.height,
    width: width / dimensions.width,
    height: height / dimensions.height,
  };
  return ret;
};

export const renderCrop = (
  canvas: CanvasWithSafeArea,
  cropRenderState: CropState = DEFAULT_CROP_RENDER_STATE,
  localCropState: LocalCropState = DEFAULT_LOCAL_CROP_STATE,
) => {
  const { cropX, cropY, width, height } = cropRenderState;
  const { ratio } = localCropState;

  if (width && height) {
    const target = canvas.getMainImage();
    if (!target) return;
    const dimensions = target.getOriginalSize();

    target.setFixedAspectData(ratio);

    // get the minimum dimensions to fit the crop area
    const minSize = Math.min(dimensions.width, dimensions.height);

    target.cropX = cropX * minSize;
    target.cropY = cropY * minSize;
    target.width = width * minSize;
    target.height = height * minSize;
    target.left = 0;
    target.top = 0;

    handleResizeImage(canvas);
  }
};

export const useCropAndResizeTool = (): CanvasTool => {
  const [_aspectRatio, setAspectRatio] = useState<AspectIdAndRatio>({
    ratio: -1,
  });
  const [zoomValue, setZoomValue] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const [enterState, setEnterState] = useState<LocalCropState>(
    DEFAULT_LOCAL_CROP_STATE,
  );

  // Not used internally by the tool, for controlling the aspect ratio of the canvas safe area
  const [contentAspectRatioOverride, setContentAspectRatioOverride] =
    useState<number>();

  // Zoom events can result in aspect ratios that no longer correspond
  // to the current preset aspect ratio. Check the current target image's
  // fixedAspectId, and align the local aspect ratio id if necessary.
  const alignAspectRatio = (canvas: CanvasWithSafeArea) => {
    const { ratio } = _aspectRatio;
    setAspectRatio({ ratio });
  };

  const onModifiedHandler = (
    canvas: CanvasWithSafeArea,
    eventData: any = {},
  ) => {
    if (eventData.action === "crop") {
      setIsDirty(true);

      // after a crop auto fill the canvas
      autoFill(canvas).then((zoomFactor = 1) => {
        setZoomValue(zoomFactor);
      });
    }

    if (eventData.action === "drag") setIsDirty(true);

    // prepare the code for the next crop drag
    // this could also be part of the class
    const target = canvas.getMainImage();

    target?.setupDragMatrix();
  };

  function throttle<Input extends any[], Output extends unknown>(
    fn: (...arg0: Input) => Output,
    wait: number,
  ) {
    let time = Date.now();
    return function (...arg0: Input) {
      if (time + wait - Date.now() < 0) {
        fn.apply(global, arg0);
        time = Date.now();
      }
    };
  }

  const debouncedModified = throttle<[CanvasWithSafeArea, number], void>(
    (canvas: CanvasWithSafeArea, zoomPct = 1) => {
      setZoomValue(zoomPct);
      // prepare the code for the next crop drag
      // this could also be part of the class
      const target = canvas.getMainImage();

      target?.fire("modified");
    },
    MOUSE_WHEEL_THROTTLE_AMOUNT,
  );

  const onMouseWheelHandler = (canvas: CanvasWithSafeArea, options: any) => {
    const target = canvas.getMainImage();
    const zoomPct = zoomHelper(canvas, options);

    if (target?.evented) debouncedModified(canvas, zoomPct);

    alignAspectRatio(canvas);
    setIsDirty(true);
  };

  // const onPresetAspectRatioChange = (
  //   canvas: CanvasWithSafeArea,
  //   ratio: number
  // ) => {
  //   const target = canvas.getMainImage();

  //   target.setFixedAspectData(ratio);
  //   target.resetToAspectRatio(ratio);
  //   autoFill(canvas);
  //   target.controls = fixedAspectRatioCroppingControlSet;

  //   const newZoomValue = getZoomValue(canvas);

  //   setAspectRatio({ ratio });
  //   setZoomValue(newZoomValue);
  //   setIsDirty(true);
  //   canvas.requestRenderAll();
  //   target.fire("modified");
  // };

  // const onZoom = (canvas: CanvasWithSafeArea, value: number) => {
  //   alignAspectRatio(canvas);
  //   setZoomValue(value);

  //   setIsDirty(true);
  // };

  const cropResizeTool: CanvasTool = {
    ...canvasToolDefault,
    icon: Crop,
    contentAspectRatioOverride,
    enter: ({ canvas, state }) => {
      const { crop } = state;
      const { zoomValue: zoom } = crop;

      const target = canvas.getMainImage();

      if (!target) return noop;

      canvas.setActiveObject(target);

      target.controls = croppingControlSet;

      target.hasControls = true;
      target.hasBorders = true;
      target.evented = true;
      target.isCropping = true;
      target.setCoords();
      canvas.requestRenderAll();

      setZoomValue(zoom);
      setIsDirty(false);
      setEnterState({
        ratio: target.fixedAspectRatio,
      });
      setAspectRatio({
        ratio: target.fixedAspectRatio,
      });
      setContentAspectRatioOverride(target.fixedAspectRatio);

      const modifiedHandler = (eventData: any) =>
        onModifiedHandler(canvas, eventData);
      const mouseWheelHandler = (eventData: any) =>
        onMouseWheelHandler(canvas, eventData);

      // target.on("deselected")
      target.on("modified", modifiedHandler);
      canvas.on("mouse:wheel", mouseWheelHandler);

      let onDeselectedHandler: () => void = () => {};
      let keepSelection = false;
      const leave = () => {
        target.off("modified", modifiedHandler);
        canvas.off("mouse:wheel", mouseWheelHandler);
        target.off("deselected", onDeselectedHandler);

        if (!keepSelection) {
          canvas.discardActiveObject();
        }
        target.hasControls = false;
        target.hasBorders = false;
        target.evented = false;
        target.isCropping = false;

        canvas.requestRenderAll();
      };

      function deselectedHandler(leave: () => void) {
        return () => {
          keepSelection = true;
          leave();
        };
      }

      target.on("deselected", (onDeselectedHandler = deselectedHandler(leave)));
      return leave;
    },
    apply: ({ state, canvas }) => {
      const targetImage = canvas?.getMainImage();

      if (!isDirty || !targetImage) return state;

      const crop = getCropRenderState(zoomValue, targetImage);

      return {
        ...state,
        crop,
      };
    },
    reset: ({ state, canvas }) => {
      const targetImage = canvas?.getMainImage();

      if (!targetImage) return state;

      const { crop, ...rest } = state;
      const { zoomValue: zoom } = crop;
      const { ratio } = enterState;

      renderCrop(canvas!, crop, enterState);
      setAspectRatio({ ratio });
      setZoomValue(zoom);
      setIsDirty(false);

      return { ...state, ...rest };
    },
    isDirty,
  };

  return cropResizeTool;
};

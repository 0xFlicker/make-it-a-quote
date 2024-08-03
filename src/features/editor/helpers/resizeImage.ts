import { type Point, util } from "fabric";

import { type CanvasWithSafeArea } from "./CanvasWithSafeArea";

export const handleResizeImage = (fabricCanvas: CanvasWithSafeArea) => {
  const { safeArea } = fabricCanvas;
  const fabricImage = fabricCanvas.getMainImage();

  if (
    safeArea &&
    safeArea.width &&
    fabricImage &&
    fabricImage.width &&
    fabricImage.height &&
    fabricCanvas.width
  ) {
    const scaleRatio = util.findScaleToCover(fabricImage, safeArea);

    // reposition the image in the center of canvas
    fabricImage.left = 0;
    fabricImage.top = 0;
    const safeAreaCenter = fabricCanvas.getCenterOfSafeArea();

    fabricCanvas.setZoom(scaleRatio);
    fabricCanvas.absolutePan({
      x: -safeAreaCenter.x,
      y: -safeAreaCenter.y,
    } as Point);

    // prepare the image for the next crop.
    fabricImage.setupDragMatrix?.();
  }
};

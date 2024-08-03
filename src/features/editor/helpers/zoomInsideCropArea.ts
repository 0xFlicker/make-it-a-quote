import type { EditableImage } from "../fabric/EditableImage";
import type { Image, Point, TMat2D } from "fabric";
import { util } from "fabric";

import { ZOOM_FACTOR } from "../constants/cropAspectRatioBar";
import { handleResizeImage } from "./resizeImage";
import type { CanvasWithSafeArea } from "./CanvasWithSafeArea";

const getMaxScale = (fabricCanvas: CanvasWithSafeArea): number =>
  util.findScaleToFit({ width: 10, height: 10 }, fabricCanvas.safeArea);

const getMinScale = (
  safeArea: CanvasWithSafeArea["safeArea"],
  fabricImage: EditableImage
) => {
  // get max crop size
  const ar = fabricImage.width / fabricImage.height;
  const abstractBox = { width: ar, height: 1 };
  const maxCropAbstractScale = util.findScaleToFit(
    abstractBox,
    fabricImage.getOriginalSize()
  );
  const cropSize = {
    width: ar * maxCropAbstractScale,
    height: maxCropAbstractScale,
  };

  return util.findScaleToFit(cropSize, {
    width: safeArea.width,
    height: safeArea.height,
  });
};

const adjustmentsForBrokenXMargin = (
  fabricImage: EditableImage,
  newSize: any,
  maxWidth: number
) => {
  // how much i m outside of the safe area?
  const diffX = newSize.x - maxWidth;
  // then i m going to calculate the new width
  const newImageWidth = fabricImage.width - diffX;
  // how much is the width change in percentage? because we will need to change the height
  // about the same percentage of pixels
  const percChange = newImageWidth / fabricImage.width;

  fabricImage.width -= diffX;
  fabricImage.cropX += diffX / 2;
  const newImageHeight = fabricImage.height * percChange;
  const diffY = fabricImage.height - newImageHeight;

  fabricImage.height -= diffY;
  fabricImage.cropY += diffY / 2;
};

const adjustmentsForBrokenYMargin = (
  fabricImage: EditableImage,
  newSize: any,
  maxHeight: number
) => {
  // how much i m outside of the safe area?
  const diffY = newSize.y - maxHeight;
  // then i m going to calculate the new width
  const newImageHeight = fabricImage.height - diffY;
  // how much is the width change in percentage? because we will need to change the height
  // about the same percentage of pixels
  const percChange = newImageHeight / fabricImage.height;

  fabricImage.height -= diffY;
  fabricImage.cropY += diffY / 2;
  const newImageWidth = fabricImage.width * percChange;
  const diffX = fabricImage.width - newImageWidth;

  fabricImage.width -= diffX;
  fabricImage.cropX += diffX / 2;
};

export function fitAndFinish(fabricImage: EditableImage) {
  const originalSize = fabricImage.getOriginalSize();

  // this 6 following if condition will fix when the image leaves a part of the crop box empty
  // crop can't be negative, will draw bad.
  if (fabricImage.cropX < 0) {
    fabricImage.cropX = 0;
  }

  if (fabricImage.cropY < 0) {
    fabricImage.cropY = 0;
  }

  // crop rect can't be bigger than the image itself
  if (fabricImage.width > originalSize.width) {
    fabricImage.width = originalSize.width;
    // ????
    fabricImage.setFixedAspectData(-1);
  }

  if (fabricImage.height > originalSize.height) {
    fabricImage.height = originalSize.height;
  }

  // the sum of crop and size per axis should always be at max the original size
  if (fabricImage.cropX + fabricImage.width > originalSize.width) {
    fabricImage.cropX = originalSize.width - fabricImage.width;
  }

  if (fabricImage.cropY + fabricImage.height > originalSize.height) {
    fabricImage.cropY = originalSize.height - fabricImage.height;
  }
}
/**
 *
 * @param fabricImage
 * @param zoomFactor how much we would like to zoom in percentage ( 1.1 = 10% )
 * @param safeArea
 * @returns finalZoomFactor how much we can zoom
 */
export function refineScaleFactor(
  fabricImage: EditableImage,
  zoomFactor: number,
  safeArea: CanvasWithSafeArea["safeArea"]
): number {
  const minScale = getMinScale(safeArea, fabricImage);
  const maxScale = getMaxScale({ safeArea } as CanvasWithSafeArea);

  const currentZoom = fabricImage.canvas.getZoom();
  const totalScale = zoomFactor * currentZoom;

  // todo: evaluate if scaling direction is convenient to consider
  // are we srinking too much? return what is missing to minScale
  if (totalScale <= minScale) {
    return minScale / currentZoom;
  }

  // are we growing too much? return what is missing to maxScale
  if (totalScale >= maxScale) {
    return maxScale / currentZoom;
  }

  return zoomFactor;
}

// eslint-disable-next-line complexity

const SMOOTHING_FACTOR = 4;
const getSmoothingScale = (maxScale: number) =>
  maxScale ** (SMOOTHING_FACTOR - 1);

// These transform the values to/from the slider from linear to exponential scaling
const exponentialize = (num: number, maxScale: number) =>
  num ** SMOOTHING_FACTOR / getSmoothingScale(maxScale);
const deExponentialize = (num: number, maxScale: number) =>
  (num * getSmoothingScale(maxScale)) ** (1 / SMOOTHING_FACTOR);

// These transform a number from 0-100 to the proper scaling # for the image (and back)
const totalScaleToPercent = (
  totalImageScale: number,
  minScale: number,
  maxScale: number
) =>
  (deExponentialize(Math.max(totalImageScale - minScale, 0), maxScale) /
    (maxScale + minScale)) *
  100;

const percentToTotalScale = (
  percent: number,
  minScale: number,
  maxScale: number
) =>
  exponentialize((percent / 100) * (maxScale - minScale), maxScale) + minScale;

export const rescaleCanvasImage = (
  fabricCanvas: CanvasWithSafeArea,
  zoomFactor: number
) => {
  const fabricImage = fabricCanvas.getMainImage();

  if (!fabricImage) {
    return;
  }

  const { safeArea } = fabricCanvas;
  // before actually zooming calculate the new desired scale
  const finalScaleFactor = refineScaleFactor(fabricImage, zoomFactor, safeArea);
  const totalImageScale = fabricCanvas.getZoom() * finalScaleFactor;

  // we calculate how big would be the safe area if we were to zoom in/out with totalImageScale;
  const maxWidth = safeArea.width / totalImageScale;
  const maxHeight = safeArea.height / totalImageScale;

  // we actually apply it to the image, and from now on we calculate if we need to fix cropbox to compensate.
  const newSize = {
    x: fabricImage.width,
    y: fabricImage.height,
  };
  // did we get out of the safe area
  const brokenMargin = newSize.x > maxWidth || newSize.y > maxHeight;
  const areWeTooSmall = newSize.x < maxWidth && newSize.y < maxHeight;
  const brokenBothMargin = newSize.x > maxWidth && newSize.y > maxHeight;
  const imageAspect = fabricImage.width / fabricImage.height;
  const safeAreaAspect = safeArea.width / safeArea.height;

  // in case we went outside margins we need to counter the changes
  if (brokenBothMargin) {
    if (imageAspect <= safeAreaAspect) {
      adjustmentsForBrokenYMargin(fabricImage, newSize, maxHeight);
    } else {
      adjustmentsForBrokenXMargin(fabricImage, newSize, maxWidth);
    }
  } else if (brokenMargin) {
    if (newSize.x > maxWidth) {
      adjustmentsForBrokenXMargin(fabricImage, newSize, maxWidth);
    } else if (newSize.y > maxHeight) {
      adjustmentsForBrokenYMargin(fabricImage, newSize, maxHeight);
    }
  } else if (areWeTooSmall) {
    // how can we find out a new size that will fill the safe area
    // without breaking the aspect ratio that the user chose.
    const percentageDifference = util.findScaleToFit(
      {
        width: newSize.x,
        height: newSize.y,
      },
      {
        width: safeArea.width / totalImageScale,
        height: safeArea.height / totalImageScale,
      }
    );
    // since i used scaleToFit i know that this percentage grow is exact for my space
    // and i can apply it to imageWidth and imageHeight.
    const newImageWidth = fabricImage.width * percentageDifference;
    const newImageHeight = fabricImage.height * percentageDifference;
    // once i know the new size i need to fill the space i can calculate the differences
    const diffX = newImageWidth - fabricImage.width;
    const diffY = newImageHeight - fabricImage.height;

    // then apply the differnces to the image properties
    fabricImage.width += diffX;
    fabricImage.cropX -= diffX / 2;

    fabricImage.height += diffY;
    fabricImage.cropY -= diffY / 2;
  }

  // but also let fix any displacement of cropX and cropY that may have happened due to
  // wrong assumptions on the crop rect state ( a.k.a. the user did something wrong, is never us )
  fitAndFinish(fabricImage);

  // now let's recenter the crop rectangle in the center of the safe area.
  handleResizeImage(fabricCanvas);
  fabricCanvas.requestRenderAll();
};

export function zoomHelper(
  fabricCanvas: CanvasWithSafeArea,
  { e }: { e: any }
): number {
  e.preventDefault();
  e.stopImmediatePropagation();

  const zoomFactor = e.deltaY > 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;

  const fabricImage = fabricCanvas.getMainImage();

  if (fabricImage && fabricImage.evented) {
    rescaleCanvasImage(fabricCanvas, zoomFactor);

    return totalScaleToPercent(
      fabricCanvas.getZoom(),
      getMinScale(fabricCanvas.safeArea, fabricImage),
      getMaxScale(fabricCanvas)
    );
  }

  return 0;
}

export const autoFill = (
  fabricCanvas: CanvasWithSafeArea,
  objectToAnimate?: Image,
  duration = 200
) => {
  const fabricImage = (objectToAnimate ||
    fabricCanvas.getMainImage()) as EditableImage;

  const newScale = util.findScaleToFit(fabricImage, fabricCanvas.safeArea);
  const currentViewport = fabricCanvas.viewportTransform;
  const safeAreaCenter = fabricCanvas.getCenterOfSafeArea();

  // in order to discove the new viewport we need to mutate the canvas, then restore it
  fabricCanvas.setZoom(newScale);
  fabricCanvas.absolutePan({
    x: -safeAreaCenter.x,
    y: -safeAreaCenter.y,
  } as Point);
  const destinationViewport = fabricCanvas.viewportTransform;

  fabricCanvas.viewportTransform = currentViewport;

  return new Promise<number>((resolve) => {
    // using the canvas animation callbacks to do the rende job
    fabricImage.animate(
      {
        left: 0,
        top: 0,
      },
      {
        duration,
      }
    );

    util.animate({
      startValue: currentViewport,
      endValue: destinationViewport,
      onChange: (viewport) => {
        fabricCanvas.setViewportTransform(viewport as TMat2D);
        fabricCanvas.requestRenderAll();
      },
      duration,
      onComplete: () => {
        fabricImage.setCoords();
        fabricImage.setupDragMatrix();
        resolve(
          totalScaleToPercent(
            fabricCanvas.getZoom(),
            getMinScale(fabricCanvas.safeArea, fabricImage),
            getMaxScale(fabricCanvas)
          )
        );
      },
    });
  });
};

export const zoomFromPct = (
  fabricCanvas: CanvasWithSafeArea,
  pct: number // value from 0 (least scaled) to 100 (max scaled)
): void => {
  const fabricImage = fabricCanvas.getMainImage();

  if (fabricImage) {
    const totalImageScale = percentToTotalScale(
      pct,
      getMinScale(fabricCanvas.safeArea, fabricImage),
      getMaxScale(fabricCanvas)
    );

    rescaleCanvasImage(fabricCanvas, totalImageScale / fabricCanvas.getZoom());
  }
};

export const getZoomValue = (fabricCanvas: CanvasWithSafeArea) => {
  const fabricImage = fabricCanvas?.getActiveObject() as EditableImage;

  if (fabricImage) {
    return totalScaleToPercent(
      fabricCanvas.getZoom(),
      getMinScale(fabricCanvas.safeArea, fabricImage),
      getMaxScale(fabricCanvas)
    );
  }

  return 1;
};

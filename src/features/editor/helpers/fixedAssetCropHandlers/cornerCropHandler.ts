import type { EditableImage } from "../../fabric/EditableImage";
import type {
  TOriginX,
  TOriginY,
  Transform,
  TransformActionHandler,
} from "fabric";
import { Point, util } from "fabric";

import { cropMinSize } from "../../constants/cropAspectRatioBar";
import { CanvasWithSafeArea } from "../CanvasWithSafeArea";
import { MIN_PIXEL_OFFSET } from "./shared";

/** ********************************
 Corners are designated by the following, where 0,0 is the top left
(0,0)-(1,0)
  |     |
(0,1)-(1,1)
********************************** */
export type CornerVal = 0 | 1;

export const getCropBoxFixedCornerCanvas = (
  target: EditableImage,
  xFixedCorner: CornerVal,
  yFixedCorner: CornerVal
) => {
  const { cropX, cropY, width, height } = target;

  return target.getPixelCoordInCanvas(
    cropX + width * xFixedCorner,
    cropY + height * yFixedCorner
  );
};

const getCornerLabels = (
  xCorner: CornerVal,
  yCorner: CornerVal
): {
  xFixedCornerLabel: TOriginX;
  yFixedCornerLabel: TOriginY;
} => {
  const xFixedCornerLabel = xCorner === 0 ? "left" : "right";
  const yFixedCornerLabel = yCorner === 0 ? "top" : "bottom";

  return { xFixedCornerLabel, yFixedCornerLabel };
};

export const getCornerSafeAreaAspectRulesBoundPnt = (
  target: EditableImage,
  x: number,
  y: number,
  xFixedCorner: CornerVal,
  yFixedCorner: CornerVal
): Point => {
  const canvasImageLimits = target.getUnionOfImageAndSafeAreaLimits();
  const fixedCornerCanvas = getCropBoxFixedCornerCanvas(
    target,
    xFixedCorner,
    yFixedCorner
  );
  let boundX = x;
  let boundY = y;

  // Left side is fixed
  if (xFixedCorner === 0) {
    // Left side is fixed must be between fixed side, canvas space, & image limits
    boundX = Math.max(
      boundX,
      fixedCornerCanvas.x + MIN_PIXEL_OFFSET,
      canvasImageLimits.left
    );
    boundX = Math.min(boundX, canvasImageLimits.right);
  } else {
    // Right side is fixed must be between fixed side, canvas space, & image limits
    boundX = Math.min(
      boundX,
      canvasImageLimits.right,
      fixedCornerCanvas.x - MIN_PIXEL_OFFSET
    );
    boundX = Math.max(boundX, canvasImageLimits.left);
  }

  // top is fixed
  if (yFixedCorner === 0) {
    boundY = Math.max(
      boundY,
      fixedCornerCanvas.y + MIN_PIXEL_OFFSET,
      canvasImageLimits.top
    );
    boundY = Math.min(boundY, canvasImageLimits.bot);
  } else {
    // Bottom is fixed
    boundY = Math.min(
      boundY,
      fixedCornerCanvas.y - MIN_PIXEL_OFFSET,
      canvasImageLimits.bot
    );
    boundY = Math.max(boundY, canvasImageLimits.top);
  }

  return new Point(boundX, boundY);
};

export const fixedAspectRatioCornerCrop = (
  transform: Transform,
  x: number,
  y: number,
  xFixedCorner: CornerVal,
  yFixedCorner: CornerVal
) => {
  const t = transform;
  const target = t.target as EditableImage;
  const canvas = t.target.canvas as CanvasWithSafeArea;
  const { width, height, left, top, fixedAspectRatio } = target;

  const viewportAdjustedPoint = new Point(x, y).transform(
    canvas.viewportTransform
  );

  // Get relative canvas pixels comparing opposite point to corner selection
  const safeAreaAspectRulesBoundXY = getCornerSafeAreaAspectRulesBoundPnt(
    target,
    viewportAdjustedPoint.x,
    viewportAdjustedPoint.y,
    xFixedCorner,
    yFixedCorner
  );

  const { xFixedCornerLabel, yFixedCornerLabel } = getCornerLabels(
    xFixedCorner,
    yFixedCorner
  );

  const constraint = target.translateToOriginPoint(
    new Point(left, top),
    xFixedCornerLabel,
    yFixedCornerLabel
  );

  const cornerDist = safeAreaAspectRulesBoundXY
    .transform(util.invertTransform(canvas.viewportTransform))
    .subtract(constraint);

  const minCropHeight = cropMinSize / fixedAspectRatio;
  const newWidth = Math.abs(cornerDist.x);
  const newHeight = Math.abs(cornerDist.y);
  let changeX = newWidth - width;
  let changeY = newHeight - height;

  const xChangeRatio = newWidth / width;
  const yChangeRatio = newHeight / height;

  if (Math.abs(xChangeRatio) > Math.abs(yChangeRatio)) {
    changeX = width * yChangeRatio - width;
  } else {
    changeY = height * xChangeRatio - height;
  }

  // we'll exit if the dimensions we are trying to achieve during the cropping
  // are smaller than (cropMinSize, cropMinSize * fixedAspectRatio)
  if (width + changeX < cropMinSize && height + changeY < minCropHeight)
    return true;

  // Setting width & heights......
  target.width += changeX;
  target.height += changeY;
  target.cropX -= changeX * xFixedCorner;
  target.cropY -= changeY * yFixedCorner;

  // Move crop box so fixed corner stays where it is add, corner based correction
  target.setPositionByOrigin(constraint, xFixedCornerLabel, yFixedCornerLabel);

  return true;
};

export const getCornerCropHandler = (
  xCorner: CornerVal,
  yCorner: CornerVal
): TransformActionHandler => {
  const xFixedCorner = (1 - xCorner) as CornerVal;
  const yFixedCorner = (1 - yCorner) as CornerVal;
  const cornerCropHander = (
    _eventData: any,
    transform: Transform,
    x: number,
    y: number
  ) => fixedAspectRatioCornerCrop(transform, x, y, xFixedCorner, yFixedCorner);

  return cornerCropHander;
};

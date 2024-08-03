import type {
  EditableImage,
  BoundingBoxLimits,
} from "../../fabric/EditableImage";
import type {
  TOriginX,
  TOriginY,
  Transform,
  TransformActionHandler,
} from "fabric";
import { Point, util } from "fabric";

import { cropMinSize } from "../../constants/cropAspectRatioBar";
import { MIN_PIXEL_OFFSET } from "./shared";
/** ********************************* 
 Sides are designated by the following
 - where crop center is (0,0) can be thought of the center, 
 - the xy pairs are the unit vectors in canvas space to get to cropping side
  ------(0,-1)-----
  |               |
(-1,0)  (0,0)    (1,0)
  |               |
  ------(0,1)------
*********************************** */
export type SideUnitVectorVal = -1 | 0 | 1;

// Gets the indicated crop box side point in canvas coordinates
export const getCropBoxSideMidpoint = (
  target: EditableImage,
  x: SideUnitVectorVal,
  y: SideUnitVectorVal
) => {
  const { cropX, cropY, width, height } = target;

  return target.getPixelCoordInCanvas(
    cropX + ((1 + x) / 2) * width,
    cropY + ((1 + y) / 2) * height
  );
};

// Points are in canvas coordinates
export type CropBoxSidePoints = {
  top: Point;
  bot: Point;
  right: Point;
  left: Point;
};

// Gets all the crop box side point in canvas coordinates
const getCropBoxMidPoints = (target: EditableImage): CropBoxSidePoints => ({
  top: getCropBoxSideMidpoint(target, 0, -1),
  bot: getCropBoxSideMidpoint(target, 0, 1),
  left: getCropBoxSideMidpoint(target, -1, 0),
  right: getCropBoxSideMidpoint(target, 1, 0),
});

// Returns width and heigh changes required for side scaling crop point
// + for expanding, - for contracting boxes
export const getSideChangeDimensions = (
  transform: Transform,
  x: number,
  y: number,
  xSide: SideUnitVectorVal,
  ySide: SideUnitVectorVal,
  implicitGrowthDimension: "X" | "Y"
) => {
  const t = transform;
  const target = t.target as EditableImage;
  const { canvas } = target;
  const { height, width, fixedAspectRatio } = target;

  const canvasPoint = new Point(x, y).transform(
    util.invertTransform(canvas.viewportTransform)
  );
  const centerPoint = target.getCenterPoint();

  const newSidePoint = canvasPoint.subtract(centerPoint);
  // New height and width, are distance from old crop box center to clickpoint
  // plus 1/2 dimension to old fixed side
  const xPixelDistCenterToSelect = newSidePoint.x * xSide;
  const yPixelDistCenterToSelect = newSidePoint.y * ySide;

  const newWidth = xPixelDistCenterToSelect + width / 2;
  const newHeight = yPixelDistCenterToSelect + height / 2;

  // Adjust by xSide, ySide to zero out non active axis
  let changeX = (newWidth - width) * Math.abs(xSide);
  let changeY = (newHeight - height) * Math.abs(ySide);

  if (implicitGrowthDimension === "X") {
    changeX = changeY * fixedAspectRatio;
  } else {
    changeY = changeX / fixedAspectRatio;
  }

  return { changeX, changeY };
};

// Positive distance indicates there is room available to grow...
// Negative numbers shouldn't occur, as it indicates box was allowed to go beyond limits :(
export const getDistancesToLimits = (
  limits: BoundingBoxLimits,
  sidePoints: CropBoxSidePoints
) => ({
  top: sidePoints.top.y - limits.top,
  bot: limits.bot - sidePoints.bot.y,
  left: sidePoints.left.x - limits.left,
  right: limits.right - sidePoints.right.x,
});

// Gets the safe area, canvas, aspect rules bound canvas coordinate
// Sets unused dimension to zero, as it's usage is a no op, improves clarity while debugging
// eslint-disable-next-line complexity
export const getSideSafeAreaAspectRulesBoundPnt = (
  transform: Transform,
  x: number,
  y: number,
  xSide: SideUnitVectorVal,
  ySide: SideUnitVectorVal,
  implicitGrowthDimension: "X" | "Y"
): Point => {
  const t = transform;
  const target = t.target as EditableImage;
  const { fixedAspectRatio } = target;
  const canvasImageLimits = target.getUnionOfImageAndSafeAreaLimits();
  const sidePoints = getCropBoxMidPoints(target);
  const distancesToLimits = getDistancesToLimits(canvasImageLimits, sidePoints);
  const { changeX, changeY } = getSideChangeDimensions(
    t,
    x,
    y,
    xSide,
    ySide,
    implicitGrowthDimension
  );

  if (implicitGrowthDimension === "X") {
    const minImplicitDistanceToBounds = Math.min(
      distancesToLimits.left,
      distancesToLimits.right
    );

    const maxImplicitBoundHeightChange =
      minImplicitDistanceToBounds / fixedAspectRatio;

    // Cropping from top, bot is fixed
    if (ySide === -1) {
      // Height & Width changes are within bounds return point
      // changeX / 2 because implicit axis increases on both sides
      if (
        changeY < distancesToLimits.top &&
        changeX / 2 < minImplicitDistanceToBounds
      ) {
        const fixedSideBoundY = Math.min(
          y,
          sidePoints.bot.y - MIN_PIXEL_OFFSET
        );

        return new Point(0, fixedSideBoundY);
      }

      // Bound by implicit growth dimension
      const yImplicitLimit = sidePoints.top.y - maxImplicitBoundHeightChange;

      return new Point(0, Math.max(canvasImageLimits.top, yImplicitLimit));
    }

    // Cropping from bot, top is fixed
    if (
      changeY < distancesToLimits.bot &&
      changeX / 2 < minImplicitDistanceToBounds
    ) {
      const fixedSideBoundY = Math.max(y, sidePoints.top.y + MIN_PIXEL_OFFSET);

      return new Point(0, fixedSideBoundY);
    }

    const yImplicitLimit = sidePoints.bot.y + maxImplicitBoundHeightChange;

    return new Point(0, Math.min(canvasImageLimits.bot, yImplicitLimit));
  }

  // Implicit Growth Dimension is 'Y'
  const minImplicitDistanceToBounds = Math.min(
    distancesToLimits.top,
    distancesToLimits.bot
  );
  const maxImplicitBoundWidthChange =
    minImplicitDistanceToBounds * fixedAspectRatio;

  // Cropping from left, right is fixed
  if (xSide === -1) {
    if (
      changeX < distancesToLimits.left &&
      changeY / 2 < minImplicitDistanceToBounds
    ) {
      const fixedSideBoundX = Math.min(
        x,
        sidePoints.right.x - MIN_PIXEL_OFFSET
      );

      return new Point(fixedSideBoundX, 0);
    }

    const xImplicitLimit = sidePoints.left.x - maxImplicitBoundWidthChange;

    return new Point(Math.max(canvasImageLimits.left, xImplicitLimit), 0);
  }

  // Cropping from right, left is fixed
  if (
    changeX < distancesToLimits.right &&
    changeY / 2 < minImplicitDistanceToBounds
  ) {
    const fixedSideBoundX = Math.max(x, sidePoints.left.x + MIN_PIXEL_OFFSET);

    return new Point(fixedSideBoundX, 0);
  }

  const xImplicitLimit = sidePoints.right.x + maxImplicitBoundWidthChange;

  return new Point(Math.min(canvasImageLimits.right, xImplicitLimit), 0);
};

const getFixedLabels = (
  xSide: SideUnitVectorVal,
  ySide: SideUnitVectorVal
): { xFixedLabel: TOriginX | undefined; yFixedLabel: TOriginY | undefined } => {
  const xFixedSide = -1 * xSide;
  const yFixedSide = -1 * ySide;
  const xFixedLabel = {
    "-1": "left" as const,
    "0": undefined,
    "1": "right" as const,
  }[xFixedSide];
  const yFixedLabel = {
    "-1": "top" as const,
    "0": undefined,
    "1": "bottom" as const,
  }[yFixedSide];

  return { xFixedLabel, yFixedLabel };
};

export const applyFixedAspectRatioSideCropToTarget = (
  transform: Transform,
  x: number,
  y: number,
  xSide: SideUnitVectorVal,
  ySide: SideUnitVectorVal,
  implicitGrowthDimension: "X" | "Y"
) => {
  const t = transform;
  const { originX, originY } = t;
  const target = t.target as EditableImage;
  const { height, width, fixedAspectRatio } = target;
  const minCropHeight = cropMinSize / fixedAspectRatio;

  const adjustedPoint = new Point(x, y).transform(
    target.canvas.viewportTransform
  );

  const { xFixedLabel, yFixedLabel } = getFixedLabels(xSide, ySide);
  const xAnchorLabel = xFixedLabel || originX;
  const yAnchorLabel = yFixedLabel || originY;
  const centerPoint = target.getCenterPoint();
  const fixedSidePoint = target.translateToOriginPoint(
    centerPoint,
    xAnchorLabel,
    yAnchorLabel
  );
  const safeAreaBoundPoint = getSideSafeAreaAspectRulesBoundPnt(
    t,
    adjustedPoint.x,
    adjustedPoint.y,
    xSide,
    ySide,
    implicitGrowthDimension
  );

  // Adjust by xSide, ySide to zero out non active axis
  const { changeX, changeY } = getSideChangeDimensions(
    t,
    safeAreaBoundPoint.x,
    safeAreaBoundPoint.y,
    xSide,
    ySide,
    implicitGrowthDimension
  );

  // we'll exit if the dimensions we are trying to achieve during the cropping
  // are smaller than (cropMinSize, cropMinSize * fixedAspectRatio)
  if (width + changeX < cropMinSize && height + changeY < minCropHeight)
    return true;

  t.target.width = width + changeX;
  t.target.height = height + changeY;

  // Moving crop box and adjusting for translation
  t.target.setPositionByOrigin(fixedSidePoint, xAnchorLabel, yAnchorLabel);

  // -1 directions require change
  // 0 direction require no change
  // 1 direction requires no change
  // @ts-ignore
  if (xSide === -1) t.target.cropX -= changeX;
  // @ts-ignore
  else if (ySide === -1) t.target.cropY -= changeY;

  // Adjust crop box for non-selected implicit side grow
  if (implicitGrowthDimension === "X") {
    // @ts-ignore
    t.target.cropX -= changeX / 2;
  } else {
    // @ts-ignore
    t.target.cropY -= changeY / 2;
  }

  return true;
};

export const getSideCropHandler = (
  xSide: SideUnitVectorVal,
  ySide: SideUnitVectorVal
) => {
  if (Math.abs(xSide + ySide) !== 1) {
    throw new Error("Unsupported side entered");
  }

  // Other dimension must grow to keep aspect ratio fixed
  const implicitGrowthDimension = xSide === 0 ? "X" : "Y";

  const sideCropHandler: TransformActionHandler = (
    _eventData: any,
    transform: Transform,
    x: number,
    y: number
  ) =>
    applyFixedAspectRatioSideCropToTarget(
      transform,
      x,
      y,
      xSide,
      ySide,
      implicitGrowthDimension
    );

  return sideCropHandler;
};

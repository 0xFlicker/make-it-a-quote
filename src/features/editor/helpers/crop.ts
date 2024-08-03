// @ts-nocheck
import { type TransformActionHandler, Control, Point, util } from "fabric";

import { cropMinSize } from "../constants/cropAspectRatioBar";

const { degreesToRadians } = util;

export const CORNER_OFFSET_X = 4;
export const CORNER_OFFSET_Y = 4;
export const ACTION_NAME = "crop";
export function renderCropCorner(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _: any,
  fabricObject: any
) {
  const cSize = 14;

  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(degreesToRadians(this.angle + fabricObject.angle));
  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.lineCap = "square";
  ctx.strokeStyle = "#3789D8";
  ctx.moveTo(0, cSize);
  ctx.lineTo(0, 0);
  ctx.lineTo(cSize, 0);
  ctx.stroke();
  ctx.restore();
}

export function renderCropMiddle(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _: any,
  fabricObject: any
) {
  const cSize = 14;
  const cSizeBy2 = cSize / 2;

  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(degreesToRadians(this.angle + fabricObject.angle));
  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.lineCap = "square";
  ctx.strokeStyle = "#3789D8";
  ctx.moveTo(-cSizeBy2, 0);
  ctx.lineTo(cSizeBy2, 0);
  ctx.stroke();
  ctx.restore();
}

export const cropFromLeft: TransformActionHandler = (_, transform, x, y) => {
  const t = transform;
  const { safeArea } = t.target.canvas;
  let newX = x;
  const pointInCanvasCoords = new Point(x, y).transform(
    t.target.canvas.viewportTransform
  );

  // this ensures that the crop handle does not extend beyond the safe area on the left side.
  if (pointInCanvasCoords.x < safeArea.x) {
    newX = new Point(safeArea.x, 0).transform(
      util.invertTransform(t.target.canvas.viewportTransform)
    ).x;
  }

  const anchorPoint = "right";
  const { width } = t.target;
  const left = -(width / 2);
  const centerPoint = t.target.getCenterPoint();
  const newLeft = t.target.toLocalPoint(
    new Point(newX, y),
    t.originX,
    t.originY
  );
  const constraint = t.target.translateToOriginPoint(
    centerPoint,
    anchorPoint,
    t.originY
  );
  const cropMinX = cropMinSize;

  let changeX = newLeft.x / t.target.scaleX - left;
  let newWidth = width - changeX;

  if (t.target.cropX + changeX < 0) {
    changeX = -t.target.cropX;
    newWidth = width + t.target.cropX;
  }

  if (newWidth <= cropMinX) {
    // changeX and newWidth have been determined above.
    // since we are breaking a limit, we enforce newWidth to the limit itself
    // but we need to compensate changeX so that what we add to width and what we add to cropX
    // are still in sync.
    changeX += newWidth - cropMinX;
    newWidth = cropMinX;
  }

  t.target.width = newWidth;
  t.target.setPositionByOrigin(constraint, anchorPoint, t.originY);
  t.target.cropX += changeX; // this can only be between 0 and naturalWidth;

  return true;
};

export const cropFromRight: TransformActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  const t = transform;
  const { safeArea } = t.target.canvas;
  let newX = x;

  const pointInCanvasCoords = new Point(x, y).transform(
    t.target.canvas.viewportTransform
  );

  // this ensures that the crop handle does not extend beyond the safe area on the right side.
  if (pointInCanvasCoords.x > safeArea.x + safeArea.width) {
    newX = new Point(safeArea.x + safeArea.width, 0).transform(
      util.invertTransform(t.target.canvas.viewportTransform)
    ).x;
  }

  const anchorPoint = "left";
  const { width } = t.target;
  const naturalWidth = t.target.getOriginalSize().width;
  const right = width / 2;
  const centerPoint = t.target.getCenterPoint();
  const newRight = t.target.toLocalPoint(
    new Point(newX, y),
    t.originX,
    t.originY
  );
  const constraint = t.target.translateToOriginPoint(
    centerPoint,
    anchorPoint,
    t.originY
  );
  const cropMinX = cropMinSize;

  let newWidth = width - (right - newRight.x / t.target.scaleX);

  if (newWidth + t.target.cropX > naturalWidth) {
    newWidth = naturalWidth - t.target.cropX;
  }

  if (newWidth < cropMinX) {
    // newWidth have been determined above.
    // since we are breaking a limit, we enforce newWidth to the limit itself
    newWidth = cropMinX;
  }

  t.target.width = newWidth;
  t.target.setPositionByOrigin(constraint, anchorPoint, t.originY);

  return true;
};

export const cropFromTop: TransformActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  const t = transform;
  const { safeArea } = t.target.canvas;
  let newY = y;

  const pointInCanvasCoords = new Point(x, y).transform(
    t.target.canvas.viewportTransform
  );

  // this ensures that the crop handle does not extend beyond the safe area on the top side.
  if (pointInCanvasCoords.y < safeArea.y) {
    newY = new Point(0, safeArea.y).transform(
      util.invertTransform(t.target.canvas.viewportTransform)
    ).y;
  }

  const anchorPoint = "bottom";
  const { height } = t.target;
  const top = -(height / 2);
  const centerPoint = t.target.getCenterPoint();
  const newTop = t.target.toLocalPoint(
    new Point(x, newY),
    t.originX,
    t.originY
  );
  const constraint = t.target.translateToOriginPoint(
    centerPoint,
    t.originX,
    anchorPoint
  );
  const cropMinY = cropMinSize;

  let changeY = newTop.y / t.target.scaleY - top;
  let newHeight = height - changeY;

  if (t.target.cropY + changeY < 0) {
    changeY = -t.target.cropY;
    newHeight = height + t.target.cropY;
  }

  if (newHeight <= cropMinY) {
    // changeY and newHeight have been determined above.
    // since we are breaking a limit, we enforce newHeight to the limit itself
    // but we need to compensate changeY so that what we add to height and what we add to cropY
    // are still in sync.
    changeY += newHeight - cropMinY;
    newHeight = cropMinY;
  }

  t.target.height = newHeight;
  t.target.setPositionByOrigin(constraint, t.originX, anchorPoint);
  t.target.cropY += changeY;

  return true;
};

export const cropFromBottom: TransformActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  const t = transform;
  const { safeArea } = t.target.canvas;
  let newY = y;

  const pointInCanvasCoords = new Point(x, y).transform(
    t.target.canvas.viewportTransform
  );

  // this ensures that the crop handle does not extend beyond the safe area on the bottom side.
  if (pointInCanvasCoords.y > safeArea.y + safeArea.height) {
    newY = new Point(0, safeArea.y + safeArea.height).transform(
      util.invertTransform(t.target.canvas.viewportTransform)
    ).y;
  }

  const anchorPoint = "top";
  const { height } = t.target;
  const naturalHeight = t.target.getOriginalSize().height;
  const bottom = height / 2;
  const centerPoint = t.target.getCenterPoint();
  const newBottom = t.target.toLocalPoint(
    new Point(x, newY),
    t.originX,
    t.originY
  );
  const constraint = t.target.translateToOriginPoint(
    centerPoint,
    t.originX,
    anchorPoint
  );
  const cropMinY = cropMinSize;

  let newHeight = height - (bottom - newBottom.y / t.target.scaleY);

  if (newHeight + t.target.cropY > naturalHeight) {
    newHeight = naturalHeight - t.target.cropY;
  }

  if (newHeight < cropMinY) {
    // newHeight have been determined above.
    // since we are breaking a limit, we enforce newHeight to the limit itself
    newHeight = cropMinY;
  }

  t.target.height = newHeight;
  t.target.setPositionByOrigin(constraint, t.originX, anchorPoint);

  return true;
};

export function cropFromTopLeft(
  eventData: any,
  transform: any,
  x: number,
  y: number
) {
  const left = cropFromLeft(eventData, transform, x, y);
  const top = cropFromTop(eventData, transform, x, y);

  return left || top;
}

export function cropFromBottomRight(
  eventData: any,
  transform: any,
  x: number,
  y: number
) {
  const right = cropFromRight(eventData, transform, x, y);
  const bottom = cropFromBottom(eventData, transform, x, y);

  return right || bottom;
}

export function cropFromBottomLeft(
  eventData: any,
  transform: any,
  x: number,
  y: number
) {
  const left = cropFromLeft(eventData, transform, x, y);
  const bottom = cropFromBottom(eventData, transform, x, y);

  return left || bottom;
}

export function cropFromTopRight(
  eventData: any,
  transform: any,
  x: number,
  y: number
) {
  const right = cropFromRight(eventData, transform, x, y);
  const top = cropFromTop(eventData, transform, x, y);

  return right || top;
}

export type CroppingControlSetProps = {
  cropLeft: Control;
  cropRight: Control;
  cropTop: Control;
  cropBottom: Control;
  cropCornerTL: Control;
  cropCornerBL: Control;
  cropCornerBR: Control;
  cropCornerTR: Control;
};
export const croppingControlSet: CroppingControlSetProps = {
  cropLeft: new Control({
    x: -0.5,
    y: 0,
    offsetX: -CORNER_OFFSET_X,
    withConnection: true,
    name: "cropLeft",
    cursorStyle: "ew-resize",
    actionHandler: cropFromLeft,
    actionName: ACTION_NAME,
    render: renderCropMiddle,
    angle: 90,
  }),
  cropRight: new Control({
    x: 0.5,
    y: 0,
    withConnection: true,
    offsetX: CORNER_OFFSET_Y,
    name: "cropRight",
    cursorStyle: "ew-resize	",
    render: renderCropMiddle,
    actionName: ACTION_NAME,
    actionHandler: cropFromRight,
    angle: 90,
  }),
  cropTop: new Control({
    x: 0,
    y: -0.5,
    offsetY: -CORNER_OFFSET_Y,
    withConnection: true,
    name: "cropTop",
    cursorStyle: "ns-resize",
    render: renderCropMiddle,
    actionName: ACTION_NAME,
    actionHandler: cropFromTop,
  }),
  cropBottom: new Control({
    x: 0,
    y: 0.5,
    withConnection: true,
    offsetY: CORNER_OFFSET_Y,
    name: "cropBottom",
    cursorStyle: "ns-resize",
    render: renderCropMiddle,
    actionName: ACTION_NAME,
    actionHandler: cropFromBottom,
  }),
  cropCornerTL: new Control({
    x: -0.5,
    y: -0.5,
    offsetX: -CORNER_OFFSET_X,
    offsetY: -CORNER_OFFSET_Y,
    withConnection: true,
    name: "cropCornerTL",
    cursorStyle: "nwse-resize",
    render: renderCropCorner,
    actionName: ACTION_NAME,
    actionHandler: cropFromTopLeft,
  }),
  cropCornerBL: new Control({
    x: -0.5,
    y: 0.5,
    offsetX: -CORNER_OFFSET_X,
    offsetY: CORNER_OFFSET_Y,
    withConnection: false,
    name: "cropCornerBL",
    cursorStyle: "nesw-resize",
    render: renderCropCorner,
    angle: 270,
    actionName: ACTION_NAME,
    actionHandler: cropFromBottomLeft,
  }),
  cropCornerBR: new Control({
    x: 0.5,
    y: 0.5,
    offsetX: CORNER_OFFSET_X,
    offsetY: CORNER_OFFSET_Y,
    withConnection: false,
    name: "cropCornerBR",
    cursorStyle: "nwse-resize",
    render: renderCropCorner,
    angle: 180,
    actionName: ACTION_NAME,
    actionHandler: cropFromBottomRight,
  }),
  cropCornerTR: new Control({
    x: 0.5,
    y: -0.5,
    offsetX: CORNER_OFFSET_X,
    offsetY: -CORNER_OFFSET_Y,
    withConnection: false,
    name: "cropCornerTR",
    cursorStyle: "nesw-resize",
    render: renderCropCorner,
    angle: 90,
    actionName: ACTION_NAME,
    actionHandler: cropFromTopRight,
  }),
};

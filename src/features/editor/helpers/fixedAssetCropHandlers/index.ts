import { Control } from "fabric";

import type { CroppingControlSetProps } from "../crop";
import {
  ACTION_NAME,
  CORNER_OFFSET_X,
  CORNER_OFFSET_Y,
  renderCropCorner,
  renderCropMiddle,
} from "../crop";
import { getCornerCropHandler } from "./cornerCropHandler";
import { getSideCropHandler } from "./sideCropHandler";

export const fixedAspectRatioCroppingControlSet: CroppingControlSetProps = {
  cropLeft: new Control({
    x: -0.5,
    y: 0,
    offsetX: -CORNER_OFFSET_X,
    withConnection: true,
    cursorStyle: "ew-resize",
    actionHandler: getSideCropHandler(-1, 0),
    actionName: ACTION_NAME,
    render: renderCropMiddle,
    angle: 90,
  }),
  cropRight: new Control({
    x: 0.5,
    y: 0,
    withConnection: true,
    offsetX: CORNER_OFFSET_Y,
    cursorStyle: "ew-resize",
    render: renderCropMiddle,
    actionHandler: getSideCropHandler(1, 0),
    actionName: ACTION_NAME,
    angle: 90,
  }),
  cropTop: new Control({
    x: 0,
    y: -0.5,
    offsetY: -CORNER_OFFSET_Y,
    withConnection: true,
    cursorStyle: "ns-resize",
    render: renderCropMiddle,
    actionHandler: getSideCropHandler(0, -1),
    actionName: ACTION_NAME,
  }),
  cropBottom: new Control({
    x: 0,
    y: 0.5,
    withConnection: true,
    offsetY: CORNER_OFFSET_Y,
    cursorStyle: "ns-resize",
    render: renderCropMiddle,
    actionHandler: getSideCropHandler(0, 1),
    actionName: ACTION_NAME,
  }),
  cropCornerTL: new Control({
    x: -0.5,
    y: -0.5,
    offsetX: -CORNER_OFFSET_X,
    offsetY: -CORNER_OFFSET_Y,
    withConnection: true,
    cursorStyle: "nwse-resize",
    render: renderCropCorner,
    actionHandler: getCornerCropHandler(0, 0),
    actionName: ACTION_NAME,
  }),
  cropCornerBL: new Control({
    x: -0.5,
    y: 0.5,
    offsetX: -CORNER_OFFSET_X,
    offsetY: CORNER_OFFSET_Y,
    withConnection: false,
    cursorStyle: "nesw-resize",
    render: renderCropCorner,
    angle: 270,
    actionHandler: getCornerCropHandler(0, 1),
    actionName: ACTION_NAME,
  }),
  cropCornerBR: new Control({
    x: 0.5,
    y: 0.5,
    offsetX: CORNER_OFFSET_X,
    offsetY: CORNER_OFFSET_Y,
    withConnection: false,
    cursorStyle: "nwse-resize",
    render: renderCropCorner,
    angle: 180,
    actionHandler: getCornerCropHandler(1, 1),
    actionName: ACTION_NAME,
  }),
  cropCornerTR: new Control({
    x: 0.5,
    y: -0.5,
    offsetX: CORNER_OFFSET_X,
    offsetY: -CORNER_OFFSET_Y,
    withConnection: false,
    cursorStyle: "nesw-resize",
    render: renderCropCorner,
    angle: 90,
    actionHandler: getCornerCropHandler(1, 0),
    actionName: ACTION_NAME,
  }),
};

import { Canvas, Group, Point, Textbox } from "fabric";

import { EditableImage } from "../fabric/EditableImage";
import { PfpCircle } from "../fabric/PfpCircle";

export type SafeAreaBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ContentSize = {
  width: number;
  height: number;
};

// There's a lot of code that currently assumes that the safe area is always
// defined. Ideally we can update this code to take it into consideration that
// it may not be defined, but for now we provide a default.
const DEFAULT_SAFE_AREA: SafeAreaBoundingBox = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

type CanvasWithSafeAreaOptions = { [key: string]: any } & {
  safeArea?: SafeAreaBoundingBox;
};

export class CanvasWithSafeArea extends Canvas {
  // The safe area is a bounding box that describe which part of the canvas
  // surface is usable for active content display. What is meant by
  // "active content" is a bit loose. If the user isn't cropping, it's the
  // entire (possibly cropped) image. If the user _is_ cropping, it's the crop
  // area.
  declare safeArea: SafeAreaBoundingBox;

  // ContentSize is a width/height object that describes how large is the content
  // we are displaying. This is used to let the canvas adapt the zoom to a responsive
  // layout to keep the content in view
  declare contentSize: ContentSize;

  declare isCanvasWithoutImage: boolean;

  constructor(
    element: HTMLCanvasElement | string,
    options?: CanvasWithSafeAreaOptions,
  ) {
    super(element, options);
    // default contentSize. developer needs to specify the real one.
    this.contentSize = { width: 300, height: 150 };
    this.selection = false;
    this.safeArea = options?.safeArea ?? DEFAULT_SAFE_AREA;
    this.isCanvasWithoutImage = !!options?.isCanvasWithoutImage;
    this.preserveObjectStacking = true;
  }

  updateSafeArea(dims: Partial<SafeAreaBoundingBox>) {
    const { width, height, x, y } = dims;
    const { safeArea } = this;

    this.safeArea = {
      width: width ?? safeArea.width,
      height: height ?? safeArea.height,
      x: x ?? safeArea.x,
      y: y ?? safeArea.y,
    };
  }

  getCenterOfSafeArea(): Point {
    const { x, y, width, height } = this.safeArea;

    return new Point(x + width / 2, y + height / 2);
  }

  getTextTargets(): Textbox[] {
    const { targets } = this.textEditingManager as any;

    if (!targets) {
      return [];
    }

    return [...targets.filter((t: unknown) => t instanceof Textbox)];
  }

  getMainImage(): EditableImage | null {
    // return this.getObjects("EditableImage")[0] as EditableImage;
    // First check if the EditableImage is a direct child
    const objects = this.getObjects();
    const editableImage = objects.find(
      (object) => object instanceof EditableImage,
    ) as EditableImage | undefined;
    if (editableImage) {
      return editableImage;
    }

    // check groups
    const groups = objects.filter(
      (object) => object.type === "group",
    ) as Group[];
    for (const group of groups) {
      const editableImage = group._objects.find(
        (object) => object instanceof EditableImage,
      ) as EditableImage | undefined;
      if (editableImage) {
        return editableImage;
      }
    }
    return null;
  }

  getCropCircle(): PfpCircle | undefined {
    return this.getObjects("PfpCircle")[0] as PfpCircle;
  }

  toObject() {
    const data = super.toObject();

    // data.width = this.contentSize.width;
    // data.height = this.contentSize.height;

    return data;
  }
}

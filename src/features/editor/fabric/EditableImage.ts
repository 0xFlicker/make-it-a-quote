// @ts-nocheck
import type { ImageSource, TMat2D, TOriginX, TOriginY, TProps } from "fabric";
import {
  Image,
  ImageProps,
  Object as FabricObject,
  Point,
  SerializedImageProps,
  util,
} from "fabric";

import type { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";
import { croppingControlSet } from "../helpers/crop";
import { getCornerSafeAreaAspectRulesBoundPnt } from "../helpers/fixedAssetCropHandlers/cornerCropHandler";

FabricObject.ownDefaults.originX = "center";
FabricObject.ownDefaults.originY = "center";
FabricObject.ownDefaults.NUM_FRACTION_DIGIT = 10;

export type EditableImageExport = {
  type: "image";
  transform: number[];
  filters: string[];
  cropX: number;
  cropY: number;
  scaleX: number;
  width: number;
  height: number;
};

// These limits are in canvas space pixel units
export type BoundingBoxLimits = {
  top: number;
  bot: number;
  right: number;
  left: number;
};

interface SerializedImageProps extends SerializedImageProps {
  src: string;
  crossOrigin: string | null;
  filters: any[];
  resizeFilter?: any;
  cropX: number;
  cropY: number;
}

export interface EditableImageProps extends ImageProps {
  fixedAspectRatio: number;
  crossOrigin: "anonymous" | "use-credentials" | null;
  originalWidth: number;
  originalHeight: number;
}

export class EditableImage<
  Props extends TProps<EditableImageProps> = Partial<EditableImageProps>,
  SProps extends SerializedImageProps = SerializedImageProps,
> extends Image<Props, SProps> {
  static type = "EditableImage";

  declare fixedAspectRatio: number;

  declare maskCanvas: HTMLCanvasElement;

  declare bgImageCanvas: HTMLCanvasElement | null;

  declare cropOpacity: number;

  declare crossOrigin: "anonymous" | "use-credentials";

  declare isBgCheckerboard: boolean;

  declare isBgSolidColor: boolean;

  declare isCropping: boolean;

  declare originalSrc: string;

  declare canvas: CanvasWithSafeArea;

  // cropping functionalities helper properties
  declare lastTop?: number;

  declare lastLeft?: number;

  declare lastEventTop?: number;

  declare lastEventLeft?: number;

  declare moveTransformationMatrix: TMat2D;

  declare changeToPositionMatrix: TMat2D;

  // swapImage helper properties
  protected declare __element: ImageSource;

  protected declare __originalElement: ImageSource;

  protected declare _scaleX: number;

  protected declare _scaleY: number;

  protected declare _width: number;

  protected declare _height: number;

  protected declare _cropX: number;

  protected declare _cropY: number;

  constructor(arg0: ImageSource, opts: Props = {}) {
    const element = arg0;

    super(element, opts);
    this.controls = croppingControlSet;
    this.originX = "center";
    this.originY = "center";
    this.lockScalingX = true;
    this.lockScalingY = true;
    this.touchCornerSize = 48;
    this.cornerSize = 35;
    this.fixedAspectRatio = -1;
    this.crossOrigin = "anonymous";
    this.cropOpacity = 0.5;
    this.isBgSolidColor = false;
    this.isBgCheckerboard = false;
    this.bgImageCanvas = null;
    this.isCropping = false;
    this.on("moving", () => {
      if (this.isCropping) {
        this.cropModeHandlerMoveGrid();
      }
    });

    // Hide crop handles by default.
    this.hasControls = false;
    this.hasBorders = false;
    this.evented = false;
  }

  getSrc() {
    return this.originalSrc;
  }

  _render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    if (this.isCropping) {
      const originalSize = this.getOriginalSize();

      ctx.globalAlpha = this.cropOpacity;
      const elWidth = originalSize.width;
      const elHeight = originalSize.height;
      const imageCopyX = -this.cropX - this.width / 2;
      const imageCopyY = -this.cropY - this.height / 2;

      ctx.drawImage(this._element, imageCopyX, imageCopyY, elWidth, elHeight);

      ctx.globalAlpha = 1;
    }

    ctx.restore();
    super._render(ctx);
  }

  // Pans image while zoom box stays static
  cropModeHandlerMoveGrid(/* option */) {
    if (!this.isCropping) {
      return;
    }

    const lastTop =
      this.lastTop === undefined ? this.lastEventTop : this.lastTop;
    const lastLeft =
      this.lastLeft === undefined ? this.lastEventLeft : this.lastLeft;
    const changeVector = new Point(lastLeft! - this.left, lastTop! - this.top);
    const correctMovement = util.transformPoint(
      changeVector,
      this.moveTransformationMatrix
    );
    const width =
      (this._element as HTMLImageElement).naturalWidth || this._element.width;
    const height =
      (this._element as HTMLImageElement).naturalHeight || this._element.height;

    const changeX = correctMovement.x;
    const changeY = correctMovement.y;
    let cropX = this.cropX + changeX;
    let cropY = this.cropY + changeY;

    // verify bounds
    if (cropX < 0) {
      cropX = 0;
    } else if (cropX + this.width > width) {
      cropX = width - this.width;
    }

    if (cropY < 0) {
      cropY = 0;
    } else if (cropY + this.height > height) {
      cropY = height - this.height;
    }

    this.cropX = cropX;
    this.cropY = cropY;
    this.lastTop = this.top;
    this.lastLeft = this.left;
    this.top = this.lastEventTop!;
    this.left = this.lastEventLeft!;
  }

  setupDragMatrix() {
    delete this.lastLeft;
    delete this.lastTop;
    this.lastEventLeft = this.left;
    this.lastEventTop = this.top;
    this.moveTransformationMatrix = util.invertTransform(
      this.calcTransformMatrix()
    );
    this.changeToPositionMatrix = [...this.calcTransformMatrix()];
    this.moveTransformationMatrix[4] = 0;
    this.moveTransformationMatrix[5] = 0;
    this.changeToPositionMatrix[4] = 0;
    this.changeToPositionMatrix[5] = 0;
  }

  swapElement(newElement: any, exactMatch: any) {
    const newScaleX = newElement.width / this._originalElement.width;
    const objectScaling = this.getObjectScaling();

    // save reference of old element, is faster than refiltering them later.
    this.__element = this._element;
    this.__originalElement = this._originalElement;
    const maskedElement = newElement;

    this._element = maskedElement;
    this._originalElement = maskedElement;
    this._scaleX = this.scaleX;
    this.scaleX = exactMatch
      ? this.scaleX / objectScaling.x
      : this.scaleX / newScaleX;

    // if (this.clippingPath) {
    //   this.clippingPath._scaleX = this.clippingPath.scaleX;
    //   this.clippingPath.scaleX *= newScaleX;
    // }

    this._scaleY = this.scaleY;
    this.scaleY = exactMatch
      ? this.scaleY / objectScaling.x
      : this.scaleY / newScaleX;
    this._width = this.width;
    this.width *= newScaleX;
    this._height = this.height;
    this.height *= newScaleX;
    this._cropX = this.cropX;
    this.cropX *= newScaleX;
    this._cropY = this.cropY;
    this.cropY *= newScaleX;
  }

  toLocalPoint(point: Point, originX: TOriginX, originY: TOriginY) {
    const center = this.getCenterPoint();
    let p;

    if (typeof originX !== "undefined" && typeof originY !== "undefined") {
      p = this.translateToGivenOrigin(
        center,
        "center",
        "center",
        originX,
        originY
      );
    } else {
      p = new Point(this.left, this.top);
    }

    let p2 = new Point(point.x, point.y);

    if (this.angle) {
      p2 = p2.rotate(-util.degreesToRadians(this.angle), center);
    }

    return p2.subtract(p);
  }

  toObject() {
    return {
      ...super.toObject(["lastEventLeft", "lastEventTop", "fixedAspectRatio"]),
      crossOrigin: this.crossOrigin || null,
      originalWidth: this.getOriginalSize().width,
      originalHeight: this.getOriginalSize().height,
      src: this.getElement().src,
    };
  }

  // Will recenter image, and change crop box to fit maximum area within original image
  // Pans image, crop box, and resizes crop box
  resetToAspectRatio(aspectRatio: number) {
    // step1 find how large is the new box inside the safeArea
    const originalSize = this.getOriginalSize();

    // adjust the scaleAspectToSafeArea size to keep in account the current viewport scaling.
    const scaleAspectToSafeArea =
      util.findScaleToCover(
        {
          width: aspectRatio,
          height: 1,
        },
        this.canvas.safeArea
      ) / this.canvas.getZoom();

    // with this scale i can calculate how many pixels the new box is:
    const newWidthCanvas = aspectRatio * scaleAspectToSafeArea;
    const newHeightCanvas = scaleAspectToSafeArea;
    // those newWidth and newHeight are in CANVAS pixels. we want them in image pixels.
    // since the refactor of the crop, this.scaleX and this.scaleY should be always 1.
    const newWidth = newWidthCanvas;
    const newHeight = newHeightCanvas;

    // now i verify if those newWidth and newHeight can be applied to the current image a
    // at the current position and scale
    // assess space available first
    // check width first.
    const increaseWidth = newWidth - this.width;
    const availableSpaceOnTheLeft = this.cropX;
    const availableSpaceOnTheRight =
      originalSize.width - this.width - this.cropX;

    // then check height
    const increaseHeight = newHeight - this.height;
    const availableSpaceOnTheTop = this.cropY;
    const availableSpaceOnTheBottom =
      originalSize.height - this.height - this.cropY;

    const horizontalSpaceAvailable =
      availableSpaceOnTheLeft >= increaseWidth / 2 &&
      availableSpaceOnTheRight >= increaseWidth / 2;
    const verticalSpaceAvailable =
      availableSpaceOnTheTop >= increaseHeight / 2 &&
      availableSpaceOnTheBottom >= increaseHeight / 2;
    // perfect case, there is space in some way:
    const thereIsSpaceWithoutRescaling =
      (horizontalSpaceAvailable || newWidth <= originalSize.width) &&
      (verticalSpaceAvailable || newHeight <= originalSize.height);

    if (thereIsSpaceWithoutRescaling) {
      if (horizontalSpaceAvailable) {
        // just go for it
        this.width += increaseWidth;
        this.cropX -= increaseWidth / 2;
      } else {
        this.width = newWidth;
        const whatIsleft = originalSize.width - newWidth;

        this.cropX = whatIsleft / 2;
      }

      if (verticalSpaceAvailable) {
        // just go for it
        this.height += increaseHeight;
        this.cropY -= increaseHeight / 2;
      } else {
        this.height = newHeight;
        const whatIsleft = originalSize.height - newHeight;

        this.cropY = whatIsleft / 2;
      }
    } else {
      // we need to scale
      const newScale = util.findScaleToFit(originalSize, {
        width: newWidthCanvas,
        height: newHeightCanvas,
      });

      const newImageWidth = newWidthCanvas / newScale;
      const newImageHeight = newHeightCanvas / newScale;
      // and now what about cropX width and height?
      const extraSpaceX = originalSize.width - newImageWidth;
      const extraSpaceY = originalSize.height - newImageHeight;
      const wasCropX = this.cropX > 0 || originalSize.width - this.width > 0;
      const wasCropY = this.cropY > 0 || originalSize.height - this.height > 0;

      // new crop in proportion with the old one.
      this.cropX = wasCropX
        ? (extraSpaceX * this.cropX) / (originalSize.width - this.width)
        : extraSpaceX / 2;
      this.cropY = wasCropY
        ? (extraSpaceY * this.cropY) / (originalSize.height - this.height)
        : extraSpaceY / 2;
      // at this point i can set up new width, that i know is covered
      this.width = newImageWidth;
      this.height = newImageHeight;
    }

    this.setCoords();
  }

  setFixedAspectData(ratio: number): void {
    this.fixedAspectRatio = ratio;
  }

  toSimpleExport(): EditableImageExport {
    return {
      type: "image",
      transform: this.calcTransformMatrix(),
      filters: this.filters ? this.filters.map((filter) => filter.type) : [],
      cropX: this.cropX,
      cropY: this.cropY,
      scaleX: this.scaleX,
      width: this.width,
      height: this.height,
    };
  }

  getPixelCoordInCanvas(x: number, y: number): Point {
    // map a pixel on the image element on a design position.
    // objectMatrix will map a pixel from the center of the crop area to the canvas
    const objectMatrix = util.multiplyTransformMatrices(
      this.canvas.viewportTransform,
      this.calcTransformMatrix()
    );

    return util.transformPoint(
      {
        x: x - (this.width / 2 + this.cropX),
        y: y - (this.height / 2 + this.cropY),
      },
      objectMatrix
    );
  }

  // Returns limit of union of the image and safe area
  // This is necessary as image can extend beyond the safe area
  getUnionOfImageAndSafeAreaLimits(): BoundingBoxLimits {
    if (this.canvas === undefined) {
      throw new Error(
        "getLimitsofUnionOfImageAndSafeArea canvas must be defined"
      );
    }

    // @ts-ignore
    const { safeArea } = this.canvas;

    this.setCoords();
    const originalSize = this.getOriginalSize();
    const imgTopLeftCanvas = this.getPixelCoordInCanvas(0, 0);
    const imgBotRightCanvas = this.getPixelCoordInCanvas(
      originalSize.width,
      originalSize.height
    );
    const safeAreaLeftLimit = safeArea.x;
    const safeAreaRightLimit = safeArea.x + safeArea.width;
    const safeAreaTopLimit = safeArea.y;
    const safeAreaBotLimit = safeArea.y + safeArea.height;

    const ret = {
      left: Math.max(imgTopLeftCanvas.x, safeAreaLeftLimit),
      top: Math.max(imgTopLeftCanvas.y, safeAreaTopLimit),
      right: Math.min(imgBotRightCanvas.x, safeAreaRightLimit),
      bot: Math.min(imgBotRightCanvas.y, safeAreaBotLimit),
    };
    return ret;
  }

  _getOriginalDimensions() {
    const { width, height } = this._originalElement;

    return { width, height };
  }

  public exportCirclePfp(): Blob {
    const { width, height } = this.getOriginalSize();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    ctx!.drawImage(
      this._originalElement,
      0,
      0,
      width,
      height,
      0,
      0,
      width,
      height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/png");
    });
  }
}

export const isEditableImage = (object: any): object is EditableImage =>
  object instanceof EditableImage;

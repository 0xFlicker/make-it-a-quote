import { Rect, type RectProps } from "fabric";

// A checkerboard Rect, meant to be used as the background image for canvases with
// masked images to communicate transparency.
export class Checkerboard extends Rect {
  checkerboardSize = 20;

  declare checkerboardPattern: CanvasPattern | null;

  constructor(options?: Partial<RectProps>) {
    super(options);

    this.checkerboardPattern = this.createCheckeredPattern();
  }

  createCheckeredPattern() {
    const patternCanvas = document.createElement("canvas");
    const size = this.checkerboardSize;

    patternCanvas.height = 2 * size;
    patternCanvas.width = 2 * size;
    const ctx = patternCanvas.getContext("2d")!;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, size);
    ctx.fillRect(size, size, size, size);
    ctx.fillStyle = "lightgray";
    ctx.fillRect(size, 0, size, size);
    ctx.fillRect(0, size, size, size);

    return ctx.createPattern(ctx.canvas, "repeat");
  }

  _setFillStyles(
    ctx: CanvasRenderingContext2D,
    { fill }: Pick<this, "fill">,
  ): void {
    super._setFillStyles(ctx, { fill });
    ctx.fillStyle = this.checkerboardPattern!;
  }
}

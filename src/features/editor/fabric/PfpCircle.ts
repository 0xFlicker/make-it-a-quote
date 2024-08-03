import { Object, FabricObjectProps, Point } from "fabric";
import { EditableImage } from "./EditableImage";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";

export class PfpCircle extends Object {
  declare editableImage?: EditableImage | null;
  static type: string = "PfpCircle";

  constructor({
    editableImage,
    ...options
  }: Partial<FabricObjectProps> & { editableImage?: EditableImage }) {
    super(options);
    this.type = "PfpCircle";
    this.strokeWidth = 2;
    this.stroke = "#fff";
    this.fill = "transparent";
    this.originX = "center";
    this.originY = "center";
    this.hasControls = false;
    this.hasBorders = false;
    this.selectable = false;
    this.evented = false;

    this.editableImage = editableImage;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // resolve editableImage, if not already resolved
    if (!this.editableImage) {
      this.editableImage = (this.canvas as CanvasWithSafeArea)?.getMainImage();
      if (!this.editableImage) {
        return;
      }
    }

    ctx.save();
    // draw a circle centered on the crop origin extending to the crop width and height
    ctx.beginPath();
    ctx.strokeStyle = "#3789D8";

    const centerPoint = new Point(
      this.editableImage.left,
      this.editableImage.top
    );
    const width = this.editableImage.width;
    const height = this.editableImage.height;
    const radius = Math.min(width, height) / 2;
    const startAngle = 0;
    const endAngle = 2 * Math.PI;

    // Define the negative clipping region
    ctx.beginPath();
    ctx.rect(-width * 50, -height * 50, width * 100, height * 100); // large rectangle
    ctx.arc(centerPoint.x, centerPoint.y, radius, startAngle, endAngle, true); // subtract circle

    // Darken the outside of the circle
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)"; // semi-transparent black
    ctx.fill();

    ctx.restore();
  }
}

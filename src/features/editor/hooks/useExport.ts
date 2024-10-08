import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";
import { EditableImage } from "../fabric/EditableImage";
import { useCallback } from "react";
import { StaticCanvas, Object, Image, util, Point } from "fabric";

class ExportCanvas extends StaticCanvas {
  public getMainImage(): EditableImage | null {
    // return this.getObjects("EditableImage")[0] as EditableImage;
    // First check if the EditableImage is a direct child
    const objects = this.getObjects();
    const editableImage = objects.find(
      (object) => object instanceof EditableImage,
    ) as EditableImage | undefined;
    if (editableImage) {
      return editableImage;
    }

    return null;
  }
}

export function useExport({
  fabricCanvas,
  exportHeight = 400,
}: {
  exportHeight?: number;
  fabricCanvas?: CanvasWithSafeArea | null;
}) {
  const download = useCallback(async () => {
    if (!fabricCanvas) {
      return;
    }
    const exportWidth =
      (exportHeight / fabricCanvas.safeArea.height) *
      fabricCanvas.safeArea.width;
    const scaleFactorX = exportWidth / fabricCanvas.safeArea.width;
    const scaleFactorY = exportHeight / fabricCanvas.safeArea.height;
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY);

    // Create a new canvas to export
    const canvas = document.createElement("canvas");
    const exportCanvas = new ExportCanvas(canvas, {
      width: exportWidth,
      height: exportHeight,
    });
    // export all objects from the original canvas to the export canvas
    const object = fabricCanvas.toJSON();
    // Remove PfpCircle from the export canvas
    object.objects = object.objects.filter(
      (obj: Object) => obj.type !== "PfpCircle",
    );
    await exportCanvas.loadFromJSON(object);
    exportCanvas.viewportTransform = fabricCanvas.viewportTransform;
    exportCanvas.setZoom(fabricCanvas.getZoom() * scaleFactor);
    exportCanvas.relativePan(
      new Point(
        -fabricCanvas.safeArea.x * scaleFactor,
        -fabricCanvas.safeArea.y * scaleFactor,
      ),
    );

    // Pan the export canvas to the correct position
    console.log("Current safe area:", fabricCanvas.safeArea);

    exportCanvas.renderAll();
    // Now export and download the image
    exportCanvas.lowerCanvasEl.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "pfp.png";
      link.click();

      // document.body.appendChild(canvas);
      // canvas.style.position = "absolute";
      // canvas.style.top = "0";
      // canvas.style.left = "0";
      // canvas.style.zIndex = "1000";
      // canvas.style.pointerEvents = "none";
      // canvas.style.opacity = "0";
      // canvas.style.transition = "opacity 2s";
      // canvas.style.backgroundColor = "white";
      // // apply a scale to the canvas to make it smaller
      // canvas.style.transform = `scale(${1 / 4})`;

      // setTimeout(() => {
      //   canvas.style.opacity = "1";
      // }, 0);

      // setTimeout(() => {
      //   canvas.style.opacity = "0";
      // }, 5000);

      // setTimeout(() => {
      //   document.body.removeChild(canvas);
      // }, 7000);
    }, "image/png");
  }, [exportHeight, fabricCanvas]);
  return download;
}

import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";
import { EditableImage } from "../fabric/EditableImage";
import { RefObject, useCallback, useEffect, useState } from "react";
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

export function usePreview({
  fabricCanvas,
  exportWidth = 400,
  exportHeight = 400,
  canvasRef,
}: {
  exportWidth?: number;
  exportHeight?: number;
  fabricCanvas?: CanvasWithSafeArea | null;
  canvasRef: RefObject<HTMLCanvasElement>;
}) {
  const [exportCanvas, setExportCanvas] = useState<ExportCanvas | null>(null);
  useEffect(() => {
    if (!fabricCanvas) {
      return;
    }
    let exportCanvas: ExportCanvas;
    const init = async () => {
      if (!canvasRef.current) {
        return;
      }
      const object = fabricCanvas.toJSON();
      object.objects = object.objects.filter(
        (obj: Object) => obj.type !== "PfpCircle",
      );

      const scaleFactorX = exportWidth / fabricCanvas.safeArea.width;
      const scaleFactorY = exportHeight / fabricCanvas.safeArea.height;
      const scaleFactor = Math.min(scaleFactorX, scaleFactorY);

      exportCanvas = new ExportCanvas(canvasRef.current, {
        width: exportWidth,
        height: exportHeight,
      });

      await exportCanvas.loadFromJSON(object);
      exportCanvas.viewportTransform = fabricCanvas.viewportTransform;
      exportCanvas.setZoom(scaleFactor);

      exportCanvas.relativePan(
        new Point(
          -fabricCanvas.safeArea.x * scaleFactor,
          -fabricCanvas.safeArea.y * scaleFactor,
        ),
      );

      exportCanvas.renderAll();
      setExportCanvas(exportCanvas);
    };
    const oldCanvasRenderAll = fabricCanvas.renderAll;
    fabricCanvas.renderAll = function () {
      if (!exportCanvas) {
        init();
      }
      oldCanvasRenderAll.call(fabricCanvas);
      exportCanvas?.renderAll();
    };
    return () => {
      fabricCanvas.renderAll = oldCanvasRenderAll;
    };
  }, [fabricCanvas, exportWidth, exportHeight]);

  return exportCanvas;
}

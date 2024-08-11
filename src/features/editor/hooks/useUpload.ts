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

type UploadResponse =
  | {
      success: boolean;
      message: string;
    }
  | { error: string };

export function useUpload({
  fabricCanvas,
  exportWidth = 400,
  exportHeight = 400,
}: {
  exportWidth?: number;
  exportHeight?: number;
  fabricCanvas?: CanvasWithSafeArea | null;
}) {
  const upload = useCallback(async () => {
    if (!fabricCanvas) {
      return;
    }
    const editableImage = fabricCanvas.getMainImage();
    if (!editableImage) {
      return;
    }

    const imageHeight = editableImage.height;

    // Create a new canvas to export
    const exportCanvas = new ExportCanvas(document.createElement("canvas"), {
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

    // Scale the export canvas to the correct size
    exportCanvas.setZoom(exportHeight / imageHeight);
    // Pan the export canvas to the correct position
    exportCanvas.relativePan(
      new Point(-fabricCanvas.safeArea.x - 1, -fabricCanvas.safeArea.y - 1),
    );

    exportCanvas.renderAll();
    // Now export and download the image
    exportCanvas.lowerCanvasEl.toBlob(async (blob) => {
      if (!blob) {
        return;
      }
      const formData = new FormData();
      formData.append(
        "file",
        new File([blob], "pfp.png", { type: "image/png" }),
      );
      const request = new Request("/upload/user", {
        method: "POST",
        body: formData,
      });
      try {
        const response = await fetch(request);
        const json: UploadResponse = await response.json();
        if ("error" in json) {
          console.error(json.error);
        } else {
          console.log(json.message);
        }
      } catch (error) {
        console.error(error);
      }
    }, "image/png");
  }, [exportHeight, exportWidth, fabricCanvas]);
  return upload;
}

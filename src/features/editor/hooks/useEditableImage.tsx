import { useEffect } from "react";
import { EditableImage } from "../fabric/EditableImage";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";
import { FabricImage } from "fabric";

export function useEditableImage({
  canvas,
  src,
  onLoaded,
  onSelected,
}: {
  canvas?: CanvasWithSafeArea | null;
  src?: string;
  onLoaded?: () => void;
  onSelected?: () => void;
}) {
  useEffect(() => {
    if (!canvas) {
      return;
    }

    if (!src) {
      return;
    }
    const image = new Image();
    image.src = src;

    let editableImage = canvas.getMainImage();
    if (!editableImage) {
      editableImage = new EditableImage(image, {
        // width: 400,
        // height: 400,
      });
      image.onload = () => {
        if (!editableImage) {
          throw new Error("Editable image not found");
        }
        canvas.add(editableImage);
        editableImage.setCoords();
        editableImage.setupDragMatrix();
        const ratio = 1;
        editableImage.setFixedAspectData(ratio);
        editableImage.resetToAspectRatio(ratio);
        editableImage.on("selected", () => {
          onSelected?.();
        });
        canvas.renderAll();
        onLoaded?.();
      };
    } else {
      image.onload = () => {
        const fabricImage = new FabricImage(image);
        fabricImage.on("selected", () => {
          onSelected?.();
        });
        canvas.add(fabricImage);
        canvas.renderAll();
        onLoaded?.();
      };
    }
    // Don't re-add the image if the onLoad callback changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, src]);
}

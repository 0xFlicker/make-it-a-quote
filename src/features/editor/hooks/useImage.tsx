import { useCallback } from "react";
import { FabricImage } from "fabric";
import { EditableImage } from "../fabric/EditableImage";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";

export function useImage({
  aspectRatio = 1,
  canvas,
}: {
  aspectRatio?: number;
  canvas: CanvasWithSafeArea | null;
}) {
  const addImage = useCallback(
    (image: HTMLImageElement) => {
      if (!canvas) {
        return null;
      }

      // check if there is an editable image already
      let editableImage = canvas.getMainImage();

      if (!editableImage) {
        editableImage = new EditableImage(image, {
          // width: 400,
          // height: 400,
        });
        canvas.add(editableImage);
        editableImage.setCoords();
        editableImage.setupDragMatrix();
        editableImage.setFixedAspectData(aspectRatio);
        editableImage.resetToAspectRatio(aspectRatio);
      } else {
        const fabricImage = new FabricImage(image);
        canvas.add(fabricImage);
        return fabricImage;
      }
      return editableImage;
    },
    [aspectRatio, canvas],
  );

  return { addImage };
}

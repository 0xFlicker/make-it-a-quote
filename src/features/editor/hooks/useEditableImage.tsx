import { useEffect } from "react";
import { EditableImage } from "../fabric/EditableImage";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";

export function useEditableImage({
  canvas,
  src,
  onLoaded,
}: {
  canvas?: CanvasWithSafeArea | null;
  src?: string;
  onLoaded?: () => void;
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
    const editableImage = new EditableImage(image, {
      // width: 400,
      // height: 400,
    });
    image.onload = () => {
      canvas.add(editableImage);
      // canvas.add(
      //   new PfpCircle({
      //     editableImage,
      //   })
      // );
      editableImage.setCoords();
      editableImage.setupDragMatrix();
      const ratio = 1;
      editableImage.setFixedAspectData(ratio);
      editableImage.resetToAspectRatio(ratio);

      canvas.renderAll();
      onLoaded?.();
    };
    return () => {
      canvas.remove(editableImage);
    };
    // Don't re-add the image if the onLoad callback changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, src]);
}

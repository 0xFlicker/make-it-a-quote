import { useCallback, useState } from "react";
// import crop
import {
  CanvasContextWithApply,
  CanvasRenderState,
  CreativeImage,
} from "../helpers/canvasTool";
import { useCropAndResizeTool } from "../helpers/cropResize";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";

export type UseToolInitProps = {
  canvas?: CanvasWithSafeArea | null;
  onApply: CanvasContextWithApply["onApply"];
  loaded: boolean;
  image?: CreativeImage | null;
};
export function useCrop({ canvas, loaded, onApply }: UseToolInitProps) {
  const [state, setState] = useState<CanvasRenderState>({
    isCropping: false,
    crop: {
      cropX: 0,
      cropY: 0,
      width: 1,
      height: 1,
      zoomValue: 1,
    },
    image: null,
  });
  const cropResizeTool = useCropAndResizeTool();

  const enterCrop = useCallback(() => {
    if (canvas && loaded && cropResizeTool.enter) {
      const ctx: CanvasContextWithApply = {
        canvas,
        state,
        onApply,
      };
      setState({
        ...state,
        isCropping: true,
      });
      const exit = cropResizeTool.enter(ctx);

      return () => {
        setState({
          ...state,
          isCropping: false,
        });
        exit({
          canvas,
          state,
          onApply,
        });
      };
    }

    return () => {};
  }, [canvas, loaded, onApply, state, cropResizeTool]);

  const resetCrop = useCallback(() => {
    cropResizeTool.reset({
      state,
      canvas,
    });
  }, [cropResizeTool, state, canvas]);

  return {
    enterCrop,
    resetCrop,
    state,
    setState,
  };
}

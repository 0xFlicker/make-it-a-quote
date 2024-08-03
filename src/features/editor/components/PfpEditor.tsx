"use client";
import Grid2 from "@mui/material/Unstable_Grid2";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { FileUploadPanel } from "./FileUploadPanel";
import { IText } from "fabric";
import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import CropIcon from "@mui/icons-material/Crop";
import TextIcon from "@mui/icons-material/TextFields";
import FormatColor from "@mui/icons-material/FormatColorText";
import FormatSize from "@mui/icons-material/FormatSize";
import ResetIcon from "@mui/icons-material/Replay";
import DownloadIcon from "@mui/icons-material/Download";

import { useCrop } from "../hooks/useCrop";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";
import { useEditableImage } from "../hooks/useEditableImage";
import { PfpCanvas } from "./PfpCanvas";
import Paper from "@mui/material/Paper";
import DocumentIcon from "@mui/icons-material/Description";
import { StickerPopover } from "./StickerPopover";
import { Image as FabricImage } from "fabric";
import { useExport } from "../hooks/useExport";

import "../fabric/register";
import { stickers } from "../stickers";

interface State {
  isEmpty: boolean;
  file: File | null;
  fabricCanvas: CanvasWithSafeArea | null;
  activeTool: "stickers" | "crop" | "text" | null;
}

interface ClearAction {
  type: "clear";
}

interface FileOpenedAction {
  type: "fileOpened";
  payload: File;
}

interface CanvasReadyAction {
  type: "canvasReady";
  payload: CanvasWithSafeArea;
}

interface EnterCropAction {
  type: "enterCrop";
}

interface ExitCropAction {
  type: "exitCrop";
}

interface OpenStickerSelectAction {
  type: "openStickerSelect";
}

interface CloseStickerSelectAction {
  type: "closeStickerSelect";
}

interface EnterTextAction {
  type: "enterText";
}

interface ExitTextAction {
  type: "exitText";
}

type Action =
  | ClearAction
  | FileOpenedAction
  | CanvasReadyAction
  | EnterCropAction
  | ExitCropAction
  | OpenStickerSelectAction
  | CloseStickerSelectAction
  | EnterTextAction
  | ExitTextAction;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "clear": {
      return {
        isEmpty: true,
        file: null,
        fabricCanvas: null,
        activeTool: null,
      };
    }
    case "fileOpened": {
      return {
        ...state,
        isEmpty: false,
        file: action.payload,
      };
    }
    case "canvasReady": {
      return {
        ...state,
        fabricCanvas: action.payload,
      };
    }
    case "enterCrop": {
      return {
        ...state,
        activeTool: "crop",
      };
    }
    case "exitCrop": {
      return {
        ...state,
        activeTool: null,
      };
    }
    case "openStickerSelect": {
      return {
        ...state,
        activeTool: "stickers",
      };
    }
    case "closeStickerSelect": {
      return {
        ...state,
        activeTool: null,
      };
    }
    case "enterText": {
      return {
        ...state,
        activeTool: "text",
      };
    }
    case "exitText": {
      return {
        ...state,
        activeTool: null,
      };
    }
    default: {
      return state;
    }
  }
}

export const PfpEditor: FC = () => {
  const [stickerAnchorEl, setStickerAnchorEl] = useState<HTMLElement | null>(
    null,
  );

  const [doExitCrop, setExitCrop] = useState(() => () => {});
  const [state, dispatch] = useReducer(reducer, {
    isEmpty: true,
    file: null,
    fabricCanvas: null,
    activeTool: null,
  });

  const fileUrl = useMemo(() => {
    if (state.file) {
      return URL.createObjectURL(state.file);
    }
  }, [state.file]);

  const image = useMemo(() => {
    if (state.isEmpty || !fileUrl) {
      return null;
    }
    return {
      aspect: 1,
      url: fileUrl,
    };
  }, [state.isEmpty, fileUrl]);
  const {
    enterCrop: doEnterCrop,
    resetCrop: doResetCrop,
    state: { isCropping },
  } = useCrop({
    canvas: state.fabricCanvas,
    loaded: !state.isEmpty,
    image,
    onApply: () => {},
  });

  const doCrop = useCallback(() => {
    if (!isCropping) {
      const exit = doEnterCrop();
      dispatch({
        type: "enterCrop",
      });
      setExitCrop(() => exit);
    } else if (isCropping && doExitCrop) {
      doExitCrop();
      dispatch({
        type: "exitCrop",
      });
    }
  }, [isCropping, doExitCrop, doEnterCrop]);

  const reset = useCallback(() => {
    doResetCrop();
  }, [doResetCrop]);

  const onFileReady = useCallback((file: File) => {
    dispatch({
      type: "fileOpened",
      payload: file,
    });
  }, []);

  const onCanvasReady = useCallback((canvas: CanvasWithSafeArea | null) => {
    if (canvas) {
      dispatch({
        type: "canvasReady",
        payload: canvas,
      });
    }
  }, []);

  const onLoaded = useCallback(() => {
    reset();
  }, [reset]);
  useEditableImage({ canvas: state.fabricCanvas, src: fileUrl, onLoaded });

  const download = useExport({
    fabricCanvas: state.fabricCanvas,
  });

  const addText = useCallback(() => {
    if (state.fabricCanvas) {
      const { fabricCanvas } = state;
      const text = new IText("😅", {
        left: 100,
        top: 100,
        fontSize: 100,
      });

      text.onDeselect = () => {
        if (text.text === "") {
          fabricCanvas.remove(text);
        }
        dispatch({
          type: "exitText",
        });
        return true;
      };

      fabricCanvas.add(text);
      fabricCanvas.renderAll();
    }
  }, [state]);

  return (
    <>
      <Grid2 container spacing={2}>
        <Grid2 xs={12}>
          <FileUploadPanel onFileUpload={onFileReady} />
        </Grid2>
        <Grid2 xs={12}>
          <PfpCanvas onCanvasReady={onCanvasReady} />
        </Grid2>
      </Grid2>
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        {(() => {
          switch (state.activeTool) {
            case null: {
              return (
                <BottomNavigation
                  showLabels
                  value={state.activeTool}
                  onChange={(_, newValue: number) => {
                    switch (newValue) {
                      case 0: {
                        dispatch({
                          type: "openStickerSelect",
                        });
                        break;
                      }
                      case 1: {
                        addText();
                        dispatch({
                          type: "enterText",
                        });
                        break;
                      }
                      case 2: {
                        doCrop();
                        break;
                      }
                      case 2: {
                        download();
                        break;
                      }
                      default: {
                        break;
                      }
                    }
                  }}
                >
                  <BottomNavigationAction
                    ref={setStickerAnchorEl}
                    label="Stickers"
                    icon={<DocumentIcon />}
                  />
                  <BottomNavigationAction label="Text" icon={<TextIcon />} />
                  <BottomNavigationAction label="Crop" icon={<CropIcon />} />
                  <BottomNavigationAction
                    label="Download"
                    icon={<DownloadIcon />}
                  />
                </BottomNavigation>
              );
            }
            case "text": {
              return (
                <BottomNavigation
                  showLabels
                  value={state.activeTool}
                  onChange={(_, newValue: number) => {
                    switch (newValue) {
                      case 0: {
                        dispatch({
                          type: "openStickerSelect",
                        });
                        break;
                      }
                      case 1: {
                        addText();
                        dispatch({
                          type: "enterText",
                        });
                        break;
                      }
                      case 2: {
                        doCrop();
                        break;
                      }
                      case 2: {
                        download();
                        break;
                      }
                      default: {
                        break;
                      }
                    }
                  }}
                >
                  <BottomNavigationAction
                    ref={setStickerAnchorEl}
                    label="Color"
                    icon={<FormatColor />}
                  />
                  <BottomNavigationAction label="Size" icon={<FormatSize />} />
                  <BottomNavigationAction label="Crop" icon={<CropIcon />} />
                  <BottomNavigationAction
                    label="Download"
                    icon={<DownloadIcon />}
                  />
                </BottomNavigation>
              );
            }
          }
        })()}
      </Paper>
      <StickerPopover
        anchorEl={stickerAnchorEl}
        open={state.activeTool === "stickers"}
        handleClose={() => {
          dispatch({
            type: "closeStickerSelect",
          });
        }}
        cells={stickers}
        onCellSelected={(src) => {
          if (state.fabricCanvas) {
            const { fabricCanvas } = state;
            const img = new Image();
            img.src = src;
            img.onload = () => {
              // Set a fixed size for the images
              const fixedWidth = 100; // Change this to the desired width
              const fixedHeight = 100; // Change this to the desired height

              // Calculate the scale factors
              const scaleX = fixedWidth / img.width;
              const scaleY = fixedHeight / img.height;

              const fabricImage = new FabricImage(img, {
                scaleX,
                scaleY,
              });

              fabricCanvas.insertAt(1, fabricImage);
              fabricCanvas.renderAll();
            };
          }
        }}
      />
    </>
  );
};

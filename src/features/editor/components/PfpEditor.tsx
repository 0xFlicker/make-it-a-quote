"use client";
import Grid2 from "@mui/material/Unstable_Grid2";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { FileUploadDialog, FileUploadPanel } from "./FileUploadPanel";
import { IText } from "fabric";
import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import CropIcon from "@mui/icons-material/Crop";
import TextIcon from "@mui/icons-material/TextFields";
import SendIcon from "@mui/icons-material/Send";
import EditNote from "@mui/icons-material/EditNote";
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
import { EmptyBar } from "./EmptyBar";
import { FormatBar } from "./Formats/FormatBar";

import "../fabric/register";
import { stickers } from "../stickers";
import { FormatStyles, FormatPopover } from "./Formats/FormatPopover";
import { useUpload } from "../hooks/useUpload";
import { FontStyles } from "./Formats/FontPopover";
import { StrokeStyles } from "./Formats/StrokePopover";
import { ParagraphStyles } from "./Formats/ParagraphPopover";
import { useImage } from "../hooks/useImage";
import { FormatsProvider, useFormats } from "./Formats/useFormats";
import { ImageBar } from "./ImageBar";
import { useCast } from "../hooks/useCast";
import { usePreview } from "../hooks/usePreview";

interface State {
  isEmpty: boolean;
  file: File | null;
  fabricCanvas: CanvasWithSafeArea | null;
  activeTool: "stickers" | "crop" | "text" | "image" | null;
  textStyles?: FormatStyles;
  activePopover?: "text" | "sticker" | null;
  openDialog?: "import" | null;
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

interface EnterImageAction {
  type: "enterImage";
}

interface ExitImageAction {
  type: "exitImage";
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

interface EnterTextFormatAction {
  type: "enterTextFormat";
}
interface ExitTextFormatAction {
  type: "exitTextFormat";
}

interface OpenImportDialogAction {
  type: "openImportDialog";
}
interface CloseImportDialogAction {
  type: "closeImportDialog";
}

type Action =
  | ClearAction
  | FileOpenedAction
  | CanvasReadyAction
  | EnterCropAction
  | ExitCropAction
  | EnterImageAction
  | ExitImageAction
  | OpenStickerSelectAction
  | CloseStickerSelectAction
  | EnterTextAction
  | ExitTextAction
  | EnterTextFormatAction
  | ExitTextFormatAction
  | OpenImportDialogAction
  | CloseImportDialogAction;

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
    case "enterImage": {
      return {
        ...state,
        activeTool: "image",
      };
    }
    case "exitImage": {
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
        textStyles: undefined,
      };
    }
    case "enterTextFormat": {
      return {
        ...state,
        activePopover: "text",
      };
    }
    case "exitTextFormat": {
      return {
        ...state,
        activePopover: null,
      };
    }
    case "openImportDialog": {
      return {
        ...state,
        openDialog: "import",
      };
    }
    case "closeImportDialog": {
      return {
        ...state,
        openDialog: null,
      };
    }
    default: {
      return state;
    }
  }
}

const TEXT_DEFAULTS: {
  format: FormatStyles;
  font: FontStyles;
  stroke: StrokeStyles;
  paragraph: ParagraphStyles;
} = {
  format: {
    isBold: false,
    isItalic: false,
    isUnderlined: false,
  },
  font: {
    size: 16,
  },
  stroke: {
    width: 1,
    fillColor: "#FF000000",
    strokeColor: "#FFFFFFFF",
  },
  paragraph: {
    align: "left",
  },
};
type Props = {
  embeds?: string[];
  parentPfp?: string;
  castId?: `0x${string}`;
  aspectRatio?: number;
};
export const Content: FC<Props> = ({
  aspectRatio,
  castId,
  embeds,
  parentPfp,
}) => {
  const { onTextSelect } = useFormats();
  const [stickerAnchorEl, setStickerAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [bottomNavigation2ndAnchorEl, setBottomNavigation2ndAnchorEl] =
    useState<HTMLElement | null>(null);

  const [bottomNavigation3rdAnchorEl, setBottomNavigation3rdAnchorEl] =
    useState<HTMLElement | null>(null);

  const [doExitCrop, setExitCrop] = useState(() => () => {});
  const [state, dispatch] = useReducer(reducer, {
    isEmpty: true,
    file: null,
    fabricCanvas: null,
    activeTool: null,
    openDialog: null,
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
  useEditableImage({
    aspectRatio,
    canvas: state.fabricCanvas,
    src: fileUrl,
    onLoaded,
    onSelected() {
      dispatch({
        type: "enterImage",
      });
    },
  });
  const { addImage } = useImage({
    aspectRatio,
    canvas: state.fabricCanvas,
  });

  const addAndRestImage = useCallback(
    async (src: string) => {
      const image = new Image();
      image.src = src;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
      const editableImage = addImage(image);
      editableImage?.on("selected", () => {
        dispatch({
          type: "enterImage",
        });
      });
      state.fabricCanvas?.renderAll();
    },
    [addImage, state.fabricCanvas],
  );

  // useEffect(() => {
  //   if (fileUrl) {
  //     setTimeout(() => {
  //       addAndRestImage(fileUrl);
  //       console.log("fileUrl", fileUrl);
  //       reset();
  //     }, 250);
  //   }
  // }, [fileUrl, addAndRestImage, reset]);

  const download = useExport({
    fabricCanvas: state.fabricCanvas,
    exportHeight: 512,
  });
  const upload = useUpload({
    fabricCanvas: state.fabricCanvas,
  });
  const doCast = useCast({
    fabricCanvas: state.fabricCanvas,
    castId,
  });
  const addText = useCallback(() => {
    if (state.fabricCanvas) {
      const { fabricCanvas } = state;
      const text = new IText("😅", {
        left: 100,
        top: 100,
        fontSize: 100,
        fontFamily: "sans-serif",
      });

      text.on("selected", () => {
        let align: ParagraphStyles["align"] = "left";
        if (text.textAlign === "center") {
          align = "center";
        } else if (text.textAlign === "right") {
          align = "right";
        }
        onTextSelect(text);
        dispatch({
          type: "enterText",
        });
        return false;
      });

      text.on("deselected", () => {
        if (text.text === "") {
          fabricCanvas.remove(text);
        }
        dispatch({
          type: "exitText",
        });
        return false;
      });

      fabricCanvas.add(text);
      fabricCanvas.renderAll();
    }
  }, [onTextSelect, state]);
  const toolbarHeight = 64;
  const bottomNavigationHeight = 50;

  return (
    <>
      {/* {state.activeTool === "text" ? (
        <FormatBar fabricCanvas={state.fabricCanvas} />
      ) : (
        <EmptyBar
          onImport={() => {
            dispatch({
              type: "openImportDialog",
            });
          }}
          onImportEmbed={addAndRestImage}
          onImportParentPfp={addAndRestImage}
          embeds={[
            "https://d3n3snwzfu7e0e.cloudfront.net/Th54snTfVkLPGAk6-qX-u",
          ]}
        />
      )} */}
      {(() => {
        switch (state.activeTool) {
          case "text": {
            return (
              <FormatBar
                fabricCanvas={state.fabricCanvas}
                onDownload={download}
                onImport={() => {
                  dispatch({
                    type: "openImportDialog",
                  });
                }}
                onImportEmbed={addAndRestImage}
                onImportParentPfp={addAndRestImage}
                embeds={embeds}
                parentPfp={parentPfp}
              />
            );
          }
          case "image": {
            return (
              <ImageBar
                onImport={() => {
                  dispatch({
                    type: "openImportDialog",
                  });
                }}
                onImportEmbed={addAndRestImage}
                onImportParentPfp={addAndRestImage}
                embeds={embeds}
                parentPfp={parentPfp}
                fabricCanvas={state.fabricCanvas}
              />
            );
          }
          default: {
            return (
              <EmptyBar
                onDownload={download}
                onImport={() => {
                  dispatch({
                    type: "openImportDialog",
                  });
                }}
                onImportEmbed={addAndRestImage}
                onImportParentPfp={addAndRestImage}
                embeds={embeds}
                parentPfp={parentPfp}
              />
            );
          }
        }
      })()}

      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          height: `calc(100vh - ${toolbarHeight}px - ${bottomNavigationHeight}px)`,
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <PfpCanvas onCanvasReady={onCanvasReady} aspectRatio={aspectRatio} />
        </Box>
      </Container>
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
                        break;
                      }
                      case 2: {
                        doCrop();
                        break;
                      }
                      case 3: {
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
                  <BottomNavigationAction label="Cast" icon={<SendIcon />} />
                </BottomNavigation>
              );
            }
            case "crop": {
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
                      break;
                    }
                    case 2: {
                      doCrop();
                      break;
                    }
                    case 2: {
                      doCast();
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
                <BottomNavigationAction label="Cast" icon={<SendIcon />} />
              </BottomNavigation>;
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
                        break;
                      }
                      case 2: {
                        doCrop();
                        break;
                      }
                      case 3: {
                        doCast();
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
                  <BottomNavigationAction label="Cast" icon={<SendIcon />} />
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
      <FormatPopover
        anchorEl={bottomNavigation3rdAnchorEl}
        open={state.activePopover === "text"}
        onClose={() => {
          dispatch({
            type: "exitTextFormat",
          });
        }}
        onFormatChange={(fontStyles) => {
          if (state.fabricCanvas) {
            const { fabricCanvas } = state;
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject instanceof IText) {
              activeObject.set({
                fontWeight: fontStyles.isBold ? "bold" : "normal",
                fontStyle: fontStyles.isItalic ? "italic" : "normal",
                underline: fontStyles.isUnderlined,
              });
              fabricCanvas.renderAll();
            }
          }
        }}
        initialFormat={state.textStyles}
      />
      <FileUploadDialog
        open={state.openDialog === "import"}
        onClose={() =>
          dispatch({
            type: "closeImportDialog",
          })
        }
        onFileUpload={(file) => {
          dispatch({
            type: "fileOpened",
            payload: file,
          });
        }}
      />
    </>
  );
};

export const PfpEditor: FC<Props> = (props) => {
  return (
    <FormatsProvider>
      <Content {...props} />
    </FormatsProvider>
  );
};

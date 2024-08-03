import { NonEmpty } from "@/utils/types";
import { CanvasWithSafeArea } from "./CanvasWithSafeArea";
import { TFiller } from "fabric";
import { ComponentType, ElementType } from "react";

export type fontStyleProps = {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
};

export type CanvasFontProps = {
  id: string;
  headerFont: fontStyleProps;
  headerFontLabel: string;
  bodyFont: fontStyleProps;
  bodyFontLabel: string;
};

export type CropState = {
  zoomValue: number;
  cropX: number;
  cropY: number;
  width?: number;
  height?: number;
};

export type Node = {
  top: number;
  left: number;
  height: number;
  width: number;
};

export type TextNode = Node & {
  text: string;
  fontSize: number;
  textAlign: "left" | "right" | "center";
  fontFamily: string;
  fontWeight: "normal" | "bold" | "bolder";
};

export type ColorsState = {
  currentColors: Array<string | TFiller | null>;
};

export type FontsState = {
  selectedFont: string;
  originalFonts: CanvasFontProps | null;
};

export type CreativeImage = {
  aspect: number;
  url: string;
};

export type CanvasRenderState = {
  image?: CreativeImage | null;
  isCropping?: boolean;
  crop: CropState;
  // textNodes?: TextNode[];

  // fonts: FontsState;
};

export type CanvasHandle = CanvasWithSafeArea;

export type CanvasContext = {
  canvas: CanvasHandle;
  state: CanvasRenderState;
};

export type CanvasContextWithApply = CanvasContext & { onApply: () => void };

export type CanvasToolExit = (ctx: CanvasContextWithApply) => void;
export type CanvasToolEnter = (ctx: CanvasContextWithApply) => CanvasToolExit;
export type CanvasToolLabel = () => string;
export type CanvasToolIcon = ComponentType<{ className: string }>;

export type CanvasToolMainCanvas<M> = (arg0: CanvasContextWithApply) => {
  props: M;
  Component: ComponentType<M>;
};
export type CanvasToolControl<P> = (arg0: CanvasContextWithApply) => {
  props: P;
  Component: ComponentType<P>;
};

type CanvasToolActionProps<
  T extends Partial<CanvasRenderState> = CanvasRenderState
> = {
  state: T;
  canvas?: CanvasHandle | null;
};

export type CanvasToolApply = (
  props: CanvasToolActionProps
) => CanvasRenderState;
export type CanvasToolReset = (
  props: CanvasToolActionProps
) => CanvasRenderState;

export type CanvasToolRender<T extends Partial<CanvasRenderState>> = (
  props: CanvasToolActionProps<T>
) => void;

// A "CanvasTool" manages the user interaction for a given tool. It is
// responsible for configuring the canvas with the needed display and editing
// modes, providing the UI controls to interact with the tool, and determining
// the tool's output rendering state. The tool does not handle the actual
// rendering by mutating the canvas directly. The canvas is responsible for
// rendering according to the values in the CanvasState.
export type CanvasTool<C = any, S = any, M = any> = {
  // The Icon component for a tool.
  icon: CanvasToolIcon | ElementType;

  // Called when the tool becomes active with a CanvasContext object that
  // contains a handle to the underlying canvas renderer, the render state, and
  // a handle to the main image on the canvas.
  enter: CanvasToolEnter;

  // This is used when a tool will take over the main canvas image
  // in scenarios like the template tools, where the user is presented with 4
  // templates instead of the rendered image
  mainCanvasContent?: CanvasToolMainCanvas<M>;

  // Override the aspect ratio of the main canvas content, used in scenarios
  // like the crop, where the tool always want the aspect ratio it entered in
  contentAspectRatioOverride?: number;

  // A component with all the UI needed to interact with this tool. Although it
  // is possible, tools should not pass the CanvasHandle or TargetImage as props
  // to this component. Instead, pass callback functions to the control
  // component that prevent leaking canvas details into the view.
  controls?: CanvasToolControl<C>;

  // sidebar controls
  sideBarControls?: CanvasToolControl<S>;

  // The apply function is similar to a redux reducer. It takes in a RenderState
  // argument that describes what should be rendered by the canvas (see
  // RenderState for details). The apply function should return a new
  // RenderState that describes the effect of the tool. For example, the
  // FilterTool should update the filter attribute of the RenderState to reflect
  // the currently selected filter.
  apply: CanvasToolApply;

  // The reset fuction is called when the user wants to cancel their changes. it
  // should revert the tool to its default state.
  reset: CanvasToolReset;

  // disables the button if set to true
  disabled?: boolean;
  // hides the button if set to true
  hidden?: boolean;
  // Inform the UI that the tool has non-applied changes
  isDirty: boolean;
  // controls whether or not we show the close button for a tool when it's selected
  isCloseBtnDisabled?: boolean;
};

export type CanvasToolList = NonEmpty<CanvasTool>;

export const canvasToolDefault: Pick<CanvasTool, "enter" | "apply" | "reset"> =
  {
    enter: () => () => {},
    apply: ({ state }) => state,
    reset: ({ state }) => state,
  };

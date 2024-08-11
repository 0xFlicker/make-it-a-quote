import React, {
  FC,
  useCallback,
  useReducer,
  useRef,
  createContext,
  useContext,
  PropsWithChildren,
} from "react";
import type { FormatStyles } from "./FormatPopover";
import type { ParagraphStyles } from "./ParagraphPopover";
import type { FontStyles } from "./FontPopover";
import type { StrokeStyles } from "./StrokePopover";
import { IText } from "fabric";

type State = {
  font: FontStyles;
  paragraph: ParagraphStyles;
  stroke: StrokeStyles;
  format: FormatStyles;
  popoverOpen:
    | "format"
    | "paragraph"
    | "font"
    | "stroke"
    | "fillColor"
    | "strokeColor"
    | null;
};

type Action =
  | { type: "setFormat"; payload: FormatStyles }
  | { type: "toggleBold" }
  | { type: "toggleItalic" }
  | { type: "toggleUnderline" }
  | { type: "setParagraph"; payload: ParagraphStyles }
  | { type: "toggleAlignLeft" }
  | { type: "toggleAlignCenter" }
  | { type: "toggleAlignRight" }
  | { type: "setStroke"; payload: StrokeStyles }
  | { type: "setColorFill"; payload: string }
  | { type: "setColorStroke"; payload: string }
  | { type: "setStrokeWidth"; payload: number }
  | { type: "setFont"; payload: FontStyles }
  | { type: "setFontSize"; payload: number }
  | { type: "openPopover"; payload: State["popoverOpen"] }
  | { type: "closePopover"; payload: State["popoverOpen"] }
  | {
      type: "selectFormats";
      payload: {
        format: FormatStyles;
        font: FontStyles;
        paragraph: ParagraphStyles;
        stroke: StrokeStyles;
      };
    };

const initialState: State = {
  format: {
    isBold: false,
    isItalic: false,
    isUnderlined: false,
  },
  paragraph: {
    align: "left",
  },
  stroke: {
    fillColor: "#000000",
    strokeColor: "#FFFFFF",
    width: 1,
  },
  font: {
    size: 16,
  },
  popoverOpen: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "selectFormats":
      return {
        ...state,
        format: action.payload.format,
        font: action.payload.font,
        paragraph: action.payload.paragraph,
        stroke: action.payload.stroke,
      };
    case "setFont":
      return { ...state, font: action.payload };
    case "setFontSize":
      return { ...state, font: { ...state.font, size: action.payload } };
    case "setFormat":
      return { ...state, format: action.payload };
    case "toggleBold":
      return {
        ...state,
        format: { ...state.format, isBold: !state.format.isBold },
      };
    case "toggleItalic":
      return {
        ...state,
        format: { ...state.format, isItalic: !state.format.isItalic },
      };
    case "toggleUnderline":
      return {
        ...state,
        format: { ...state.format, isUnderlined: !state.format.isUnderlined },
      };
    case "setParagraph":
      return { ...state, paragraph: action.payload };
    case "toggleAlignLeft":
      return { ...state, paragraph: { align: "left" } };
    case "toggleAlignCenter":
      return { ...state, paragraph: { align: "center" } };
    case "toggleAlignRight":
      return { ...state, paragraph: { align: "right" } };
    case "setStroke":
      return { ...state, stroke: action.payload };
    case "setColorFill":
      return {
        ...state,
        stroke: { ...state.stroke, fillColor: action.payload },
      };
    case "setColorStroke":
      return {
        ...state,
        stroke: { ...state.stroke, strokeColor: action.payload },
      };
    case "setStrokeWidth":
      return { ...state, stroke: { ...state.stroke, width: action.payload } };
    case "openPopover":
      return { ...state, popoverOpen: action.payload };
    case "closePopover":
      if (state.popoverOpen === action.payload) {
        return { ...state, popoverOpen: null };
      }
      return state;
    default:
      return state;
  }
}

const FormatsContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const FormatsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <FormatsContext.Provider value={{ state, dispatch }}>
      {children}
    </FormatsContext.Provider>
  );
};

export function useFormats() {
  const context = useContext(FormatsContext);
  if (!context) {
    throw new Error("useFormats must be used within a FormatsProvider");
  }
  const { state, dispatch } = context;

  const onTextSelect = useCallback(
    (text: IText) => {
      dispatch({
        type: "selectFormats",
        payload: {
          format: {
            isBold: text.fontWeight === "bold",
            isItalic: text.fontStyle === "italic",
            isUnderlined: text.underline,
          },
          font: {
            size: text.fontSize,
          },
          paragraph: {
            align: text.textAlign as ParagraphStyles["align"],
          },
          stroke: {
            fillColor: text.fill as string,
            strokeColor: text.stroke as string,
            width: text.strokeWidth,
          },
        },
      });
    },
    [dispatch],
  );

  const onFormatChange = useCallback(
    (format: FormatStyles) => {
      dispatch({ type: "setFormat", payload: format });
    },
    [dispatch],
  );

  const onParagraphChange = useCallback(
    (paragraph: ParagraphStyles) => {
      dispatch({ type: "setParagraph", payload: paragraph });
    },
    [dispatch],
  );

  const onFontChange = useCallback(
    (font: FontStyles) => {
      dispatch({ type: "setFont", payload: font });
    },
    [dispatch],
  );

  const onStrokeChange = useCallback(
    (stroke: StrokeStyles) => {
      dispatch({ type: "setStroke", payload: stroke });
    },
    [dispatch],
  );

  const openPopover = useCallback(
    (popover: State["popoverOpen"]) => {
      dispatch({ type: "openPopover", payload: popover });
    },
    [dispatch],
  );

  const closePopover = useCallback(
    (popover: State["popoverOpen"]) => {
      dispatch({ type: "closePopover", payload: popover });
    },
    [dispatch],
  );

  const onFontSizeChange = useCallback(
    (size: number) => {
      dispatch({ type: "setFontSize", payload: size });
    },
    [dispatch],
  );

  const toggleBold = useCallback(() => {
    dispatch({ type: "toggleBold" });
  }, [dispatch]);

  const toggleItalic = useCallback(() => {
    dispatch({ type: "toggleItalic" });
  }, [dispatch]);

  const toggleUnderline = useCallback(() => {
    dispatch({ type: "toggleUnderline" });
  }, [dispatch]);

  const toggleAlignLeft = useCallback(() => {
    dispatch({ type: "toggleAlignLeft" });
  }, [dispatch]);

  const toggleAlignCenter = useCallback(() => {
    dispatch({ type: "toggleAlignCenter" });
  }, [dispatch]);

  const toggleAlignRight = useCallback(() => {
    dispatch({ type: "toggleAlignRight" });
  }, [dispatch]);

  const onColorFill = useCallback(
    (color: string) => {
      dispatch({ type: "setColorFill", payload: color });
    },
    [dispatch],
  );

  const onColorStroke = useCallback(
    (color: string) => {
      dispatch({ type: "setColorStroke", payload: color });
    },
    [dispatch],
  );

  const onStrokeWidthChange = useCallback(
    (width: number) => {
      dispatch({ type: "setStrokeWidth", payload: width });
    },
    [dispatch],
  );

  return {
    ...state,
    onTextSelect,
    onFormatChange,
    onParagraphChange,
    onFontChange,
    onStrokeChange,
    openPopover,
    closePopover,
    onFontSizeChange,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleAlignLeft,
    toggleAlignCenter,
    toggleAlignRight,
    onColorFill,
    onColorStroke,
    onStrokeWidthChange,
  };
}

import React, { FC, useCallback, useReducer, useRef } from "react";
import type { FormatStyles } from "./FormatPopover";
import type { ParagraphStyles } from "./ParagraphPopover";
import type { FontStyles } from "./FontPopover";
import type { StrokeStyles } from "./StrokePopover";

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
  | { type: "closePopover"; payload: State["popoverOpen"] };

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
export function useFormats() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onFormatChange = useCallback((format: FormatStyles) => {
    dispatch({ type: "setFormat", payload: format });
  }, []);

  const onParagraphChange = useCallback((paragraph: ParagraphStyles) => {
    dispatch({ type: "setParagraph", payload: paragraph });
  }, []);

  const onFontChange = useCallback((font: FontStyles) => {
    dispatch({ type: "setFont", payload: font });
  }, []);

  const onStrokeChange = useCallback((stroke: StrokeStyles) => {
    dispatch({ type: "setStroke", payload: stroke });
  }, []);

  const openPopover = useCallback((popover: State["popoverOpen"]) => {
    dispatch({ type: "openPopover", payload: popover });
  }, []);

  const closePopover = useCallback((popover: State["popoverOpen"]) => {
    dispatch({ type: "closePopover", payload: popover });
  }, []);

  const onFontSizeChange = useCallback((size: number) => {
    dispatch({ type: "setFontSize", payload: size });
  }, []);

  const toggleBold = useCallback(() => {
    dispatch({ type: "toggleBold" });
  }, []);

  const toggleItalic = useCallback(() => {
    dispatch({ type: "toggleItalic" });
  }, []);

  const toggleUnderline = useCallback(() => {
    dispatch({ type: "toggleUnderline" });
  }, []);

  const toggleAlignLeft = useCallback(() => {
    dispatch({ type: "toggleAlignLeft" });
  }, []);

  const toggleAlignCenter = useCallback(() => {
    dispatch({ type: "toggleAlignCenter" });
  }, []);

  const toggleAlignRight = useCallback(() => {
    dispatch({ type: "toggleAlignRight" });
  }, []);

  const onColorFill = useCallback((color: string) => {
    dispatch({ type: "setColorFill", payload: color });
  }, []);

  const onColorStroke = useCallback((color: string) => {
    dispatch({ type: "setColorStroke", payload: color });
  }, []);

  const onStrokeWidthChange = useCallback((width: number) => {
    dispatch({ type: "setStrokeWidth", payload: width });
  }, []);

  return {
    ...state,
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

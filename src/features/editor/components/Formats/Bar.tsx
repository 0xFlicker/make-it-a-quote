import React, { FC, useCallback, useReducer, useRef } from "react";
import { FormatStyles, FormatPopover } from "./FormatPopover";
import { ParagraphStyles, ParagraphPopover } from "./ParagraphPopover";
import { FontStyles, FontPopover } from "./FontPopover";
import { StrokeStyles, StrokePopover } from "./StrokePopover";
import { FormatBar } from "./FormatBar";

import Toolbar from "@mui/material/Toolbar";

type State = {
  font: FontStyles;
  paragraph: ParagraphStyles;
  stroke: StrokeStyles;
  format: FormatStyles;
  popoverOpen: "format" | "paragraph" | "font" | "stroke" | null;
};

type Action =
  | { type: "setFormat"; payload: FormatStyles }
  | { type: "setParagraph"; payload: ParagraphStyles }
  | { type: "setStroke"; payload: StrokeStyles }
  | { type: "setFont"; payload: FontStyles }
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
    case "setFormat":
      return { ...state, format: action.payload };
    case "setParagraph":
      return { ...state, paragraph: action.payload };
    case "setStroke":
      return { ...state, stroke: action.payload };
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

export const FormatsBar: FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fontButtonRef = useRef<HTMLButtonElement>(null);
  const paragraphStyleButtonRef = useRef<HTMLButtonElement>(null);
  const formatButtonRef = useRef<HTMLButtonElement>(null);
  const strokeButtonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <>
      <Toolbar>
        <FormatBar
          fontButtonRef={fontButtonRef}
          paragraphStyleButtonRef={paragraphStyleButtonRef}
          formatButtonRef={formatButtonRef}
          strokeButtonRef={strokeButtonRef}
          onFormatButtonClick={() => {
            dispatch({ type: "openPopover", payload: "format" });
          }}
          onParagraphStyleButtonClick={() => {
            dispatch({ type: "openPopover", payload: "paragraph" });
          }}
          onFontButtonClick={() => {
            dispatch({ type: "openPopover", payload: "font" });
          }}
          onStrokeButtonClick={() => {
            dispatch({ type: "openPopover", payload: "stroke" });
          }}
          onFontChange={onFontChange}
          onFormatChange={onFormatChange}
          onParagraphChange={onParagraphChange}
          onStrokeChange={onStrokeChange}
        />
      </Toolbar>
      <FormatPopover
        anchorEl={formatButtonRef.current}
        open={state.popoverOpen === "format"}
        onClose={() => {
          dispatch({ type: "closePopover", payload: "format" });
        }}
        onFormatChange={onFormatChange}
        initialFormat={state.format}
      />
      <ParagraphPopover
        anchorEl={paragraphStyleButtonRef.current}
        open={state.popoverOpen === "paragraph"}
        onClose={() => {
          dispatch({ type: "closePopover", payload: "paragraph" });
        }}
        onParagraphChange={onParagraphChange}
        initialParagraph={state.paragraph}
      />
      <FontPopover
        anchorEl={fontButtonRef.current}
        open={state.popoverOpen === "font"}
        onClose={() => {
          dispatch({ type: "closePopover", payload: "font" });
        }}
        onFontChange={onFontChange}
        initialFont={state.font}
      />
      <StrokePopover
        anchorEl={strokeButtonRef.current}
        open={state.popoverOpen === "stroke"}
        onClose={() => {
          dispatch({ type: "closePopover", payload: "stroke" });
        }}
        onStrokeChange={onStrokeChange}
        initialStroke={state.stroke}
      />
    </>
  );
};

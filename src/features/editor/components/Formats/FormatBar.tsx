import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import Toolbar from "@mui/material/Toolbar";
import { IText } from "fabric";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatAlignCenter from "@mui/icons-material/FormatAlignCenter";
import FormatAlignLeft from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRight from "@mui/icons-material/FormatAlignRight";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormatColorTextOutlined from "@mui/icons-material/FormatColorTextOutlined";
import FormatColorFill from "@mui/icons-material/FormatColorFill";
import FormatLineSpacing from "@mui/icons-material/FormatLineSpacing";
import { FormatPopover } from "./FormatPopover";
import { ParagraphPopover } from "./ParagraphPopover";
import { FontPopover } from "./FontPopover";
import { StrokePopover } from "./StrokePopover";
import { useFormats } from "./useFormats";
import { useTheme } from "@mui/material/styles";
import { ColorPicker } from "./ColorPickerPopover";
import { Icon } from "@mui/material";
import { CanvasWithSafeArea } from "../../helpers/CanvasWithSafeArea";
import { toCssColor } from "@/utils/colors";
import { ZOrderButtonGroup } from "../ZOrderButtnGroup";

const activeButtonStyle = {
  backgroundColor: "#555555", // Light gray background for active state
};

export const FormatBar: FC<{
  fabricCanvas: CanvasWithSafeArea | null;
}> = ({ fabricCanvas }) => {
  const fontButtonRef = useRef<HTMLButtonElement>(null);
  const paragraphStyleButtonRef = useRef<HTMLButtonElement>(null);
  const formatButtonRef = useRef<HTMLButtonElement>(null);
  const strokeButtonRef = useRef<HTMLButtonElement>(null);
  const fillColorButtonRef = useRef<HTMLButtonElement>(null);
  const strokeColorButtonRef = useRef<HTMLButtonElement>(null);
  const {
    format,
    paragraph,
    stroke,
    font,
    popoverOpen,
    onFontChange,
    onFormatChange,
    onParagraphChange,
    onStrokeChange,
    onColorFill,
    onColorStroke,
    onStrokeWidthChange,
    closePopover,
    openPopover,
    toggleAlignLeft,
    toggleAlignCenter,
    toggleAlignRight,
    toggleBold,
    toggleItalic,
    toggleUnderline,
  } = useFormats();

  useEffect(() => {
    if (fabricCanvas) {
      // get current selection
      const activeObject = fabricCanvas.getActiveObject();
      console.log(activeObject);
      if (!activeObject) {
        return;
      }
      if (activeObject.type == "i-text") {
        const text = activeObject as IText;
        if (text.fill !== stroke.fillColor) {
          text.set("fill", stroke.fillColor);
          fabricCanvas.renderAll();
        }
        if (text.stroke !== stroke.strokeColor) {
          text.set("stroke", stroke.strokeColor);
          fabricCanvas.renderAll();
        }
        if (text.strokeWidth !== stroke.width) {
          text.set("strokeWidth", stroke.width);
          fabricCanvas.renderAll();
        }
      }
    }
  }, [fabricCanvas, stroke.strokeColor, stroke.fillColor, stroke.width]);

  const theme = useTheme();

  const styles = useMemo(
    () => ({
      buttonGroup: {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
      },
      button: {
        color: theme.palette.text.primary,
      },
      desktop: {
        display: "none",
        [theme.breakpoints.up("md")]: {
          display: "flex",
        },
      },
      mobile: {
        display: "flex",
        [theme.breakpoints.up("md")]: {
          display: "none",
        },
      },
    }),
    [theme],
  );

  return (
    <>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
          sx={{ ...styles.buttonGroup, ...styles.desktop }}
        >
          <IconButton
            onClick={toggleAlignLeft}
            style={paragraph.align === "left" ? activeButtonStyle : {}}
          >
            <FormatAlignLeft />
          </IconButton>
          <IconButton
            onClick={toggleAlignCenter}
            style={paragraph.align === "center" ? activeButtonStyle : {}}
          >
            <FormatAlignCenter />
          </IconButton>
          <IconButton
            onClick={toggleAlignRight}
            style={paragraph.align === "right" ? activeButtonStyle : {}}
          >
            <FormatAlignRight />
          </IconButton>
        </ButtonGroup>
        <Box sx={{ flexGrow: 1, ...styles.desktop }} />
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
          sx={{ ...styles.buttonGroup, ...styles.desktop }}
        >
          <IconButton ref={formatButtonRef} onClick={toggleBold}>
            <FormatBoldIcon />
          </IconButton>
          <IconButton ref={formatButtonRef} onClick={toggleItalic}>
            <FormatItalicIcon />
          </IconButton>
          <IconButton ref={formatButtonRef} onClick={toggleUnderline}>
            <FormatUnderlinedIcon />
          </IconButton>
        </ButtonGroup>
        <Box sx={{ flexGrow: 1, ...styles.desktop }} />
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
          sx={{ ...styles.buttonGroup, ...styles.desktop }}
        >
          <FormControl size="small">
            <InputLabel id="select-outline-label">Outline</InputLabel>
            <Select
              labelId="select-outline-label"
              id="select-outline"
              value={stroke.width}
              onChange={(e) => onStrokeWidthChange(e.target.value as number)}
            >
              <MenuItem value={0}>0 px</MenuItem>
              <MenuItem value={1}>1 px</MenuItem>
              <MenuItem value={2}>2 px</MenuItem>
              <MenuItem value={3}>3 px</MenuItem>
              <MenuItem value={4}>4 px</MenuItem>
              <MenuItem value={5}>5 px</MenuItem>
            </Select>
          </FormControl>
          <IconButton
            ref={fillColorButtonRef}
            onClick={() => openPopover("fillColor")}
          >
            <FormatColorFill />
          </IconButton>
          <IconButton
            ref={strokeColorButtonRef}
            onClick={() => openPopover("strokeColor")}
          >
            <FormatColorTextOutlined />
          </IconButton>
        </ButtonGroup>
        <Box sx={{ flexGrow: 1, ...styles.desktop }} />
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
          sx={{ ...styles.buttonGroup, ...styles.mobile }}
        >
          <IconButton
            ref={formatButtonRef}
            onClick={() => openPopover("format")}
          >
            <FormatBoldIcon />
          </IconButton>

          <IconButton
            ref={paragraphStyleButtonRef}
            onClick={() => openPopover("paragraph")}
          >
            <FormatLineSpacing />
          </IconButton>
          <IconButton ref={fontButtonRef} onClick={() => openPopover("font")}>
            <FormatColorTextOutlined />
          </IconButton>
          <IconButton
            ref={strokeButtonRef}
            onClick={() => openPopover("stroke")}
          >
            <FormatColorFill />
          </IconButton>
        </ButtonGroup>
        <Box sx={{ flexGrow: 1 }} />
        <ZOrderButtonGroup fabricCanvas={fabricCanvas} />
      </Toolbar>

      <FormatPopover
        anchorEl={formatButtonRef.current}
        open={popoverOpen === "format"}
        onClose={() => {
          closePopover("format");
        }}
        onFormatChange={onFormatChange}
        initialFormat={format}
      />
      <ParagraphPopover
        anchorEl={paragraphStyleButtonRef.current}
        open={popoverOpen === "paragraph"}
        onClose={() => {
          closePopover("paragraph");
        }}
        onParagraphChange={onParagraphChange}
        initialParagraph={paragraph}
      />
      <FontPopover
        anchorEl={fontButtonRef.current}
        open={popoverOpen === "font"}
        onClose={() => {
          closePopover("font");
        }}
        onFontChange={onFontChange}
        initialFont={font}
      />
      <StrokePopover
        anchorEl={strokeButtonRef.current}
        open={popoverOpen === "stroke"}
        onClose={() => {
          closePopover("stroke");
        }}
        onStrokeChange={onStrokeChange}
        initialStroke={stroke}
      />
      <ColorPicker
        anchorEl={fillColorButtonRef?.current}
        open={popoverOpen === "fillColor"}
        onClose={() => {
          closePopover("fillColor");
        }}
        onColorChange={(color) => {
          console.log(`fill color: ${toCssColor(color)}`);
          onColorFill(toCssColor(color));
        }}
        initialColor={stroke.fillColor}
      />
      <ColorPicker
        anchorEl={strokeColorButtonRef?.current}
        open={popoverOpen === "strokeColor"}
        onClose={() => {
          closePopover("strokeColor");
        }}
        onColorChange={(color) => onColorStroke(toCssColor(color))}
        initialColor={stroke.strokeColor}
      />
    </>
  );
};

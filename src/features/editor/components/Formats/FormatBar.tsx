import React, { FC, useCallback, useMemo, useReducer, useRef } from "react";
import Toolbar from "@mui/material/Toolbar";
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

const activeButtonStyle = {
  backgroundColor: "#555555", // Light gray background for active state
};

export const FormatBar: FC<{}> = ({}) => {
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
              <MenuItem value={1}>1 px</MenuItem>
              <MenuItem value={2}>2 px</MenuItem>
              <MenuItem value={3}>3 px</MenuItem>
              <MenuItem value={4}>4 px</MenuItem>
              <MenuItem value={5}>5 px</MenuItem>
            </Select>
          </FormControl>
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
        onColorChange={(color) => onColorFill(color.toString())}
        initialColor={stroke.fillColor}
      />
      <ColorPicker
        anchorEl={strokeColorButtonRef?.current}
        open={popoverOpen === "strokeColor"}
        onClose={() => {
          closePopover("strokeColor");
        }}
        onColorChange={(color) => onColorStroke(color.toString())}
        initialColor={stroke.strokeColor}
      />
    </>
  );
};

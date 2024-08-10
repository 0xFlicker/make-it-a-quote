import React, { FC, useCallback, useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Popover from "@mui/material/Popover";
import HamburgerIcon from "@mui/icons-material/Menu";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import Slider from "@mui/material/Slider";
import { Color, PhotoshopPicker } from "react-color";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { styled } from "@mui/material";

export type StrokeStyles = {
  fillColor: string;
  strokeColor: string;
  width: number;
};

const activeButtonStyle = {
  backgroundColor: "#555555", // Light gray background for active state
};

export const StrokePopover: FC<{
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onStrokeChange: (fontStyles: StrokeStyles) => void;
  initialStroke?: StrokeStyles;
}> = ({ anchorEl, open, onClose, onStrokeChange, initialStroke }) => {
  const [fillColor, setFillColor] = useState(
    initialStroke?.fillColor ?? "#000000",
  );
  const [strokeColor, setStrokeColor] = useState(
    initialStroke?.strokeColor ?? "#FFFFFF",
  );
  const [width, setWidth] = useState(initialStroke?.width ?? 1);

  const [colorMode, setColorMode] = useState<"fill" | "stroke">("fill");

  const onColorModeToFill = useCallback(() => {
    setColorMode("fill");
  }, []);
  const onColorModeToStroke = useCallback(() => {
    setColorMode("stroke");
  }, []);
  const onColorPicked = useCallback(
    (color: Color) => {
      if (colorMode === "fill") {
        setFillColor(color.toString());
        onStrokeChange({ fillColor: color.toString(), strokeColor, width });
      } else {
        setStrokeColor(color.toString());
        onStrokeChange({ fillColor, strokeColor: color.toString(), width });
      }
    },
    [colorMode, onStrokeChange, fillColor, strokeColor, width],
  );
  const onStrokeWidthChanged = useCallback(
    (value: number) => {
      setWidth(value);
      onStrokeChange({ fillColor, strokeColor, width: value });
    },
    [onStrokeChange, fillColor, strokeColor],
  );

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Container
        sx={{
          marginY: 4,
        }}
      >
        <Box display="flex" justifyContent="space-around">
          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
          >
            <Button
              style={colorMode === "fill" ? activeButtonStyle : {}}
              startIcon={<CircleOutlinedIcon />}
              onClick={onColorModeToFill}
            >
              Fill
            </Button>
            <Button
              style={colorMode === "stroke" ? activeButtonStyle : {}}
              startIcon={<FormatPaintIcon />}
              onClick={onColorModeToStroke}
            >
              Stroke
            </Button>
          </ButtonGroup>
          <PhotoshopPicker
            color={colorMode === "fill" ? fillColor : strokeColor}
            onChange={({ hex }) => {
              onColorPicked(hex);
            }}
          />
          <Slider
            value={width}
            onChange={(_, value) => {
              onStrokeWidthChanged(value as number);
            }}
            min={1}
            max={20}
            step={1}
          />
        </Box>
      </Container>
    </Popover>
  );
};

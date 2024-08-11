import React, { FC } from "react";
import { ChromePicker, Color, RGBColor } from "react-color";
import Popover from "@mui/material/Popover";

export const ColorPicker: FC<{
  onColorChange: (color: RGBColor) => void;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  initialColor?: string;
}> = ({ onColorChange, open, onClose, anchorEl, initialColor }) => {
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
      sx={{ top: 64 }}
    >
      <ChromePicker
        color={initialColor}
        disableAlpha={false}
        onChange={(color) => onColorChange(color.rgb)}
      />
    </Popover>
  );
};

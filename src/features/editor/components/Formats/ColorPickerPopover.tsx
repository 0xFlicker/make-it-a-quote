import React, { FC } from "react";
import { PhotoshopPicker } from "react-color";
import Popover from "@mui/material/Popover";

export const ColorPicker: FC<{
  onColorChange: (color: string) => void;
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
    >
      <PhotoshopPicker
        color={initialColor}
        onChange={(color) => onColorChange(color.hex)}
      />
    </Popover>
  );
};

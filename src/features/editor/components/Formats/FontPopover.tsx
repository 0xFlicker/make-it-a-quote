import React, { FC, useCallback, useState } from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import Popover from "@mui/material/Popover";
import PlusIcon from "@mui/icons-material/Add";
import MinusIcon from "@mui/icons-material/Remove";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import { styled } from "@mui/material";

export type FontStyles = {
  size: number;
};

export const FontPopover: FC<{
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onFontChange: (fontStyles: FontStyles) => void;
  initialFont?: FontStyles;
}> = ({ anchorEl, open, onClose, onFontChange, initialFont }) => {
  const [fontSize, setFontSize] = useState(initialFont?.size ?? 16);

  const onFontIncrement = useCallback(() => {
    setFontSize((prev) => prev + 1);
    onFontChange({ size: fontSize + 1 });
  }, [fontSize, onFontChange]);

  const onFontDecrement = useCallback(() => {
    setFontSize((prev) => prev - 1);
    onFontChange({ size: fontSize - 1 });
  }, [fontSize, onFontChange]);

  const onFontChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value);
      setFontSize(value);
      onFontChange({ size: value });
    },
    [onFontChange],
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
            <IconButton onClick={onFontDecrement}>
              <MinusIcon />
            </IconButton>
            <Input
              value={fontSize}
              onChange={onFontChanged}
              type="number"
              inputProps={{ min: 1 }}
            />
            <IconButton onClick={onFontIncrement}>
              <PlusIcon />
            </IconButton>
          </ButtonGroup>
        </Box>
      </Container>
    </Popover>
  );
};

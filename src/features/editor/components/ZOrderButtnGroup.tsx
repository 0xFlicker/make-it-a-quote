import React, { FC, useCallback, useMemo } from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import PlusIcon from "@mui/icons-material/Add";
import MinusIcon from "@mui/icons-material/Remove";
import { useTheme } from "@mui/material";
import { CanvasWithSafeArea } from "../helpers/CanvasWithSafeArea";

interface ZOrderButtonGroupProps {
  fabricCanvas?: CanvasWithSafeArea | null;
}

export const ZOrderButtonGroup: FC<ZOrderButtonGroupProps> = ({
  fabricCanvas,
}) => {
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
    }),
    [theme],
  );

  const onIncreaseZOrder = useCallback(() => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (activeObject) {
      fabricCanvas?.bringObjectForward(activeObject);
    }
  }, [fabricCanvas]);

  const onDecreaseZOrder = useCallback(() => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (activeObject) {
      fabricCanvas?.sendObjectBackwards(activeObject);
    }
  }, [fabricCanvas]);

  return (
    <ButtonGroup
      variant="contained"
      aria-label="outlined primary button group"
      sx={{ ...styles.buttonGroup }}
    >
      <IconButton onClick={onIncreaseZOrder}>
        <PlusIcon />
      </IconButton>
      <IconButton onClick={onDecreaseZOrder}>
        <MinusIcon />
      </IconButton>
    </ButtonGroup>
  );
};

import React, { FC, useCallback, useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Popover from "@mui/material/Popover";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { styled } from "@mui/material";

export type FormatStyles = {
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
};

const ArrowBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: 0,
  height: 0,
  borderLeft: "10px solid transparent",
  borderRight: "10px solid transparent",
  borderTop: `10px solid ${theme.palette.background.paper}`,
  bottom: -10, // Position it outside at the bottom
}));

const activeButtonStyle = {
  backgroundColor: "#555555", // Light gray background for active state
};

const ParentContainer = styled(Container)({
  position: "relative",
  overflow: "visible", // Allow overflow
});

export const FormatPopover: FC<{
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onFormatChange: (fontStyles: FormatStyles) => void;
  initialFormat?: FormatStyles;
}> = ({ anchorEl, open, onClose, onFormatChange, initialFormat }) => {
  const [isBold, setIsBold] = useState(initialFormat?.isBold ?? false);
  const [isItalic, setIsItalic] = useState(initialFormat?.isItalic ?? false);
  const [isUnderlined, setIsUnderlined] = useState(
    initialFormat?.isUnderlined ?? false,
  );
  const onBoldClick = useCallback(() => {
    setIsBold((prev) => !prev);
    onFormatChange({ isBold: !isBold, isItalic, isUnderlined });
  }, [isBold, isItalic, isUnderlined, onFormatChange]);
  const onItalicClick = useCallback(() => {
    setIsItalic((prev) => !prev);
    onFormatChange({ isBold, isItalic: !isItalic, isUnderlined });
  }, [isBold, isItalic, isUnderlined, onFormatChange]);
  const onUnderlinedClick = useCallback(() => {
    setIsUnderlined((prev) => !prev);
    onFormatChange({ isBold, isItalic, isUnderlined: !isUnderlined });
  }, [isBold, isItalic, isUnderlined, onFormatChange]);
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
              style={isBold ? activeButtonStyle : {}}
              startIcon={<FormatBoldIcon />}
              onClick={onBoldClick}
            >
              Bold
            </Button>
            <Button
              style={isItalic ? activeButtonStyle : {}}
              startIcon={<FormatItalicIcon />}
              onClick={onItalicClick}
            >
              Italic
            </Button>
            <Button
              style={isUnderlined ? activeButtonStyle : {}}
              startIcon={<FormatUnderlinedIcon />}
              onClick={onUnderlinedClick}
            >
              Underline
            </Button>
          </ButtonGroup>
        </Box>
      </Container>
    </Popover>
  );
};

import React, { FC, useCallback, useState } from "react";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import Popover from "@mui/material/Popover";
import FormatAlignCenter from "@mui/icons-material/FormatAlignCenter";
import FormatAlignLeft from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRight from "@mui/icons-material/FormatAlignRight";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

export type ParagraphStyles = {
  align: "left" | "center" | "right";
};

const activeButtonStyle = {
  backgroundColor: "#555555", // Light gray background for active state
};

export const ParagraphPopover: FC<{
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onParagraphChange: (fontStyles: ParagraphStyles) => void;
  initialParagraph?: ParagraphStyles;
}> = ({ anchorEl, open, onClose, onParagraphChange, initialParagraph }) => {
  const [paragraphAlign, setParagraphAlign] = useState(
    initialParagraph?.align ?? "left",
  );

  const onAlignLeft = useCallback(() => {
    setParagraphAlign("left");
    onParagraphChange({ align: "left" });
  }, [onParagraphChange]);
  const onAlignCenter = useCallback(() => {
    setParagraphAlign("center");
    onParagraphChange({ align: "center" });
  }, [onParagraphChange]);
  const onAlignRight = useCallback(() => {
    setParagraphAlign("right");
    onParagraphChange({ align: "right" });
  }, [onParagraphChange]);

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
            <IconButton
              style={paragraphAlign === "left" ? activeButtonStyle : {}}
              onClick={onAlignLeft}
            >
              <FormatAlignLeft />
            </IconButton>
            <IconButton
              style={paragraphAlign === "center" ? activeButtonStyle : {}}
              onClick={onAlignCenter}
            >
              <FormatAlignCenter />
            </IconButton>
            <IconButton
              style={paragraphAlign === "right" ? activeButtonStyle : {}}
              onClick={onAlignRight}
            >
              <FormatAlignRight />
            </IconButton>
          </ButtonGroup>
        </Box>
      </Container>
    </Popover>
  );
};

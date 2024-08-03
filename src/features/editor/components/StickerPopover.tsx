import React, { FC, ReactNode, useMemo, useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import Popover from "@mui/material/Popover";
import Image from "next/image";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Container, Popper } from "@mui/material";

export type Cell = {
  readonly src: string;
  readonly label: string;
};

export const StickerPopover: FC<{
  onCellSelected: (src: string) => void;
  handleClose?: () => void;
  anchorEl: HTMLElement | null;
  open: boolean;
  cells: Cell[];
}> = ({ onCellSelected, handleClose, anchorEl, open, cells }) => {
  const icons = useMemo(() => {
    const iconMap = new Map<
      string,
      {
        src: string;
        node: ReactNode;
        label: string;
      }
    >();
    for (const icon of cells) {
      if (!iconMap.has(icon.src)) {
        iconMap.set(icon.src, {
          src: icon.src,
          node: (
            <Image src={icon.src} width={64} height={64} alt={icon.label} />
          ),
          label: icon.label,
        });
      }
    }
    return Array.from(iconMap.values());
  }, [cells]);
  return (
    <>
      <Popper open={open} anchorEl={anchorEl} placement="top">
        <ArrowDropDownIcon
          color="primary"
          sx={{ transform: "rotate(0deg) translateY(20px)" }}
        />
      </Popper>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        slotProps={{
          paper: { sx: { transform: "translateY(-200px)" } },
        }}
      >
        <Container
          sx={{
            my: 2,
          }}
        >
          <Grid2 container spacing={1}>
            {icons.map(({ label, node, src }) => (
              <Grid2 xs={4} key={label}>
                <div
                  onClick={() => {
                    onCellSelected(src);
                    handleClose?.();
                  }}
                >
                  {node}
                </div>
              </Grid2>
            ))}
          </Grid2>
        </Container>
      </Popover>
    </>
  );
};

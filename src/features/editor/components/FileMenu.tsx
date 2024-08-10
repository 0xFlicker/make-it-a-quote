import React, { FC, useState } from "react";
import HamburgerIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import UploadIcon from "@mui/icons-material/Upload";

import { styled } from "@mui/material/styles";

const StyledHamburgerIcon = styled(HamburgerIcon)({
  cursor: "pointer",
});

export const FileMenu: FC<{
  onImport: () => void;
}> = ({ onImport }) => {
  const [anchorEl, setAnchorEl] = useState<null | SVGElement>(null);

  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StyledHamburgerIcon onClick={handleClick} />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        component="nav"
      >
        <Paper sx={{ width: 320, maxWidth: "100%" }}>
          <MenuItem
            onClick={() => {
              handleClose();
              onImport();
            }}
          >
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText>Import</ListItemText>
          </MenuItem>
        </Paper>
      </Menu>
    </>
  );
};

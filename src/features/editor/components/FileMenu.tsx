import React, { FC, useEffect, useState } from "react";
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
  onImportEmbed: (embed: string) => void;
  onImportParentPfp: (parentPfp: string) => void;
  embeds?: string[];
  parentPfp?: string;
}> = ({ onImport, onImportEmbed, onImportParentPfp, embeds, parentPfp }) => {
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
          {embeds && embeds.length > 0 && (
            <>
              {embeds.map((embed) => (
                <MenuItem
                  key={embed}
                  onClick={() => {
                    handleClose();
                    onImportEmbed(embed);
                  }}
                >
                  <ListItemText>Import embed</ListItemText>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={embed}
                    alt="embed preview"
                    style={{ width: 50, height: 50, marginRight: 8 }}
                  />
                </MenuItem>
              ))}
            </>
          )}
          {parentPfp && (
            <MenuItem
              onClick={() => {
                handleClose();
                onImportParentPfp(parentPfp);
              }}
            >
              <ListItemText>Import pfp from parent cast</ListItemText>
            </MenuItem>
          )}
        </Paper>
      </Menu>
    </>
  );
};

import AddIcon from "@mui/icons-material/Add";
import { colors, Divider, ListItemText, MenuItem } from "@mui/material";
import React from "react";
interface AddProposalDialogButtonProps {
  toggleDialog: () => void;
}
export default function AddProposalDialogButton({
  toggleDialog,
}: AddProposalDialogButtonProps) {
  return (
    <MenuItem
      onClick={toggleDialog}
      sx={{
        height: 60,
        borderBottom: colors.grey[300] + " 1px solid",
      }}
    >
      <ListItemText>Add Proposal</ListItemText>
      <AddIcon />
      <Divider />
    </MenuItem>
  );
}

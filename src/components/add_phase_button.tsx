import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Divider,
  Fab,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@mui/material";
import React from "react";

interface AddPhaseButtonProps {
  toggleAddDialog: () => void;
}

export default function AddPhaseButton({
  toggleAddDialog,
}: AddPhaseButtonProps) {
  return (
    <Tooltip title={"Add new phase"}>
      <Fab
        variant="extended"
        color="primary"
        sx={{
          position: "absolute",
          bottom: "20px",
          zIndex: 1,
        }}
        onClick={toggleAddDialog}
      >
        Add Phase
        <AddIcon />
      </Fab>
    </Tooltip>
  );
}

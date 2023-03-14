import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import BottomPanel from "../../components/bottom_pannel";
import { auth, firestore } from "../../setup/config/firebase";
import AddActivityDialog from "../phase home/components/add_activity_dialog";

function ProposalSelectScreen() {
  return (
    <div style={{ height: "100%" }}>
      <Typography>Proposal Select</Typography>
      <Button onClick={() => auth.signOut()}>Logout</Button>
    </div>
  );
}

export default ProposalSelectScreen;

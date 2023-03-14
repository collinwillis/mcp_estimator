import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { insertProposal } from "../../../api/proposal";
import { useProposals } from "../../../hooks/proposals_hook";
import { Proposal } from "../../../models/proposal";

interface AddProposalDialogProps {
  open: boolean;
  toggleAddDialog: () => void;
}
export default function AddProposalDialog({
  open,
  toggleAddDialog,
}: AddProposalDialogProps) {
  const { data, loading } = useProposals();

  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalNumber, setProposalNumber] = useState("");

  useEffect(() => {
    if (data.length > 0) {
      const highestProposalNumber = data.reduce((prev, current) =>
        prev.proposalNumber! > current.proposalNumber! ? prev : current
      );
      setProposalNumber((highestProposalNumber.proposalNumber! + 1).toString());
    } else {
      setProposalNumber("1300");
    }
  }, [data, open]);

  const handleProposalCreate = async () => {
    await insertProposal(proposalDescription, proposalNumber);
    toggleAddDialog();
    setProposalDescription("");
    setProposalNumber("");
  };
  return (
    <div>
      <Dialog open={open} onClose={toggleAddDialog}>
        <DialogTitle>New Proposal</DialogTitle>
        <DialogContent sx={{ height: "200px", width: "300px" }}>
          <div
            style={{
              width: "100%",
              height: "95%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            <TextField
              variant="standard"
              label="Proposal Number"
              type={"number"}
              value={proposalNumber}
              onChange={(e) => setProposalNumber(e.target.value)}
              placeholder="Proposal Number"
            ></TextField>
            <TextField
              variant="standard"
              label="Proposal Description"
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder="Ex. Proposal"
            ></TextField>

            <Button
              disabled={
                proposalDescription.length === 0 || proposalNumber.length === 0
              }
              variant="contained"
              onClick={() => {
                if (
                  proposalDescription.length > 0 &&
                  proposalNumber.length > 0
                ) {
                  handleProposalCreate();
                }
              }}
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

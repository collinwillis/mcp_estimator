import { List, ListItem, ListItemText, colors } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useProposals } from "../../../hooks/proposals_hook";
import { Proposal } from "../../../models/proposal";

interface ProposalListProps {
  onClick: (proposal: Proposal) => void;
}
export default function ProposalList({ onClick }: ProposalListProps) {
  const {data, loading} = useProposals();
  const navigate = useNavigate();
  return (
          <List>
        {data.length > 0
        ? data.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => {
                onClick(item);
                navigate("/proposal/" + item.id);
              }}
              sx={{
                cursor: "pointer",
                ":hover": { backgroundColor: colors.blue[700], color: "white" },
              }}
            >
              <ListItemText
                primary={item.proposalNumber + " - " + item.proposalDescription}
              />
            </ListItem>
          ))
        : null}
    </List>
  );
}

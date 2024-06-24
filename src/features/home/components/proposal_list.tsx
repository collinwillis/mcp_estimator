import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';

import { useProposals } from '../../../hooks/proposals_hook';
import { Proposal } from '../../../models/proposal';

interface ProposalListProps {
  onClick: (proposal: Proposal) => void;
  proposals: Proposal[];
}

export default function ProposalList({
  onClick,
  proposals,
}: ProposalListProps) {
  const { data, loading } = useProposals();
  const navigate = useNavigate();

  return (
    <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}>
      {proposals.length > 0 ? (
        proposals.map((item) => (
          <ListItem
            key={item.id}
            onClick={() => {
              onClick(item);
              navigate(`/proposal/${item.id}`);
            }}
            sx={{
              'cursor': 'pointer',
              'transition': 'background-color 0.3s, color 0.3s',
              'padding': '16px',
              'borderBottom': '1px solid #e0e0e0',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}>
            <ListItemText
              primary={
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 'bold',
                  }}>
                  {`${item.proposalNumber} - ${item.proposalDescription}`}
                </Typography>
              }
              secondary={
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                  }}>
                  {item.proposalOwner}
                </Typography>
              }
            />
          </ListItem>
        ))
      ) : (
        <Box sx={{ p: 2 }}>
          <Typography variant='body1' color='text.secondary'>
            No proposals found.
          </Typography>
        </Box>
      )}
    </List>
  );
}

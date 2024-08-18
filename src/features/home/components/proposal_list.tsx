import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const listRef = useRef<HTMLUListElement>(null);
  const { proposalId, wbsId, phaseId } = useParams();

  useEffect(() => {
    const savedProposalId = sessionStorage.getItem('selectedProposalId');
    console.log('Retrieved from sessionStorage:', savedProposalId);

    if (savedProposalId && listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-proposal-id="${savedProposalId}"]`,
      );

      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [proposalId]);

  const handleProposalClick = (item: Proposal) => {
    console.log(item);
    sessionStorage.setItem('selectedProposalId', item.id!);
    onClick(item);
    navigate(`/proposal/${item.id}`);
  };
  const savedProposalId = sessionStorage.getItem('selectedProposalId');
  return (
    <List
      ref={listRef}
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
            data-proposal-id={item.id} // Assign a data attribute for easy selection
            onClick={() => handleProposalClick(item)}
            sx={{
              'cursor': 'pointer',
              'transition': 'background-color 0.3s, color 0.3s',
              'padding': '16px',
              'borderBottom': '1px solid #e0e0e0',
              'backgroundColor':
                savedProposalId === item.id ? '#f0f8ff' : 'inherit', // Slight background color if previously selected
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

import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  styled,
  useTheme,
  Tooltip,
} from '@mui/material';

import { Proposal } from '../../../models/proposal';

interface ProposalListProps {
  onClick: (proposal: Proposal) => void;
  proposals: Proposal[];
}

const StyledList = styled(List)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.default,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  'cursor': 'pointer',
  'transition': 'background-color 0.3s',
  'paddingTop': theme.spacing(0.75),
  'paddingBottom': theme.spacing(0.75),
  'paddingLeft': theme.spacing(2),
  'paddingRight': theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    'backgroundColor': theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

const ProposalList: React.FC<ProposalListProps> = ({ onClick, proposals }) => {
  const navigate = useNavigate();
  const listRef = useRef<HTMLUListElement>(null);
  const { proposalId } = useParams();
  const theme = useTheme();

  useEffect(() => {
    const savedProposalId = sessionStorage.getItem('selectedProposalId');

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
    sessionStorage.setItem('selectedProposalId', item.id!);
    onClick(item);
    navigate(`/proposal/${item.id}`);
  };

  const savedProposalId = sessionStorage.getItem('selectedProposalId');

  const sortedProposals = proposals.slice().sort((a, b) => {
    // Handle cases where proposalNumber might be undefined or empty
    if (!a.proposalNumber && !b.proposalNumber) return 0;
    if (!a.proposalNumber) return 1;
    if (!b.proposalNumber) return -1;
    
    // Extract numeric parts (including decimals) for comparison
    const numA = parseFloat(a.proposalNumber.toString());
    const numB = parseFloat(b.proposalNumber.toString());
    
    // If both are valid numbers, compare them
    if (!isNaN(numA) && !isNaN(numB)) {
      return numB - numA; // Sort descending
    }
    
    // Fallback to string comparison if numbers are invalid
    return b.proposalNumber.toString().localeCompare(a.proposalNumber.toString());
  });

  console.log(sortedProposals);

  return (
    <StyledList ref={listRef}>
      {sortedProposals.length > 0 ? (
        sortedProposals.map((item) => (
          <Tooltip
            key={item.id}
            title={
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {item.proposalNumber}
                </Typography>
                <Typography variant='body2'>
                  {item.proposalDescription}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Owner: {item.proposalOwner}
                </Typography>
              </Box>
            }
            placement='right'>
            <StyledListItem
              data-proposal-id={item.id}
              selected={savedProposalId === item.id}
              onClick={() => handleProposalClick(item)}>
              <ListItemText
                primary={
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color:
                        savedProposalId === item.id
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                    {item.proposalNumber}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ 
                      mt: 0.25,
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block'
                    }}>
                    {item.proposalDescription && item.proposalDescription.length > 25 
                      ? `${item.proposalDescription.substring(0, 25)}...` 
                      : item.proposalDescription}
                  </Typography>
                }
              />
            </StyledListItem>
          </Tooltip>
        ))
      ) : (
        <Box sx={{ p: 2 }}>
          <Typography variant='body1' color='text.secondary'>
            No proposals found.
          </Typography>
        </Box>
      )}
    </StyledList>
  );
};

export default ProposalList;

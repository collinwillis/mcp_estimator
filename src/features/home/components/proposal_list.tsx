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

  return (
    <StyledList ref={listRef}>
      {proposals.length > 0 ? (
        proposals.map((item) => (
          <Tooltip
            key={item.id}
            title={`${item.proposalNumber} - ${item.proposalDescription}`}
            placement='right'>
            <StyledListItem
              data-proposal-id={item.id}
              selected={savedProposalId === item.id}
              onClick={() => handleProposalClick(item)}>
              <ListItemText
                primary={
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontWeight: 500,
                      color:
                        savedProposalId === item.id
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                    }}>
                    {`${item.proposalNumber} - ${item.proposalDescription}`}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 0.5 }}>
                    {item.proposalOwner}
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

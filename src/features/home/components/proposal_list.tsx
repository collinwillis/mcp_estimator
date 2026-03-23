import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, List, Typography } from '@mui/material';

import { Proposal } from '../../../models/proposal';

interface ProposalListProps {
  onClick: (proposal: Proposal) => void;
  proposals: Proposal[];
}

const ProposalList: React.FC<ProposalListProps> = ({ onClick, proposals }) => {
  const navigate = useNavigate();
  const listRef = useRef<HTMLUListElement>(null);
  const { proposalId } = useParams();

  useEffect(() => {
    const savedProposalId = sessionStorage.getItem('selectedProposalId');
    if (savedProposalId && listRef.current) {
      const el = listRef.current.querySelector(`[data-proposal-id="${savedProposalId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [proposalId]);

  const handleClick = (item: Proposal) => {
    sessionStorage.setItem('selectedProposalId', item.id!);
    onClick(item);
    navigate(`/proposal/${item.id}`);
  };

  const savedProposalId = sessionStorage.getItem('selectedProposalId');

  const sorted = proposals.slice().sort((a, b) => {
    if (!a.proposalNumber && !b.proposalNumber) return 0;
    if (!a.proposalNumber) return 1;
    if (!b.proposalNumber) return -1;
    const numA = parseFloat(a.proposalNumber.toString());
    const numB = parseFloat(b.proposalNumber.toString());
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return b.proposalNumber.toString().localeCompare(a.proposalNumber.toString());
  });

  return (
    <List ref={listRef} disablePadding sx={{ px: 0.75 }}>
      {sorted.length > 0 ? (
        sorted.map((item) => {
          const isActive = savedProposalId === item.id;
          return (
            <Box
              key={item.id}
              data-proposal-id={item.id}
              onClick={() => handleClick(item)}
              sx={{
                'display': 'flex',
                'alignItems': 'center',
                'px': 1.25,
                'py': 0.6,
                'mx': 0.5,
                'my': 0.2,
                'cursor': 'pointer',
                'borderRadius': 1,
                'borderLeft': isActive ? '2px solid #111827' : '2px solid transparent',
                'backgroundColor': isActive ? '#f3f4f6' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? '#f3f4f6' : '#f9fafb',
                },
              }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#111827' : '#374151',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                  {item.proposalNumber}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                  {item.proposalDescription}
                </Typography>
              </Box>
            </Box>
          );
        })
      ) : (
        <Box sx={{ px: 2, py: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            No proposals found.
          </Typography>
        </Box>
      )}
    </List>
  );
};

export default ProposalList;

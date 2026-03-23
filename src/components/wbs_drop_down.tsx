import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';

import { StoreState, estimatorStore } from '../utils/store';

export default function WbsDropdown() {
  const { proposalId, wbsId } = useParams();
  const data = estimatorStore(
    (state: StoreState) => state.visibleWbs[proposalId!] || [],
  );
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 0.5,
        }}>
        WBS
      </Typography>
      <FormControl fullWidth size='small'>
        <Select
          value={wbsId || ''}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) return <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>Select WBS</Typography>;
            const wbs = data.find((w) => w.id === selected);
            return (
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {wbs ? `${wbs.wbsDatabaseId} ${wbs.name}` : selected}
              </Typography>
            );
          }}
          sx={{
            'borderRadius': 1,
            'backgroundColor': '#f3f4f6',
            'fontSize': '0.875rem',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9ca3af', borderWidth: 1 },
            '& .MuiSelect-select': { py: 0.75, px: 1.25 },
            '& .MuiSelect-icon': { color: '#6b7280', fontSize: 18 },
          }}>
          {[...data]
            .sort((a, b) => a.wbsDatabaseId! - b.wbsDatabaseId!)
            .map((item) => (
              <MenuItem
                key={item.id}
                value={item.id}
                onClick={() => navigate(`/proposal/${proposalId}/wbs/${item.id}`)}
                sx={{ py: 0.75, fontSize: '0.875rem' }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.wbsDatabaseId} {item.name}
                </Typography>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
}

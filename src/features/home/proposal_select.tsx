import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useProposals } from '../../hooks/proposals_hook';
import { Proposal, ProposalStatus } from '../../models/proposal';
import { format, addDays, isValid, parseISO, differenceInDays } from 'date-fns';

// Status config — single source of truth for colors and labels
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  [ProposalStatus.Bidding]: { label: 'Bidding', color: '#92400e', bg: '#fef3c7' },
  [ProposalStatus.Open]: { label: 'Open', color: '#1e40af', bg: '#dbeafe' },
  [ProposalStatus.Submitted]: { label: 'Submitted', color: '#1e3a5f', bg: '#e0e7ff' },
  [ProposalStatus.Awarded]: { label: 'Awarded', color: '#065f46', bg: '#d1fae5' },
  [ProposalStatus.Rejected]: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
  [ProposalStatus.Declined]: { label: 'Declined', color: '#6b7280', bg: '#f3f4f6' },
};

const getStatusConfig = (status?: ProposalStatus | string) => {
  if (!status) return { label: '\u2014', color: '#6b7280', bg: '#f3f4f6' };
  return STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
};

const ProposalOverviewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: proposals, loading } = useProposals();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!proposals) return { total: 0, pending: 0, submitted: 0, awarded: 0, rejected: 0, hitRate: 0 };
    const pending = proposals.filter((p) => p.proposalStatus === ProposalStatus.Bidding || p.proposalStatus === ProposalStatus.Open).length;
    const submitted = proposals.filter((p) => p.proposalStatus === ProposalStatus.Submitted).length;
    const awarded = proposals.filter((p) => p.proposalStatus === ProposalStatus.Awarded).length;
    const rejected = proposals.filter((p) => p.proposalStatus === ProposalStatus.Rejected || p.proposalStatus === ProposalStatus.Declined).length;
    const totalDecided = awarded + rejected;
    return {
      total: proposals.length,
      pending,
      submitted,
      awarded,
      rejected,
      hitRate: totalDecided > 0 ? parseFloat(((awarded / totalDecided) * 100).toFixed(1)) : 0,
    };
  }, [proposals]);

  // Status bar segments
  const segments = useMemo(() => {
    if (!stats.total) return [];
    const items = [
      { label: 'Pending', count: stats.pending, color: '#f59e0b' },
      { label: 'Submitted', count: stats.submitted, color: '#3b82f6' },
      { label: 'Awarded', count: stats.awarded, color: '#10b981' },
      { label: 'Rejected', count: stats.rejected, color: '#ef4444' },
    ];
    return items.filter((s) => s.count > 0).map((s) => ({ ...s, pct: (s.count / stats.total) * 100 }));
  }, [stats]);

  // Sorted + filtered proposals for the main table
  const displayProposals = useMemo(() => {
    if (!proposals) return [];
    let filtered = proposals.slice();
    if (activeFilter) {
      const filterStatuses: string[] = activeFilter === 'Pending'
        ? [ProposalStatus.Bidding, ProposalStatus.Open]
        : activeFilter === 'Rejected'
          ? [ProposalStatus.Rejected, ProposalStatus.Declined]
          : [activeFilter === 'Submitted' ? ProposalStatus.Submitted : ProposalStatus.Awarded];
      filtered = filtered.filter((p) => filterStatuses.includes(p.proposalStatus?.toString() || ''));
    }
    return filtered.sort((a, b) => (b.proposalNumber || 0) - (a.proposalNumber || 0)).slice(0, 50);
  }, [proposals, activeFilter]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={20} sx={{ color: '#9ca3af' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header + stats */}
      <Box sx={{ flexShrink: 0, px: { xs: 2, sm: 3 }, pt: 2.5, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
        {/* Stats row */}
        <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, mb: 2, flexWrap: 'wrap' }}>
          <StatInline label='Proposals' value={stats.total} />
          <StatInline label='In Progress' value={stats.pending} />
          <StatInline label='Submitted' value={stats.submitted} />
          <StatInline label='Awarded' value={stats.awarded} />
          <StatInline label='Hit Rate' value={`${stats.hitRate}%`} />
        </Box>

        {/* Status distribution bar */}
        {segments.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
              {segments.map((s) => (
                <Box
                  key={s.label}
                  onClick={() => setActiveFilter(activeFilter === s.label ? null : s.label)}
                  sx={{
                    width: `${s.pct}%`,
                    backgroundColor: s.color,
                    cursor: 'pointer',
                    opacity: activeFilter && activeFilter !== s.label ? 0.3 : 1,
                    transition: 'opacity 150ms',
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 0.75 }}>
              {segments.map((s) => (
                <Box
                  key={s.label}
                  onClick={() => setActiveFilter(activeFilter === s.label ? null : s.label)}
                  sx={{ 'display': 'flex', 'alignItems': 'center', 'gap': 0.5, 'cursor': 'pointer', 'opacity': activeFilter && activeFilter !== s.label ? 0.4 : 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.color }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {s.label} ({s.count})
                  </Typography>
                </Box>
              ))}
              {activeFilter && (
                <Typography
                  onClick={() => setActiveFilter(null)}
                  sx={{ 'fontSize': '0.75rem', 'color': '#9ca3af', 'cursor': 'pointer', 'ml': 'auto', '&:hover': { color: '#6b7280' } }}>
                  Clear filter
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Proposal table */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Table header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 160px 100px 80px',
            gap: 1,
            px: { xs: 2, sm: 3 },
            py: 0.75,
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            backgroundColor: '#f9fafb',
            zIndex: 1,
          }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>#</Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Owner</Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Due</Typography>
        </Box>

        {/* Table rows */}
        {displayProposals.map((p) => {
          const sc = getStatusConfig(p.proposalStatus);
          const dueDate = parseISO(p.proposalDateDue || '');
          const isOverdue = isValid(dueDate) && differenceInDays(dueDate, new Date()) < 0 && (p.proposalStatus === ProposalStatus.Bidding || p.proposalStatus === ProposalStatus.Open);
          const isDueSoon = isValid(dueDate) && differenceInDays(dueDate, new Date()) <= 7 && differenceInDays(dueDate, new Date()) >= 0 && (p.proposalStatus === ProposalStatus.Bidding);

          return (
            <Box
              key={p.id}
              onClick={() => navigate(`/proposal/${p.id}`)}
              sx={{
                'display': 'grid',
                'gridTemplateColumns': '80px 1fr 160px 100px 80px',
                'gap': 1,
                'px': { xs: 2, sm: 3 },
                'py': 0.75,
                'cursor': 'pointer',
                'borderBottom': '1px solid #f3f4f6',
                'alignItems': 'center',
                '&:hover': { backgroundColor: '#f9fafb' },
              }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                {p.proposalNumber}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 400, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.proposalDescription || '\u2014'}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.proposalOwner || '\u2014'}
              </Typography>
              <Chip
                label={sc.label}
                size='small'
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: sc.color,
                  backgroundColor: sc.bg,
                  border: 'none',
                  borderRadius: 0.75,
                  width: 'fit-content',
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'right',
                  color: isOverdue ? '#dc2626' : isDueSoon ? '#d97706' : '#9ca3af',
                  fontWeight: isOverdue || isDueSoon ? 600 : 400,
                }}>
                {isValid(dueDate) ? format(dueDate, 'MM/dd') : '\u2014'}
              </Typography>
            </Box>
          );
        })}

        {displayProposals.length === 0 && (
          <Box sx={{ px: 3, py: 4 }}>
            <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              No proposals found.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Inline stat — no cards, just label + value
function StatInline({ label, value }: { label: string; value: string | number }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default ProposalOverviewDashboard;

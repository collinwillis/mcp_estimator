import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import {
  Box,
  Button,
  Collapse,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import AddActivityDialog from '../features/phase home/components/add_activity_dialog';
import AddEquipmentDialog from '../features/phase home/components/add_equipment_dialog';
import { useUserProfile } from '../hooks/user_profile_hook';
import { Activity, ActivityType } from '../models/activity';
import { FirestoreActivity } from '../models/firestore models/activity_firestore';
import { Phase } from '../models/phase';
import { Wbs } from '../models/wbs';
import { StoreState, estimatorStore } from '../utils/store';
import AddPhaseDialog from './add_phase_dialog';

// ---------------------------------------------------------------------------
//  Constants & formatting
// ---------------------------------------------------------------------------

const INDIRECT_WBS_IDS = new Set([10000, 190000, 200000, 180000]);

const fmt = (value: number, prefix = ''): string =>
  prefix +
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Monochrome palette — one neutral, two subtle accents for semantic distinction
const COLOR = {
  label: '#6b7280',       // gray-500
  value: '#111827',       // gray-900
  sectionHead: '#374151', // gray-700
  muted: '#9ca3af',       // gray-400
  border: '#e5e7eb',      // gray-200
  surface: '#f9fafb',     // gray-50
  white: '#ffffff',
  accent: '#2563eb',      // blue-600 (primary accent, used sparingly)
} as const;

// ---------------------------------------------------------------------------
//  Inline metric for status bar
// ---------------------------------------------------------------------------

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6, px: { xs: 0.75, sm: 1.25 }, whiteSpace: 'nowrap' }}>
      <Typography sx={{ color: COLOR.label, fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ color: COLOR.value, fontWeight: 600, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
//  Breakdown detail row — pure typography, no icons
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
//  Mini table — Stripe-style detail panel
// ---------------------------------------------------------------------------

interface MiniTableRow {
  label: string;
  value: string;
}

function MiniTable({ title, rows, footer }: { title: string; rows: MiniTableRow[]; footer?: MiniTableRow }) {
  return (
    <Box
      sx={{
        border: `1px solid ${COLOR.border}`,
        borderRadius: 1.5,
        overflow: 'hidden',
      }}>
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          backgroundColor: '#f9fafb',
          borderBottom: `1px solid ${COLOR.border}`,
        }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
      </Box>
      {/* Rows */}
      {rows.map((row, i) => (
        <Box
          key={row.label}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1.5,
            py: 0.35,
            backgroundColor: i % 2 === 1 ? '#f9fafb' : 'transparent',
          }}>
          <Typography sx={{ fontSize: '0.8rem', color: COLOR.label }}>
            {row.label}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: COLOR.value, fontVariantNumeric: 'tabular-nums' }}>
            {row.value}
          </Typography>
        </Box>
      ))}
      {/* Optional footer/total row */}
      {footer && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1.5,
            py: 0.4,
            borderTop: `1px solid ${COLOR.border}`,
            backgroundColor: '#f9fafb',
          }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLOR.sectionHead }}>
            {footer.label}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: COLOR.value, fontVariantNumeric: 'tabular-nums' }}>
            {footer.value}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
//  Main component
// ---------------------------------------------------------------------------

function BottomPanel() {
  const { proposalId, wbsId, phaseId } = useParams();

  const [detailsOpen, setDetailsOpen] = useState(() => {
    return localStorage.getItem('bottomPanelDetailsOpen') === 'true';
  });

  const toggleDetails = useCallback(() => {
    setDetailsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('bottomPanelDetailsOpen', String(next));
      return next;
    });
  }, []);

  const activities = estimatorStore((s: StoreState) => s.activities[proposalId!] || []);
  const phases = estimatorStore((s: StoreState) => s.phases[proposalId!] || []);
  const allWbsItems = estimatorStore((s: StoreState) => s.wbs[proposalId!] || []);
  const visibleWbsItems = estimatorStore((s: StoreState) => s.visibleWbs[proposalId!] || []);

  // Set of visible WBS IDs for filtering
  const visibleWbsIds = useMemo(() => {
    const set = new Set<string>();
    visibleWbsItems.forEach((w) => { if (w.id) set.add(w.id); });
    return set;
  }, [visibleWbsItems]);

  // WBS database ID lookup (needs ALL wbs for phase/activity-level views)
  const wbsLookup = useMemo(() => {
    const map = new Map<string, number>();
    allWbsItems.forEach((w) => {
      if (w.id && w.wbsDatabaseId !== undefined) map.set(w.id, w.wbsDatabaseId);
    });
    return map;
  }, [allWbsItems]);

  // At proposal level, only include data from VISIBLE WBS items
  // At WBS/Phase level, show scoped data as before
  const dataset = useMemo<(Activity | Phase | Wbs)[]>(() => {
    if (phaseId) return activities.filter((item) => item.phaseId === phaseId);
    if (wbsId) return phases.filter((item) => item.wbsId === wbsId);
    return visibleWbsItems;
  }, [activities, phases, visibleWbsItems, wbsId, phaseId]);

  // Detect hidden WBS items that contain non-zero data
  const hasHiddenData = useMemo(() => {
    if (wbsId || phaseId) return false; // Only relevant at proposal level
    const hiddenWbs = allWbsItems.filter((w) => w.id && !visibleWbsIds.has(w.id));
    return hiddenWbs.some((w) => (w.totalCost || 0) > 0 || (w.craftManHours || 0) > 0 || (w.welderManHours || 0) > 0);
  }, [allWbsItems, visibleWbsIds, wbsId, phaseId]);

  // ---------------------------------------------------------------------------
  //  Compute totals
  // ---------------------------------------------------------------------------

  const totals = useMemo(() => {
    let totalCost = 0, directCraftHours = 0, directWelderHours = 0;
    let mobeHours = 0, demobeHours = 0, supportHours = 0, specialtyHours = 0;
    let subcontractorHours = 0, craftCost = 0, welderCost = 0;
    let subcontractorCost = 0, equipmentCost = 0, materialCost = 0, costOnlyCost = 0;

    dataset.forEach((record) => {
      const base = record as Activity;
      totalCost += base.totalCost || 0;
      craftCost += base.craftCost || 0;
      welderCost += base.welderCost || 0;
      subcontractorCost += base.subContractorCost || 0;
      equipmentCost += base.equipmentCost || 0;
      materialCost += base.materialCost || 0;
      costOnlyCost += base.costOnlyCost || 0;

      if (base.activityType === ActivityType.subContractorItem) {
        subcontractorHours += (Number(base.quantity) || 0) * (Number(base.time) || 0);
      }

      const hours = (base.craftManHours || 0) + (base.welderManHours || 0);
      const wbsDbId = base.wbsId ? wbsLookup.get(base.wbsId) : undefined;
      const effectiveWbsDbId = wbsDbId ?? (record as Wbs).wbsDatabaseId ?? undefined;

      if (effectiveWbsDbId !== undefined && INDIRECT_WBS_IDS.has(effectiveWbsDbId)) {
        switch (effectiveWbsDbId) {
          case 10000: mobeHours += hours; break;
          case 190000: demobeHours += hours; break;
          case 200000: supportHours += hours; break;
          case 180000: specialtyHours += hours; break;
        }
      } else {
        directCraftHours += base.craftManHours || 0;
        directWelderHours += base.welderManHours || 0;
      }
    });

    const indirectHours = mobeHours + demobeHours + supportHours + specialtyHours;
    const directHours = directCraftHours + directWelderHours;
    const fix = (n: number) => Number(n.toFixed(2));

    return {
      totalCost: fix(totalCost), totalHours: fix(directHours + indirectHours),
      directHours: fix(directHours), directCraftHours: fix(directCraftHours),
      directWelderHours: fix(directWelderHours), indirectHours: fix(indirectHours),
      mobeHours: fix(mobeHours), demobeHours: fix(demobeHours),
      supportHours: fix(supportHours), specialtyHours: fix(specialtyHours),
      subcontractorHours: fix(subcontractorHours), craftCost: fix(craftCost),
      welderCost: fix(welderCost), subcontractorCost: fix(subcontractorCost),
      equipmentCost: fix(equipmentCost), materialCost: fix(materialCost),
      costOnlyCost: fix(costOnlyCost),
    };
  }, [dataset, wbsLookup]);

  // ---------------------------------------------------------------------------
  //  Quick Actions
  // ---------------------------------------------------------------------------

  const { hasWritePermissions } = useUserProfile();
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);
  const [openAddActivityDialog, setOpenAddActivityDialog] = useState(false);
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = useState(false);

  const addActivities = estimatorStore((s: StoreState) => s.addActivities);
  const recalculatePhase = estimatorStore((s: StoreState) => s.recalculatePhase);

  const createActivity = useCallback(
    async (payload: Partial<FirestoreActivity>) => {
      if (!phaseId) return;
      const { activityType, ...rest } = payload;
      const activity = new FirestoreActivity({
        proposalId, wbsId, phaseId,
        constant: null, equipment: null,
        craftConstant: 0, welderConstant: 0, time: 0, quantity: 0, price: 0,
        craftBaseRate: null, subsistenceRate: null,
        craftCost: null, equipmentCost: null, materialCost: null,
        equipmentOwnership: null, dateAdded: Date.now(), sortOrder: null,
        ...rest, activityType: activityType ?? null,
      });
      await addActivities([activity]);
      recalculatePhase(phaseId);
    },
    [addActivities, recalculatePhase, phaseId, proposalId, wbsId],
  );

  // ---------------------------------------------------------------------------
  //  Quick-add button definitions (Silicon Valley-style row above totals)
  // ---------------------------------------------------------------------------

  type QuickAdd = {
    key: string;
    label: string;
    icon: React.ReactNode;
    primary?: boolean;
    onClick: () => void;
  };

  const quickAdds: QuickAdd[] = useMemo(() => {
    if (phaseId) {
      return [
        {
          key: 'activity',
          label: 'Activity',
          primary: true,
          icon: <EngineeringOutlinedIcon sx={{ fontSize: 15 }} />,
          onClick: () => setOpenAddActivityDialog(true),
        },
        {
          key: 'equipment',
          label: 'Equipment',
          icon: <LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />,
          onClick: () => setOpenEquipmentDialog(true),
        },
        {
          key: 'material',
          label: 'Material',
          icon: <Inventory2OutlinedIcon sx={{ fontSize: 15 }} />,
          onClick: () =>
            createActivity({
              description: 'NEW MATERIAL ITEM',
              activityType: ActivityType.materialItem,
            }),
        },
        {
          key: 'cost-only',
          label: 'Cost Only',
          icon: <PaymentsOutlinedIcon sx={{ fontSize: 15 }} />,
          onClick: () =>
            createActivity({
              description: 'NEW COST ONLY ITEM',
              activityType: ActivityType.costOnlyItem,
            }),
        },
        {
          key: 'custom-labor',
          label: 'Custom Labor',
          icon: <PersonAddAltOutlinedIcon sx={{ fontSize: 15 }} />,
          onClick: () =>
            createActivity({
              description: 'NEW CUSTOM LABOR ITEM',
              activityType: ActivityType.customLaborItem,
            }),
        },
        {
          key: 'subcontractor',
          label: 'Subcontractor',
          icon: <HandshakeOutlinedIcon sx={{ fontSize: 15 }} />,
          onClick: () =>
            createActivity({
              description: 'NEW SUBCONTRACTOR',
              activityType: ActivityType.subContractorItem,
              unit: 'HOURS',
            }),
        },
      ];
    }
    if (wbsId) {
      return [
        {
          key: 'phase',
          label: 'Phase',
          primary: true,
          icon: <LayersOutlinedIcon sx={{ fontSize: 15 }} />,
          onClick: () => setAddPhaseDialogOpen(true),
        },
      ];
    }
    return [];
  }, [phaseId, wbsId, createActivity]);

  const showQuickAddBar = hasWritePermissions && quickAdds.length > 0;

  const quickAddButtonSx = {
    textTransform: 'none' as const,
    fontWeight: 500,
    fontSize: '0.78rem',
    letterSpacing: '0.005em',
    borderRadius: 999,
    px: 1.25,
    py: 0.25,
    minHeight: 26,
    lineHeight: 1.2,
    border: `1px solid ${COLOR.border}`,
    color: COLOR.sectionHead,
    backgroundColor: COLOR.white,
    boxShadow: '0 1px 0 rgba(17, 24, 39, 0.02)',
    transition: 'background-color 120ms ease, border-color 120ms ease',
    '& .MuiButton-startIcon': {
      mr: 0.5,
      ml: -0.25,
      color: COLOR.muted,
    },
    '&:hover': {
      backgroundColor: alpha('#000', 0.035),
      borderColor: '#d1d5db',
      '& .MuiButton-startIcon': { color: COLOR.sectionHead },
    },
  };

  const quickAddPrimarySx = {
    ...quickAddButtonSx,
    color: COLOR.white,
    backgroundColor: '#111827',
    borderColor: '#111827',
    '& .MuiButton-startIcon': { color: alpha('#ffffff', 0.85), mr: 0.5, ml: -0.25 },
    '&:hover': {
      backgroundColor: '#1f2937',
      borderColor: '#1f2937',
      '& .MuiButton-startIcon': { color: '#ffffff' },
    },
  };

  // ---------------------------------------------------------------------------
  //  Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Box sx={{ flexShrink: 0, borderTop: `1px solid ${COLOR.border}`, backgroundColor: COLOR.surface }}>

        {/* ━━━ Quick-add bar (above totals) ━━━ */}
        {showQuickAddBar && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: { xs: 1, sm: 1.5 },
              py: 0.6,
              borderBottom: `1px solid ${COLOR.border}`,
              backgroundColor: COLOR.white,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                pr: 0.5,
                flexShrink: 0,
              }}>
              <AddIcon sx={{ fontSize: 14, color: COLOR.muted }} />
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: COLOR.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>
                Add
              </Typography>
            </Box>
            <Box
              sx={{
                width: '1px',
                height: 16,
                backgroundColor: COLOR.border,
                flexShrink: 0,
                mr: 0.25,
              }}
            />
            {quickAdds.map((item) => (
              <Tooltip key={item.key} title={`Add ${item.label}`} enterDelay={400}>
                <Button
                  size='small'
                  onClick={item.onClick}
                  disableElevation
                  disableRipple
                  startIcon={item.icon}
                  sx={item.primary ? quickAddPrimarySx : quickAddButtonSx}>
                  {item.label}
                </Button>
              </Tooltip>
            ))}
          </Box>
        )}

        {/* ━━━ Status bar ━━━ */}
        <Box sx={{ display: 'flex', alignItems: 'center', height: 36, px: { xs: 0.5, sm: 1.5 } }}>
          <Box
            sx={{
              display: 'flex', alignItems: 'center', flex: 1, minWidth: 0,
              overflow: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
            }}>
            <Stat label='Total Cost' value={fmt(totals.totalCost, '$')} />
            <Box sx={{ width: '1px', height: 16, backgroundColor: COLOR.border, flexShrink: 0, mx: 0.25 }} />
            <Stat label='Total Hrs' value={fmt(totals.totalHours)} />
            <Box sx={{ width: '1px', height: 16, backgroundColor: COLOR.border, flexShrink: 0, mx: 0.25 }} />
            <Stat label='Direct' value={fmt(totals.directHours)} />
            <Box sx={{ width: '1px', height: 16, backgroundColor: COLOR.border, flexShrink: 0, mx: 0.25 }} />
            <Stat label='Indirect' value={fmt(totals.indirectHours)} />
            <Box sx={{ width: '1px', height: 16, backgroundColor: COLOR.border, flexShrink: 0, mx: 0.25 }} />
            <Stat label='Sub Hrs' value={fmt(totals.subcontractorHours)} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, flexShrink: 0 }}>
            {hasHiddenData && (
              <Tooltip title='Some hidden WBS items contain data not reflected in these totals. Use WBS Select to review.' enterDelay={200}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.25, borderRadius: 1, backgroundColor: '#fffbeb', border: '1px solid #fde68a', cursor: 'help' }}>
                  <WarningAmberIcon sx={{ fontSize: 13, color: '#d97706' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e', whiteSpace: 'nowrap' }}>
                    Hidden WBS data
                  </Typography>
                </Box>
              </Tooltip>
            )}
            <Tooltip title={detailsOpen ? 'Hide breakdown' : 'Show breakdown'} enterDelay={400}>
              <Button
                size='small'
                onClick={toggleDetails}
                disableElevation
                disableRipple
                sx={{
                  minWidth: 0, px: 1.25, py: 0.25, textTransform: 'none',
                  fontWeight: 500, fontSize: '0.8rem', color: COLOR.label,
                  borderRadius: 1, border: `1px solid ${COLOR.border}`,
                  backgroundColor: detailsOpen ? alpha('#000', 0.03) : 'transparent',
                  '&:hover': { backgroundColor: alpha('#000', 0.04), borderColor: '#d1d5db' },
                }}
                endIcon={
                  detailsOpen
                    ? <KeyboardArrowDownIcon sx={{ fontSize: '14px !important', color: COLOR.muted }} />
                    : <KeyboardArrowUpIcon sx={{ fontSize: '14px !important', color: COLOR.muted }} />
                }>
                Details
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* ━━━ Expandable breakdown ━━━ */}
        <Collapse in={detailsOpen} timeout={200}>
          <Box
            sx={{
              borderTop: `1px solid ${COLOR.border}`,
              px: { xs: 1.5, sm: 2.5 }, py: 0.75,
              backgroundColor: COLOR.white,
            }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: { xs: 1, sm: 2 } }}>
              {/* Hours */}
              <MiniTable
                title='Hours'
                rows={[
                  { label: 'Craft', value: fmt(totals.directCraftHours) },
                  { label: 'Welder', value: fmt(totals.directWelderHours) },
                  { label: 'Support', value: fmt(totals.supportHours) },
                  { label: 'Mobe / Demobe', value: fmt(Number((totals.mobeHours + totals.demobeHours).toFixed(2))) },
                  { label: 'Specialty', value: fmt(totals.specialtyHours) },
                  { label: 'Subcontractor', value: fmt(totals.subcontractorHours) },
                ]}
                footer={{ label: 'Total', value: fmt(totals.totalHours) }}
              />

              {/* Costs */}
              <MiniTable
                title='Labor Costs'
                rows={[
                  { label: 'Craft', value: fmt(totals.craftCost, '$') },
                  { label: 'Weld & Rig', value: fmt(totals.welderCost, '$') },
                  { label: 'Subcontractor', value: fmt(totals.subcontractorCost, '$') },
                ]}
              />

              {/* Other Costs */}
              <MiniTable
                title='Other Costs'
                rows={[
                  { label: 'Equipment', value: fmt(totals.equipmentCost, '$') },
                  { label: 'Material', value: fmt(totals.materialCost, '$') },
                  { label: 'Cost Only', value: fmt(totals.costOnlyCost, '$') },
                ]}
              />
            </Box>
          </Box>
        </Collapse>
      </Box>

      <AddPhaseDialog open={addPhaseDialogOpen} onClose={() => setAddPhaseDialogOpen(false)} />
      <AddEquipmentDialog open={openEquipmentDialog} onClose={() => setOpenEquipmentDialog(false)} />
      <AddActivityDialog open={openAddActivityDialog} onClose={() => setOpenAddActivityDialog(false)} />
    </>
  );
}

export default BottomPanel;

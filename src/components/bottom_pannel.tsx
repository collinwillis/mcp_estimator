import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
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
      <Typography sx={{ color: COLOR.label, fontWeight: 500, fontSize: '0.675rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ color: COLOR.value, fontWeight: 600, fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
//  Breakdown detail row — pure typography, no icons
// ---------------------------------------------------------------------------

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.25, minHeight: 24 }}>
      <Typography sx={{ color: bold ? COLOR.sectionHead : COLOR.label, fontWeight: bold ? 600 : 400, fontSize: '0.775rem' }}>
        {label}
      </Typography>
      <Typography sx={{ color: COLOR.value, fontWeight: bold ? 700 : 500, fontSize: '0.775rem', fontVariantNumeric: 'tabular-nums', ml: 2 }}>
        {value}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
//  Section header for breakdown columns
// ---------------------------------------------------------------------------

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        color: COLOR.sectionHead,
        fontWeight: 700,
        fontSize: '0.675rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        mb: 0.75,
        pb: 0.5,
        borderBottom: `1px solid ${COLOR.border}`,
      }}>
      {children}
    </Typography>
  );
}

// ---------------------------------------------------------------------------
//  Main component
// ---------------------------------------------------------------------------

function BottomPanel() {
  const { proposalId, wbsId, phaseId } = useParams();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

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

  const closeMenu = () => setAddMenuAnchor(null);

  // ---------------------------------------------------------------------------
  //  Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Box sx={{ flexShrink: 0, borderTop: `1px solid ${COLOR.border}`, backgroundColor: COLOR.surface }}>

        {/* ━━━ Status bar ━━━ */}
        <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: { xs: 0.5, sm: 1.5 } }}>
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
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: '#92400e', whiteSpace: 'nowrap' }}>
                    Hidden WBS data
                  </Typography>
                </Box>
              </Tooltip>
            )}
            <Tooltip title={detailsOpen ? 'Hide breakdown' : 'Show breakdown'} enterDelay={400}>
              <Button
                size='small'
                onClick={() => setDetailsOpen((p) => !p)}
                disableElevation
                disableRipple
                sx={{
                  minWidth: 0, px: 1.25, py: 0.25, textTransform: 'none',
                  fontWeight: 500, fontSize: '0.725rem', color: COLOR.label,
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

            {hasWritePermissions && (
              <Tooltip title='Add item' enterDelay={400}>
                <IconButton
                  size='small'
                  onClick={(e) => setAddMenuAnchor(e.currentTarget)}
                  sx={{
                    width: 28, height: 28, borderRadius: 1,
                    border: `1px solid ${COLOR.border}`, backgroundColor: COLOR.white,
                    color: COLOR.sectionHead,
                    '&:hover': { backgroundColor: alpha('#000', 0.04), borderColor: '#d1d5db' },
                  }}>
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* ━━━ Expandable breakdown ━━━ */}
        <Collapse in={detailsOpen} timeout={200}>
          <Box
            sx={{
              maxHeight: '32vh', overflowY: 'auto',
              borderTop: `1px solid ${COLOR.border}`,
              px: { xs: 2, sm: 3 }, py: 1.5,
              backgroundColor: COLOR.white,
            }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: { xs: 2, sm: 4 } }}>

              {/* Hours */}
              <Box>
                <SectionHeader>Hours</SectionHeader>
                <DetailRow label='Direct Hours' value={fmt(totals.directHours)} bold />
                <Box sx={{ pl: 1.5, borderLeft: `2px solid ${COLOR.border}`, ml: 0.5, my: 0.25 }}>
                  <DetailRow label='Craft' value={fmt(totals.directCraftHours)} />
                  <DetailRow label='Welder' value={fmt(totals.directWelderHours)} />
                </Box>

                <Box sx={{ height: 8 }} />

                <DetailRow label='Indirect Hours' value={fmt(totals.indirectHours)} bold />
                <Box sx={{ pl: 1.5, borderLeft: `2px solid ${COLOR.border}`, ml: 0.5, my: 0.25 }}>
                  <DetailRow label='Support' value={fmt(totals.supportHours)} />
                  <DetailRow label='Mobilization' value={fmt(totals.mobeHours)} />
                  <DetailRow label='Demobilization' value={fmt(totals.demobeHours)} />
                  <DetailRow label='Specialty Services' value={fmt(totals.specialtyHours)} />
                </Box>

                <Box sx={{ height: 8 }} />
                <DetailRow label='Subcontractor Hours' value={fmt(totals.subcontractorHours)} bold />
              </Box>

              {/* Cost Details */}
              <Box>
                <SectionHeader>Labor Costs</SectionHeader>
                <DetailRow label='Craft Total' value={fmt(totals.craftCost, '$')} />
                <DetailRow label='Weld & Rig Total' value={fmt(totals.welderCost, '$')} />
                <DetailRow label='Subcontractor Total' value={fmt(totals.subcontractorCost, '$')} />
              </Box>

              {/* Additional Costs */}
              <Box>
                <SectionHeader>Other Costs</SectionHeader>
                <DetailRow label='Equipment' value={fmt(totals.equipmentCost, '$')} />
                <DetailRow label='Material' value={fmt(totals.materialCost, '$')} />
                <DetailRow label='Cost Only' value={fmt(totals.costOnlyCost, '$')} />
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* ━━━ Quick Actions popover ━━━ */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: -0.5, minWidth: 180, borderRadius: 1.5,
            border: `1px solid ${COLOR.border}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
          },
        }}>
        <MenuItem disabled={!wbsId} onClick={() => { setAddPhaseDialogOpen(true); closeMenu(); }}>
          <ListItemText primary='Phase' primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: 600 }} />
        </MenuItem>
        <Divider sx={{ my: 0.25 }} />
        <MenuItem disabled={!phaseId} onClick={() => { setOpenAddActivityDialog(true); closeMenu(); }}>
          <ListItemText primary='Activity' primaryTypographyProps={{ fontSize: '0.825rem' }} />
        </MenuItem>
        <MenuItem disabled={!phaseId} onClick={() => { setOpenEquipmentDialog(true); closeMenu(); }}>
          <ListItemText primary='Equipment' primaryTypographyProps={{ fontSize: '0.825rem' }} />
        </MenuItem>
        <MenuItem disabled={!phaseId} onClick={() => { createActivity({ description: 'NEW MATERIAL ITEM', activityType: ActivityType.materialItem }); closeMenu(); }}>
          <ListItemText primary='Material' primaryTypographyProps={{ fontSize: '0.825rem' }} />
        </MenuItem>
        <MenuItem disabled={!phaseId} onClick={() => { createActivity({ description: 'NEW COST ONLY ITEM', activityType: ActivityType.costOnlyItem }); closeMenu(); }}>
          <ListItemText primary='Cost Only' primaryTypographyProps={{ fontSize: '0.825rem' }} />
        </MenuItem>
        <MenuItem disabled={!phaseId} onClick={() => { createActivity({ description: 'NEW CUSTOM LABOR ITEM', activityType: ActivityType.customLaborItem }); closeMenu(); }}>
          <ListItemText primary='Custom Labor' primaryTypographyProps={{ fontSize: '0.825rem' }} />
        </MenuItem>
        <MenuItem disabled={!phaseId} onClick={() => { createActivity({ description: 'NEW SUBCONTRACTOR', activityType: ActivityType.subContractorItem, unit: 'HOURS' }); closeMenu(); }}>
          <ListItemText primary='Subcontractor' primaryTypographyProps={{ fontSize: '0.825rem' }} />
        </MenuItem>
      </Menu>

      <AddPhaseDialog open={addPhaseDialogOpen} onClose={() => setAddPhaseDialogOpen(false)} />
      <AddEquipmentDialog open={openEquipmentDialog} onClose={() => setOpenEquipmentDialog(false)} />
      <AddActivityDialog open={openAddActivityDialog} onClose={() => setOpenAddActivityDialog(false)} />
    </>
  );
}

export default BottomPanel;

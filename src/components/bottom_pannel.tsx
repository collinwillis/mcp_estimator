import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { blue, green, orange, purple, red } from '@mui/material/colors';

import AddActivityDialog from '../features/phase home/components/add_activity_dialog';
import AddEquipmentDialog from '../features/phase home/components/add_equipment_dialog';
import { useUserProfile } from '../hooks/user_profile_hook';
import { Activity, ActivityType } from '../models/activity';
import { FirestoreActivity } from '../models/firestore models/activity_firestore';
import { Phase } from '../models/phase';
import { Wbs } from '../models/wbs';
import { StoreState, estimatorStore } from '../utils/store';
import AddPhaseDialog from './add_phase_dialog';

const metricCardStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  py: 1.5,
  px: 1.5,
} as const;

const BottomPanel: React.FC = () => {
  const { proposalId, wbsId, phaseId } = useParams();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('lg'));

  const [dataset, setDataset] = useState<Activity[] | Phase[] | Wbs[]>([]);
  const [detailsExpanded, setDetailsExpanded] = useState(!isCompact);
  const [totalCost, setTotalCost] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [craftHours, setCraftHours] = useState(0);
  const [welderHours, setWelderHours] = useState(0);
  const [subcontractorHours, setSubcontractorHours] = useState(0);
  const [craftCost, setCraftCost] = useState(0);
  const [welderCost, setWelderCost] = useState(0);
  const [subcontractorCost, setSubcontractorCost] = useState(0);
  const [equipmentCost, setEquipmentCost] = useState(0);
  const [materialCost, setMaterialCost] = useState(0);
  const [costOnlyCost, setCostOnlyCost] = useState(0);

  const activities = estimatorStore(
    (state: StoreState) => state.activities[proposalId!] || [],
  );
  const phases = estimatorStore(
    (state: StoreState) => state.phases[proposalId!] || [],
  );
  const wbs = estimatorStore((state: StoreState) => state.wbs[proposalId!] || []);

  useEffect(() => {
    if (phaseId) {
      setDataset(activities.filter((item) => item.phaseId === phaseId));
    } else if (wbsId) {
      setDataset(phases.filter((item) => item.wbsId === wbsId));
    } else {
      setDataset(wbs);
    }
  }, [activities, phases, wbs, wbsId, phaseId]);

  useEffect(() => {
    setDetailsExpanded(!isCompact);
  }, [isCompact]);

  useEffect(() => {
    let tempCost = 0;
    let tempHours = 0;
    let tempCraftHours = 0;
    let tempWelderHours = 0;
    let tempSubHours = 0;
    let tempCraftCost = 0;
    let tempWelderCost = 0;
    let tempSubCost = 0;
    let tempEquipmentCost = 0;
    let tempMaterialCost = 0;
    let tempCostOnly = 0;

    dataset.forEach((record) => {
      const base = record as Activity;
      tempCost += base.totalCost || 0;
      tempHours += (base.craftManHours || 0) + (base.welderManHours || 0);
      tempCraftHours += base.craftManHours || 0;
      tempWelderHours += base.welderManHours || 0;
      tempSubHours += base.subContractorHours || 0;
      tempCraftCost += base.craftCost || 0;
      tempWelderCost += base.welderCost || 0;
      tempSubCost += base.subContractorCost || 0;
      tempEquipmentCost += base.equipmentCost || 0;
      tempMaterialCost += base.materialCost || 0;
      tempCostOnly += base.costOnlyCost || 0;
    });

    setTotalCost(Number(tempCost.toFixed(2)));
    setTotalHours(Number(tempHours.toFixed(2)));
    setCraftHours(Number(tempCraftHours.toFixed(2)));
    setWelderHours(Number(tempWelderHours.toFixed(2)));
    setSubcontractorHours(Number(tempSubHours.toFixed(2)));
    setCraftCost(Number(tempCraftCost.toFixed(2)));
    setWelderCost(Number(tempWelderCost.toFixed(2)));
    setSubcontractorCost(Number(tempSubCost.toFixed(2)));
    setEquipmentCost(Number(tempEquipmentCost.toFixed(2)));
    setMaterialCost(Number(tempMaterialCost.toFixed(2)));
    setCostOnlyCost(Number(tempCostOnly.toFixed(2)));
  }, [dataset]);

  const { hasWritePermissions } = useUserProfile();
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);
  const [openAddActivityDialog, setOpenAddActivityDialog] = useState(false);
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = useState(false);

  const addActivities = estimatorStore(
    (state: StoreState) => state.addActivities,
  );
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase,
  );

  const createActivity = useCallback(
    async (payload: Partial<FirestoreActivity>) => {
      if (!phaseId) return;
      const activity = new FirestoreActivity({
        proposalId,
        wbsId,
        phaseId,
        constant: null,
        equipment: null,
        craftConstant: 0,
        welderConstant: 0,
        time: 0,
        quantity: 0,
        price: 0,
        craftBaseRate: null,
        subsistenceRate: null,
        craftCost: null,
        equipmentCost: null,
        materialCost: null,
        equipmentOwnership: null,
        dateAdded: Date.now(),
        sortOrder: null,
        ...payload,
      });
      await addActivities([activity]);
      recalculatePhase(phaseId);
    },
    [addActivities, recalculatePhase, phaseId, proposalId, wbsId],
  );

  const quickActions = useMemo(
    () => [
      {
        label: 'Add Activity',
        handler: () => setOpenAddActivityDialog(true),
      },
      {
        label: 'Add Equipment',
        handler: () => setOpenEquipmentDialog(true),
      },
      {
        label: 'Add Material',
        handler: () =>
          createActivity({ description: 'NEW MATERIAL ITEM', activityType: ActivityType.materialItem }),
      },
      {
        label: 'Add Cost Only',
        handler: () =>
          createActivity({ description: 'NEW COST ONLY ITEM', activityType: ActivityType.costOnlyItem }),
      },
      {
        label: 'Add Custom Labor',
        handler: () =>
          createActivity({ description: 'NEW CUSTOM LABOR ITEM', activityType: ActivityType.customLaborItem }),
      },
      {
        label: 'Add Subcontractor',
        handler: () =>
          createActivity({
            description: 'NEW SUBCONTRACTOR',
            activityType: ActivityType.subContractorItem,
            unit: 'HOURS',
          }),
      },
    ], [createActivity],
  );

  return (
    <Paper
      elevation={0}
      square
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid rgba(15,23,42,0.08)',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        px: { xs: 2, md: 4 },
        py: { xs: 1.5, md: 2.5 },
        zIndex: 5,
      }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems='stretch'>
        <Box flex={1} minWidth={0}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Card elevation={1} sx={{ flex: 1 }}>
              <CardContent sx={metricCardStyles}>
                <Avatar sx={{ backgroundColor: green[500] }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Total Cost
                  </Typography>
                  <Typography variant='h6'>
                    ${totalCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card elevation={1} sx={{ flex: 1 }}>
              <CardContent sx={metricCardStyles}>
                <Avatar sx={{ backgroundColor: blue[500] }}>
                  <AccessTimeIcon />
                </Avatar>
                <Box>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Total Hours
                  </Typography>
                  <Typography variant='h6'>
                    {totalHours.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>

          <Box mt={2}>
            <Divider sx={{ mb: 1 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}>
              <Typography variant='subtitle1'>Breakdown</Typography>
              <Button
                size='small'
                startIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: detailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                }
                onClick={() => setDetailsExpanded((prev) => !prev)}>
                {detailsExpanded ? 'Hide Details' : 'Show Details'}
              </Button>
            </Box>
            <Collapse in={detailsExpanded} timeout='auto' unmountOnExit>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant='subtitle2' gutterBottom>
                    Hours Details
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <GroupIcon sx={{ color: blue[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Craft Hours: {craftHours.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <BuildIcon sx={{ color: orange[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Welder Hours: {welderHours.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    <LocalShippingIcon sx={{ color: red[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Subcontractor Hours: {subcontractorHours.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant='subtitle2' gutterBottom>
                    Cost Details
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <AttachMoneyIcon sx={{ color: green[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Craft Total: ${craftCost.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <AttachMoneyIcon sx={{ color: purple[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Weld & Rig Total: ${welderCost.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    <AttachMoneyIcon sx={{ color: red[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Subcontractor Total: ${subcontractorCost.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant='subtitle2' gutterBottom>
                    Additional Costs
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <AttachMoneyIcon sx={{ color: blue[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Equipment Total: ${equipmentCost.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <AttachMoneyIcon sx={{ color: orange[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Material Total: ${materialCost.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    <AttachMoneyIcon sx={{ color: green[500], mr: 1 }} />
                    <Typography variant='body2'>
                      Cost Only Total: ${costOnlyCost.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Collapse>
          </Box>
        </Box>

        {hasWritePermissions && (
          <Box
            width={{ xs: '100%', lg: 320 }}
            sx={{
              flexShrink: 0,
            }}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='subtitle1' gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button
                    disabled={!wbsId}
                    variant='contained'
                    onClick={() => setAddPhaseDialogOpen(true)}>
                    Add Phase
                  </Button>
                  <Grid container spacing={1}>
                    {quickActions.map((action) => (
                      <Grid item xs={6} key={action.label}>
                        <Button
                          disabled={!phaseId}
                          variant='outlined'
                          fullWidth
                          onClick={action.handler}>
                          {action.label.replace('Add ', '')}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
      </Stack>

      <AddPhaseDialog
        open={addPhaseDialogOpen}
        onClose={() => setAddPhaseDialogOpen(false)}
      />
      <AddEquipmentDialog
        open={openEquipmentDialog}
        onClose={() => setOpenEquipmentDialog(false)}
      />
      <AddActivityDialog
        open={openAddActivityDialog}
        onClose={() => setOpenAddActivityDialog(false)}
      />
    </Paper>
  );
};

export default BottomPanel;

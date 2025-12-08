import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Grid,
  Typography,
  Paper,
  useMediaQuery,
  Theme,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { blue, green, orange, purple, red } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import AddActivityDialog from '../features/phase home/components/add_activity_dialog';
import AddEquipmentDialog from '../features/phase home/components/add_equipment_dialog';
import { useUserProfile } from '../hooks/user_profile_hook';
import { Activity, ActivityType } from '../models/activity';
import { FirestoreActivity } from '../models/firestore models/activity_firestore';
import { Phase } from '../models/phase';
import { Wbs } from '../models/wbs';
import { StoreState, estimatorStore } from '../utils/store';
import AddPhaseDialog from './add_phase_dialog';

const BottomPanel: React.FC = () => {
  const { proposalId, wbsId, phaseId } = useParams();

  const [data, setData] = useState<Activity[] | Phase[] | Wbs[]>([]);

  const [totalCost, setTotalCost] = useState(0);
  const [totalManHours, setTotalManHours] = useState(0);
  const [totalCraftHours, setTotalCraftHours] = useState(0);
  const [totalWelderHours, setTotalWelderHours] = useState(0);
  const [totalSubcontractorHours, setTotalSubcontractorHours] = useState(0);
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
  const wbs = estimatorStore(
    (state: StoreState) => state.wbs[proposalId!] || [],
  );

  useEffect(() => {
    if (phaseId) {
      const temp = activities.filter(
        (activity) => activity.phaseId === phaseId,
      );
      setData(temp);
    } else if (wbsId) {
      const temp = phases.filter((phase) => phase.wbsId === wbsId);
      setData(temp);
    } else {
      setData(wbs);
    }
  }, [activities, phaseId, proposalId, wbsId, phases, wbs]);

  const { hasWritePermissions } = useUserProfile();

  useEffect(() => {
    let tempTotalCost = 0;
    let tempTotalManHours = 0;
    let tempCraftHours = 0;
    let tempWelderHours = 0;
    let tempSubHours = 0;
    let tempCraftCost = 0;
    let tempWelderCost = 0;
    let tempSubCost = 0;
    let tempEquipmentCost = 0;
    let tempMaterialCost = 0;
    let tempCostOnlyCost = 0;

    data.forEach((activity) => {
      if (activity instanceof Activity) {
        const isSub = activity.activityType === ActivityType.subContractorItem;
        tempCraftCost += isSub ? 0 : Number(activity.craftCost) || 0;
        tempEquipmentCost += isSub ? 0 : activity.equipmentCost || 0;
        tempMaterialCost += isSub ? 0 : activity.materialCost || 0;
        tempSubHours +=
          (activity.unit?.toLowerCase() === 'hours' &&
            activity.activityType === ActivityType.subContractorItem &&
            activity.time * activity.quantity) ||
          0;
      } else {
        tempCraftCost += activity.craftCost || 0;
        tempEquipmentCost += activity.equipmentCost || 0;
        tempMaterialCost += activity.materialCost || 0;
      }
      tempTotalCost += activity.totalCost || 0;
      tempTotalManHours +=
        (activity.craftManHours || 0) + (activity.welderManHours || 0);
      tempCraftHours += activity.craftManHours || 0;
      tempWelderHours += activity.welderManHours || 0;

      tempWelderCost += activity.welderCost || 0;
      tempSubCost += activity.subContractorCost || 0;

      tempCostOnlyCost += activity.costOnlyCost || 0;
    });

    setTotalCost(parseFloat(tempTotalCost.toFixed(2)));
    setTotalManHours(parseFloat(tempTotalManHours.toFixed(2)));
    setCraftCost(parseFloat(tempCraftCost.toFixed(2)));
    setTotalCraftHours(parseFloat(tempCraftHours.toFixed(2)));
    setTotalWelderHours(parseFloat(tempWelderHours.toFixed(2)));
    setWelderCost(parseFloat(tempWelderCost.toFixed(2)));
    setSubcontractorCost(parseFloat(tempSubCost.toFixed(2)));
    setEquipmentCost(parseFloat(tempEquipmentCost.toFixed(2)));
    setMaterialCost(parseFloat(tempMaterialCost.toFixed(2)));
    setCostOnlyCost(parseFloat(tempCostOnlyCost.toFixed(2)));
    setTotalSubcontractorHours(parseFloat(tempSubHours.toFixed(2)));
  }, [data]);

  const [openEquipmentDialog, setOpenEquipmentDialog] =
    useState<boolean>(false);
  const [openAddActivityDialog, setOpenAddActivityDialog] =
    useState<boolean>(false);
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = useState<boolean>(false);

  const addActivities = estimatorStore(
    (state: StoreState) => state.addActivities,
  );
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase,
  );
  async function addMaterial() {
    const activity = new FirestoreActivity({
      proposalId,
      wbsId,
      phaseId,
      constant: null,
      equipment: null,
      time: 0,
      craftConstant: 0,
      welderConstant: 0,
      activityType: ActivityType.materialItem,
      description: 'NEW MATERIAL ITEM',
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
    });
    await addActivities([activity]);
    recalculatePhase(phaseId!);
  }
  async function addCustomLabor() {
    const activity = new FirestoreActivity({
      proposalId,
      wbsId,
      phaseId,
      constant: null,
      equipment: null,
      time: 0,
      craftConstant: 0,
      welderConstant: 0,
      activityType: ActivityType.customLaborItem,
      description: 'NEW CUSTOM LABOR ITEM',
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
    });
    await addActivities([activity]);
    recalculatePhase(phaseId!);
  }
  async function addSubcontractor() {
    const activity = new FirestoreActivity({
      proposalId,
      wbsId,
      unit: 'HOURS',
      phaseId,
      constant: null,
      equipment: null,
      time: 0,
      craftConstant: 0,
      welderConstant: 0,
      activityType: ActivityType.subContractorItem,
      description: 'NEW SUBCONTRACTOR',
      quantity: 0,
      price: 0,
      craftBaseRate: null,
      subsistenceRate: null,
      craftCost: 0,
      equipmentCost: 0,
      materialCost: 0,
      equipmentOwnership: null,
      dateAdded: Date.now(),
      sortOrder: null,
    });
    await addActivities([activity]);
    recalculatePhase(phaseId!);
  }
  async function addCostOnly() {
    const activity = new FirestoreActivity({
      proposalId,
      wbsId,
      phaseId,
      constant: null,
      equipment: null,
      time: 0,
      craftConstant: 0,
      welderConstant: 0,
      activityType: ActivityType.costOnlyItem,
      description: 'NEW COST ONLY ITEM',
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
    });
    await addActivities([activity]);
    recalculatePhase(phaseId!);
  }

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [detailsExpanded, setDetailsExpanded] = useState(!isSmallScreen);

  useEffect(() => {
    setDetailsExpanded(!isSmallScreen);
  }, [isSmallScreen]);

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        padding: isSmallScreen ? theme.spacing(2) : theme.spacing(4),
        borderTop: '1px solid #e0e0e0',
        backgroundColor: theme.palette.background.paper,
      }}>
      <Grid container spacing={2}>
        {/* Totals Section */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} alignItems='stretch'>
            <Grid item xs={12} sm={6}>
              <Card elevation={1}
                sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1.5,
                  }}>
                  <Avatar sx={{ backgroundColor: green[500] }}>
                    <AttachMoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Total Cost
                    </Typography>
                    <Typography variant='h6'>
                      $
                      {totalCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card elevation={1}
                sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1.5,
                  }}>
                  <Avatar sx={{ backgroundColor: blue[500] }}>
                    <AccessTimeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Total Hours
                    </Typography>
                    <Typography variant='h6'>
                      {totalManHours.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Detailed Totals */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
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
                  startIcon={<ExpandMoreIcon
                    sx={{
                      transform: detailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />}
                  onClick={() => setDetailsExpanded((prev) => !prev)}>
                  {detailsExpanded ? 'Hide Details' : 'Show Details'}
                </Button>
              </Box>
              <Collapse in={detailsExpanded} timeout='auto' unmountOnExit>
                <Grid container spacing={2}>
                  {/* Hours Details */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant='subtitle2' gutterBottom>
                      Hours Details
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <GroupIcon sx={{ color: blue[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Craft Hours:{' '}
                        {totalCraftHours.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BuildIcon sx={{ color: orange[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Welder Hours:{' '}
                        {totalWelderHours.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShippingIcon sx={{ color: red[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Subcontractor Hours:{' '}
                        {totalSubcontractorHours.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                  {/* Cost Details */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant='subtitle2' gutterBottom>
                      Cost Details
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoneyIcon sx={{ color: green[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Craft Total: $
                        {craftCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoneyIcon sx={{ color: purple[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Weld & Rig Total: $
                        {welderCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon sx={{ color: red[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Subcontractor Total: $
                        {subcontractorCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                  {/* Additional Costs */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant='subtitle2' gutterBottom>
                      Additional Costs
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoneyIcon sx={{ color: blue[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Equipment Total: $
                        {equipmentCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoneyIcon sx={{ color: orange[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Material Total: $
                        {materialCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon sx={{ color: green[500], mr: 1 }} />
                      <Typography variant='body2'>
                        Cost Only Total: $
                        {costOnlyCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        {/* Actions Section */}
        {hasWritePermissions && (
          <Grid item xs={12} md={4}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant='subtitle1' gutterBottom>
                  Actions
                </Typography>
                <Grid container spacing={isSmallScreen ? 0.5 : 1}>
                  <Grid item xs={12}>
                    <Button
                      disabled={!wbsId}
                      fullWidth
                      variant='contained'
                      color='primary'
                      onClick={() => setAddPhaseDialogOpen(true)}>
                      {isSmallScreen ? 'Phase' : 'Add Phase'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      disabled={!phaseId}
                      fullWidth
                      variant='outlined'
                      color='primary'
                      onClick={() => setOpenAddActivityDialog(true)}>
                      {isSmallScreen ? 'Activity' : 'Add Activity'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      disabled={!phaseId}
                      fullWidth
                      variant='outlined'
                      color='primary'
                      onClick={() => setOpenEquipmentDialog(true)}>
                      {isSmallScreen ? 'Equipment' : 'Add Equipment'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      disabled={!phaseId}
                      fullWidth
                      variant='outlined'
                      color='primary'
                      onClick={addMaterial}>
                      {isSmallScreen ? 'Material' : 'Add Material'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      disabled={!phaseId}
                      fullWidth
                      variant='outlined'
                      color='primary'
                      onClick={addCostOnly}>
                      {isSmallScreen ? 'Cost Only' : 'Add Cost Only'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      disabled={!phaseId}
                      fullWidth
                      variant='outlined'
                      color='primary'
                      onClick={addCustomLabor}>
                      {isSmallScreen ? 'Labor' : 'Add Custom Labor'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      disabled={!phaseId}
                      fullWidth
                      variant='outlined'
                      color='primary'
                      onClick={addSubcontractor}>
                      {isSmallScreen ? 'Subcontractor' : 'Add Subcontractor'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      {/* Dialogs */}
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

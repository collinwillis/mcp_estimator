import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ClockIcon from '@mui/icons-material/WatchLater';
import { Avatar, Box, Button, Grid, Stack, Typography } from '@mui/material';
import { blue, green } from '@mui/material/colors';

import AddActivityDialog from '../features/phase home/components/add_activity_dialog';
import AddEquipmentDialog from '../features/phase home/components/add_equipment_dialog';
import { useUserProfile } from '../hooks/user_profile_hook';
import { Activity, ActivityType } from '../models/activity';
import { FirestoreActivity } from '../models/firestore models/activity_firestore';
import { Phase } from '../models/phase';
import { Wbs } from '../models/wbs';
import { StoreState, estimatorStore } from '../utils/store';

const BottomPanel: React.FC = () => {
  const [height, setHeight] = useState<number>(300);
  const [opentEquipmentDialog, setOpenEquipmentDialog] =
    useState<boolean>(false);
  const [openAddActivityDialog, setOpenAddActivityDialog] =
    useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
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
  }, [activities, phaseId, proposalId, wbsId]);

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
        const isSub = activity.activityType == ActivityType.subContractorItem;
        tempCraftCost += isSub ? 0 : Number(activity.craftCost) || 0;
        tempEquipmentCost += isSub ? 0 : activity.equipmentCost || 0;
        tempMaterialCost += isSub ? 0 : activity.materialCost || 0;
        tempSubHours +=
          (activity.unit.toLowerCase() == 'hours' &&
            activity.activityType == ActivityType.subContractorItem &&
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
      // tempSubHours += activity.sub || 0;

      tempWelderCost += activity.welderCost || 0;
      tempSubCost += activity.subContractorCost || 0;

      tempCostOnlyCost += activity.costOnlyCost || 0;
    });
    console.log('tempMaterialCost', tempMaterialCost);

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current && e.target === ref.current) {
      const startHeight = e.clientY;
      document.body.style.userSelect = 'none';
      const handleMouseMove = (e: MouseEvent) => {
        const newHeight = Math.max(100, window.innerHeight - e.clientY);
        if (newHeight < 300) {
          setHeight(newHeight);
        }
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.body.style.userSelect = 'auto';
      });
    }
  };
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
  return (
    <Box
      sx={{
        display: 'flex',
        bottom: '0',
        width: '100%',
        backgroundColor: 'white',
        pb: '30px',
      }}>
      <Box
        sx={{
          display: 'flex',
          direction: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
        <Box
          sx={{
            pt: { lg: '0px', md: '80px', sm: '80px', xs: '80px' },
            width: hasWritePermissions ? '50%' : '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            alignContent: 'center',
            flexDirection: 'row',
          }}>
          <Stack
            sx={{
              pr: '35px',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}>
            <Box
              sx={{
                flex: 1,
                flexDirection: 'column',
                padding: '10px',
                height: '100%',
                display: { xs: 'none', lg: 'flex' },
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}>
              <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: green[500] }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Stack>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Total Cost:
                  </Typography>
                  <Typography variant='subtitle2'>
                    $
                    {totalCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack
                direction='row'
                spacing={1}
                sx={{ marginTop: '30px', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: blue[500] }}>
                  <ClockIcon />
                </Avatar>
                <Stack>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Total Hours:
                  </Typography>
                  <Typography variant='subtitle2'>
                    {totalManHours.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '150px' }}>
                Craft Hours
              </Typography>

              <Typography variant='body2'>
                {totalCraftHours.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '150px' }}>
                Welder Hours
              </Typography>
              <Typography variant='body2'>
                {totalWelderHours.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={612} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '200px' }}>
                Subcontractor Hours
              </Typography>
              <Typography variant='body2'>
                {totalSubcontractorHours.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '150px' }}>
                Craft Total
              </Typography>
              <Typography variant='body2'>
                $
                {craftCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '200px' }}>
                Weld & Rig Total
              </Typography>
              <Typography variant='body2'>
                $
                {welderCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '200px' }}>
                Subcontractor Total
              </Typography>
              <Typography variant='body2'>
                $
                {subcontractorCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '150px' }}>
                Equipment Total
              </Typography>
              <Typography variant='body2'>
                $
                {equipmentCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '200px' }}>
                Cost Only Total
              </Typography>
              <Typography variant='body2'>
                $
                {costOnlyCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant='subtitle2' noWrap sx={{ width: '150px' }}>
                Material Total
              </Typography>
              <Typography variant='body2'>
                $
                {materialCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        {hasWritePermissions && (
          <Box sx={{ width: '30%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
                <Button
                  disabled={phaseId == null}
                  fullWidth
                  variant='contained'
                  onClick={() => setOpenAddActivityDialog(true)}>
                  Activity
                </Button>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
                <Button
                  disabled={phaseId == null}
                  fullWidth
                  variant='contained'
                  onClick={() => setOpenEquipmentDialog(true)}>
                  Equipment
                </Button>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
                <Button
                  disabled={phaseId == null}
                  fullWidth
                  variant='contained'
                  onClick={() => addMaterial()}>
                  Material
                </Button>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
                <Button
                  disabled={phaseId == null}
                  fullWidth
                  variant='contained'
                  onClick={() => addCostOnly()}>
                  Cost Only
                </Button>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
                <Button
                  disabled={phaseId == null}
                  fullWidth
                  sx={{
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                    textOverflow: 'ellipsis',
                  }}
                  variant='contained'
                  onClick={() => addCustomLabor()}>
                  Custom Labor
                </Button>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
                <Button
                  disabled={phaseId == null}
                  fullWidth
                  variant='contained'
                  onClick={() => addSubcontractor()}>
                  Subcontractor
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
      <AddEquipmentDialog
        open={opentEquipmentDialog}
        onClose={() => setOpenEquipmentDialog(false)}
      />
      <AddActivityDialog
        open={openAddActivityDialog}
        onClose={() => setOpenAddActivityDialog(false)}
      />
    </Box>
  );
};

export default BottomPanel;

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ClockIcon from "@mui/icons-material/WatchLater";
import { Avatar, Box, Button, Grid, Stack, Typography } from "@mui/material";
import { blue, green } from "@mui/material/colors";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addCostOnly,
  addCustomLabor,
  addMaterial,
  addSubcontractor,
} from "../api/activity";
import AddActivityDialog from "../features/phase home/components/add_activity_dialog";
import AddEquipmentDialog from "../features/phase home/components/add_equipment_dialog";
import useActivities from "../hooks/activity_hook";

const BottomPanel: React.FC = () => {
  const [height, setHeight] = useState<number>(300);
  const [opentEquipmentDialog, setOpenEquipmentDialog] =
    useState<boolean>(false);
  const [openAddActivityDialog, setOpenAddActivityDialog] =
    useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const { proposalId, wbsId, phaseId } = useParams();

  const { data, loading } = useActivities({
    currentProposalId: proposalId ?? "",
    currentPhaseId: phaseId,
    currentWbsId: wbsId,
  });

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
      tempTotalCost = tempTotalCost + activity.totalCost;
      tempTotalManHours =
        tempTotalManHours + activity.craftManHours + activity.welderManHours;
      tempCraftHours = tempCraftHours + activity.craftManHours;
      tempWelderHours = tempWelderHours + activity.welderManHours;
      // tempSubHours = tempSubHours + activity.sub
      tempCraftCost = tempCraftCost + activity.craftCost;
      tempSubCost = tempSubCost + activity.subContractorCost;
      tempEquipmentCost = tempEquipmentCost + activity.equipmentCost;
      tempMaterialCost = tempMaterialCost + activity.materialCost;
      tempCostOnlyCost = tempCostOnlyCost + activity.costOnlyCost;
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
  }, [data]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current && e.target === ref.current) {
      const startHeight = e.clientY;
      document.body.style.userSelect = "none";
      const handleMouseMove = (e: MouseEvent) => {
        const newHeight = Math.max(100, window.innerHeight - e.clientY);
        if (newHeight < 300) {
          setHeight(newHeight);
        }
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.body.style.userSelect = "auto";
      });
    }
  };

  return (
    <Box
      sx={{
        bottom: "0",
        height: height,
        backgroundColor: "white",
        position: "relative",
        width: "100%",
        overflow: "auto",
        "& .MuiBox-root": {
          position: "relative",
          userSelect: "auto",
        },
      }}
    >
      {/* The resizing handle at the top of the drawer */}
      <div
        ref={ref}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          height: "10px",
          cursor: "ns-resize",
          bottom: "auto",
          zIndex: 9999,
        }}
        onMouseDown={handleMouseDown}
      />

      {/* The content of the bottom panel */}
      <Box
        sx={{
          display: "flex",
          direction: "row",
          justifyContent: "space-around",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Box
          sx={{
            pt: { lg: "0px", md: "80px", sm: "80px", xs: "80px" },
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            alignContent: "center",
            flexDirection: "row",
          }}
        >
          <Stack
            sx={{
              pr: "35px",
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            <Box
              sx={{
                flex: 1,
                flexDirection: "column",
                padding: "10px",
                height: "100%",
                display: { xs: "none", lg: "flex" },
                justifyContent: "center",
                whiteSpace: "nowrap",
              }}
            >
              <Stack
                direction={"row"}
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <Avatar sx={{ backgroundColor: green[500] }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Stack>
                  <Typography variant={"subtitle2"} fontWeight={"bold"}>
                    Total Cost:
                  </Typography>
                  <Typography variant={"subtitle2"}>
                    $
                    {totalCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack
                direction={"row"}
                spacing={1}
                sx={{ marginTop: "30px", alignItems: "center" }}
              >
                <Avatar sx={{ backgroundColor: blue[500] }}>
                  <ClockIcon />
                </Avatar>
                <Stack>
                  <Typography variant={"subtitle2"} fontWeight={"bold"}>
                    Total Hours:
                  </Typography>
                  <Typography variant={"subtitle2"}>
                    {totalManHours.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    hrs.
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "150px" }}>
                Craft Hours
              </Typography>

              <Typography variant="body2">
                {totalCraftHours.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                hrs
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "150px" }}>
                Welder Hours
              </Typography>
              <Typography variant="body2">
                {totalWelderHours.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                hrs
              </Typography>
            </Grid>
            <Grid item xs={12} sm={612} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "200px" }}>
                Subcontractor Hours
              </Typography>
              <Typography variant="body2">
                {totalSubcontractorHours.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                hrs
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "150px" }}>
                Craft Total
              </Typography>
              <Typography variant="body2">
                $
                {craftCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "200px" }}>
                Weld & Rig Total
              </Typography>
              <Typography variant="body2">
                $
                {welderCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "200px" }}>
                Subcontractor Total
              </Typography>
              <Typography variant="body2">
                $
                {subcontractorCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "150px" }}>
                Equipment Total
              </Typography>
              <Typography variant="body2">
                $
                {equipmentCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "200px" }}>
                Cost Only Total
              </Typography>
              <Typography variant="body2">
                $
                {costOnlyCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Typography variant="subtitle2" noWrap sx={{ width: "150px" }}>
                Material Total
              </Typography>
              <Typography variant="body2">
                $
                {materialCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ width: "30%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Button
                disabled={phaseId == null}
                fullWidth
                variant="contained"
                onClick={() => setOpenAddActivityDialog(true)}
              >
                Activity
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Button
                disabled={phaseId == null}
                fullWidth
                variant="contained"
                onClick={() => setOpenEquipmentDialog(true)}
              >
                Equipment
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Button
                disabled={phaseId == null}
                fullWidth
                variant="contained"
                onClick={() => addMaterial(proposalId!, wbsId!, phaseId!)}
              >
                Material
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Button
                disabled={phaseId == null}
                fullWidth
                variant="contained"
                onClick={() => addCostOnly(proposalId!, wbsId!, phaseId!)}
              >
                Cost Only
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Button
                disabled={phaseId == null}
                fullWidth
                sx={{
                  whiteSpace: "nowrap",
                  minWidth: "auto",
                  textOverflow: "ellipsis",
                }}
                variant="contained"
                onClick={() => addCustomLabor(proposalId!, wbsId!, phaseId!)}
              >
                Custom Labor
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Button
                disabled={phaseId == null}
                fullWidth
                variant="contained"
                onClick={() => addSubcontractor(proposalId!, wbsId!, phaseId!)}
              >
                Subcontractor
              </Button>
            </Grid>
          </Grid>
        </Box>
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

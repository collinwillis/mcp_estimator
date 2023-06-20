import { EditAttributes, EditRounded } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TrashIcon from "@mui/icons-material/DeleteForever";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button, Divider, MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
  GridCellParams,
  GridColumns,
  GridRowId,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  deleteActivityBatch,
  resetConstantsBatch,
  updateActivity,
  updateEquipmentUnit,
} from "../../../api/activity";
import { StyledDataGrid } from "../../../components/custom_data_grid";
import EditBaseRateDialog from "../../../components/edit_base_rate_dialog";
import useActivities from "../../../hooks/activity_hook";
import { useCurrentPhase } from "../../../hooks/current_phase_hook";
import { Activity, ActivityType } from "../../../models/activity";
import {
  costOnlyItemAvailableCells,
  customLaborItemAvailableCells,
  editableCostOnlyItemCells,
  editableEquipmentItemCells,
  editableLaborItemCells,
  editableMaterialItemCells,
  editableSubcontractorItemCells,
  equipmentItemAvailableCells,
  getActivityColumns,
  laborItemAvailableCells,
  materialItemAvailableCells,
  subcontractorItemAvailableCells,
} from "./columns";

const ActivityDataGrid = () => {
  const { proposalId, wbsId, phaseId } = useParams();
  const { data, loading } = useActivities({
    currentProposalId: proposalId ?? "",
    currentWbsId: wbsId ?? "",
    currentPhaseId: phaseId ?? "",
  });
  const currentPhase = useCurrentPhase({
    phaseId: phaseId ?? "",
  });
  const [selectedRows, setSelectedRows] = React.useState<GridRowId[]>([]);
  const [columns, setColumns] = React.useState<GridColumns>([]);
  const [openBaseRateDialog, setOpenBaseRateDialog] =
    React.useState<boolean>(false);
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ marginBottom: "0px", borderBottom: "1px solid lightgray" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div>
            <GridToolbarColumnsButton
              sx={{ color: "#424242" }}
              onResize={undefined}
              nonce={undefined}
              onResizeCapture={undefined}
            />
            <GridToolbarDensitySelector
              sx={{ color: "#424242" }}
              onResize={undefined}
              nonce={undefined}
              onResizeCapture={undefined}
            />
            <GridToolbarExport sx={{ color: "#424242" }} />
          </div>
          <Typography variant="h5">
            {currentPhase?.phaseDatabaseName}
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Button
              sx={{ color: "#424242", fontSize: "14px" }}
              onClick={() => {
                let ids: string[] = [];
                selectedRows.map((row) => {
                  ids.push(row.toString());
                });
                deleteActivityBatch(ids);
              }}
              startIcon={<TrashIcon />}
            >
              Delete
            </Button>
            <Divider
              light
              orientation="vertical"
              sx={{
                width: "1px",
                backgroundColor: "lightgray",
                margin: "0px 14px",
              }}
            />
            <Button
              sx={{ color: "#424242", fontSize: "14px" }}
              onClick={() => {
                let ids: string[] = [];
                selectedRows.map((row) => {
                  ids.push(row.toString());
                });
                resetConstantsBatch(ids);
              }}
              startIcon={<RefreshIcon />}
            >
              Quantity / Units
            </Button>
            <Divider
              light
              orientation="vertical"
              sx={{
                width: "1px",
                backgroundColor: "lightgray",
                margin: "0px 14px",
              }}
            />
            <Button
              disabled={selectedRows.length == 0}
              sx={{ color: "#424242", fontSize: "14px" }}
              onClick={() => {
                setOpenBaseRateDialog(true);
              }}
              startIcon={<EditRounded />}
            >
              Base Rate / Subsistence
            </Button>
          </div>
        </div>
      </GridToolbarContainer>
    );
  }

  useEffect(() => {
    let temp = getActivityColumns({
      activities: data,
    });
    setColumns(temp);
  }, [data]);

  return (
    <Box
      sx={{
        height: "100%",
        "& .under": {
          backgroundColor: "#ff525240",
          color: "primary.dark",
        },
        "& .over": {
          backgroundColor: "#ffeb3b40",
          color: "primary.dark",
        },
        "& .not-used": {
          backgroundColor: "#2d2d2d",
          color: "#2d2d2d",
        },
        "& .editable-cell": {
          color: "primary.dark",
        },
      }}
    >
      <StyledDataGrid
        density="compact"
        columns={columns}
        onCellEditCommit={(params, event) => {
          var { id, field, value } = params;
          updateActivity(id.toString(), field, value);
        }}
        rows={data}
        loading={loading}
        pageSize={100}
        onSelectionModelChange={(newSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
        components={{ Toolbar: CustomToolbar }}
        isCellEditable={(params: GridCellParams<number>) => {
          const activity = data.find(
            (activity) => activity.id === params.row.id
          );
          if (activity) {
            if (
              activity.activityType == ActivityType.laborItem ||
              activity.activityType == ActivityType.customLaborItem
            ) {
              if (editableLaborItemCells.includes(params.field)) {
                return true;
              }
              return false;
            }
            if (activity.activityType == ActivityType.materialItem) {
              if (editableMaterialItemCells.includes(params.field)) {
                return true;
              }
              return false;
            }
            if (activity.activityType == ActivityType.equipmentItem) {
              if (editableEquipmentItemCells.includes(params.field)) {
                return true;
              }
              return false;
            }
            if (activity.activityType == ActivityType.costOnlyItem) {
              if (editableCostOnlyItemCells.includes(params.field)) {
                return true;
              }
              return false;
            }
            if (activity.activityType == ActivityType.subContractorItem) {
              if (editableSubcontractorItemCells.includes(params.field)) {
                return true;
              }
              return false;
            }
          }
          return false;
        }}
        getCellClassName={(params: GridCellParams<number>) => {
          const activity = data.find(
            (activity) => activity.id === params.row.id
          );
          if (activity) {
            if (params.field == "__check__") {
              return "";
            }
            if (activity.activityType == ActivityType.laborItem) {
              if (params.field === "craftConstant") {
                if (
                  activity.craftConstant > activity.constant?.craftConstant!
                ) {
                  return "over";
                } else if (
                  activity.craftConstant < activity.constant?.craftConstant!
                ) {
                  return "under";
                }
              } else if (params.field === "welderConstant") {
                if (
                  activity.welderConstant > activity.constant?.weldConstant!
                ) {
                  return "over";
                } else if (
                  activity.welderConstant < activity.constant?.weldConstant!
                ) {
                  return "under";
                }
              }
              if (editableLaborItemCells.includes(params.field)) {
                return "editable-cell";
              }
              if (!laborItemAvailableCells.includes(params.field)) {
                return "not-used";
              }
            }
            if (activity.activityType == ActivityType.equipmentItem) {
              if (editableEquipmentItemCells.includes(params.field)) {
                return "editable-cell";
              }
              if (!equipmentItemAvailableCells.includes(params.field)) {
                return "not-used";
              }
            }
            if (activity.activityType == ActivityType.materialItem) {
              if (editableMaterialItemCells.includes(params.field)) {
                return "editable-cell";
              }
              if (!materialItemAvailableCells.includes(params.field)) {
                return "not-used";
              }
            }
            if (activity.activityType == ActivityType.costOnlyItem) {
              if (editableCostOnlyItemCells.includes(params.field)) {
                return "editable-cell";
              }
              if (!costOnlyItemAvailableCells.includes(params.field)) {
                return "not-used";
              }
            }
            if (activity.activityType == ActivityType.customLaborItem) {
              if (editableLaborItemCells.includes(params.field)) {
                return "editable-cell";
              }
              if (!customLaborItemAvailableCells.includes(params.field)) {
                return "not-used";
              }
            }
            if (activity.activityType == ActivityType.subContractorItem) {
              if (editableSubcontractorItemCells.includes(params.field)) {
                return "editable-cell";
              }
              if (!subcontractorItemAvailableCells.includes(params.field)) {
                return "not-used";
              }
            }
            return "used";
          }
          return "used";
        }}
      />
      <EditBaseRateDialog
        open={openBaseRateDialog}
        onClose={() => setOpenBaseRateDialog(false)}
        selectedRowIds={selectedRows}
      />
    </Box>
  );
};
export default ActivityDataGrid;

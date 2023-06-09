import { ControlPointDuplicate } from "@mui/icons-material";
import TrashIcon from "@mui/icons-material/DeleteForever";
import { Button, Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
  GridCellEditCommitParams,
  GridCellParams,
  GridColumns,
  GridRowId,
  GridSelectionModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import React from "react";
import { useParams } from "react-router-dom";
import {
  deleteActivityBatch,
  getActivitiesForPhase,
  insertActivitiesFromFile,
} from "../../../api/activity";
import {
  deletePhaseBatch,
  duplicatePhases,
  updatePhase,
} from "../../../api/phase";
import { StyledDataGrid } from "../../../components/custom_data_grid";
import { useCurrentPhase } from "../../../hooks/current_phase_hook";
import { Phase } from "../../../models/phase";
import { Wbs } from "../../../models/wbs";

const PhaseDataGrid = ({
  phaseList,
  isLoading,
}: {
  phaseList: Phase[];
  isLoading: boolean;
}) => {
  const [selectedRows, setSelectedRows] = React.useState<GridRowId[]>([]);
  const { proposalId, wbsId, phaseId } = useParams();
  const currentPhase = useCurrentPhase({
    phaseId: phaseId ?? "",
  });
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ marginBottom: "14px", borderBottom: "1px solid lightgray" }}
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
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Button
              color="error"
              sx={{ color: "#424242", fontSize: "14px" }}
              onClick={async () => {
                let ids: string[] = [];
                selectedRows.map((row) => {
                  ids.push(row.toString());
                });
                await duplicatePhases(ids);
              }}
              startIcon={<ControlPointDuplicate />}
            >
              Duplicate
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
              color="error"
              sx={{ color: "#424242", fontSize: "14px" }}
              onClick={async () => {
                let ids: string[] = [];
                selectedRows.map((row) => {
                  ids.push(row.toString());
                });
                ids.forEach(async (id) => {
                  let activityIds: string[] = [];
                  const activities = await getActivitiesForPhase({
                    phaseId: id,
                    proposalId: proposalId ?? "",
                  });
                  activities.forEach((activity) => {
                    activityIds.push(activity.id);
                  });
                  await deleteActivityBatch(activityIds);
                });
                await deletePhaseBatch(ids);
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
          </div>
        </div>
      </GridToolbarContainer>
    );
  }
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
        loading={isLoading}
        columns={columns}
        rows={phaseList}
        pageSize={100}
        onSelectionModelChange={(newSelectionModel: GridSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
        components={{ Toolbar: CustomToolbar }}
        onCellEditCommit={(params: GridCellEditCommitParams, event) => {
          var { id, field, value } = params;
          updatePhase(id.toString(), field, value);
        }}
        isCellEditable={(params: GridCellParams<number>) => {
          if (notEditableCells.includes(params.field)) {
            return false;
          }
          return true;
        }}
        getCellClassName={(params: GridCellParams<number>) => {
          if (!notEditableCells.includes(params.field)) {
            return "editable-cell";
          }
          return "true";
        }}
      />
    </Box>
  );
};

export default PhaseDataGrid;

const columns: GridColumns = [
  {
    field: "phaseNumber",
    headerName: "Phase",
    minWidth: 100,
    editable: true,
    flex: 1,
    headerAlign: "center",
  },
  {
    field: "size",
    headerName: "Size",
    editable: true,
    align: "right",
    flex: 1,
    minWidth: 80,
    headerAlign: "center",
  },
  {
    field: "flc",
    headerName: "FLC",
    editable: true,
    align: "right",
    flex: 1,
    minWidth: 80,
    headerAlign: "center",
  },

  {
    field: "description",
    headerName: "Line / Description",
    editable: true,
    minWidth: 250,
    align: "left",
    flex: 1,
    headerAlign: "center",
  },
  {
    field: "spec",
    headerName: "Spec",
    editable: true,
    minWidth: 80,
    align: "right",
    flex: 1,
    headerAlign: "center",
  },
  {
    field: "insulation",
    headerName: "Insul",
    editable: true,
    minWidth: 80,
    align: "right",
    flex: 1,
    headerAlign: "center",
  },
  {
    field: "insulationSize",
    headerName: "Insl. Size",
    editable: true,
    minWidth: 80,
    align: "right",
    flex: 1,
    headerAlign: "center",
    // hide: hideInslSize,
  },
  {
    field: "sheet",
    headerName: "Sht",
    minWidth: 80,
    editable: true,
    align: "right",
    flex: 1,
    headerAlign: "center",
    // hide: hideSht,
  },
  {
    field: "area",
    headerName: "Area",
    minWidth: 80,
    editable: true,
    align: "right",
    flex: 1,
    headerAlign: "center",
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 80,
    align: "right",
    editable: true,
    flex: 1,
    headerAlign: "center",
  },

  {
    field: "sys",
    headerName: "Sys",
    editable: true,
    align: "right",
    flex: 1,
    minWidth: 80,
    headerAlign: "center",
    // hide: hideSys,
  },

  {
    field: "quantity",
    headerName: "Quantity",
    minWidth: 80,
    align: "right",
    editable: true,
    flex: 1,
    headerAlign: "center",
  },
  {
    field: "unit",
    headerName: "Units",
    minWidth: 80,
    align: "right",
    editable: true,
    flex: 1,
    headerAlign: "center",
  },

  {
    field: "craftManHours",
    headerName: "Craft MH",
    editable: true,
    align: "right",
    flex: 1,
    minWidth: 100,
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${valueFormatted}`;
    },
  },
  {
    field: "craftCost",
    headerName: "Craft Total",
    editable: true,
    minWidth: 120,
    align: "right",
    flex: 1,
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },

  {
    field: "welderManHours",
    headerName: "Welder MH",
    editable: true,
    minWidth: 120,
    align: "right",
    flex: 1,
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${valueFormatted}`;
    },
  },

  {
    field: "welderCost",
    headerName: "Welder Total",
    editable: true,
    minWidth: 120,
    align: "right",
    flex: 1,
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
  {
    field: "materialCost",
    headerName: "Material Total",
    minWidth: 120,
    hide: true,
    editable: true,
    flex: 1,
    align: "right",
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
  {
    field: "equipmentCost",
    headerName: "Equip Total",
    minWidth: 120,
    hide: true,
    editable: true,
    flex: 1,
    align: "right",
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },

  {
    field: "subContractorCost",
    headerName: "Sub Total",
    minWidth: 120,
    hide: true,
    editable: true,
    flex: 1,
    align: "right",
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
  {
    field: "costOnlyCost",
    headerName: "Cost Only Total",
    editable: true,
    minWidth: 120,
    hide: true,
    align: "right",
    flex: 1,
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
  {
    field: "totalCost",
    headerName: "Total",
    minWidth: 120,
    editable: true,
    flex: 1,
    align: "right",
    headerAlign: "center",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }
      const valueFormatted = params.value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      return `$${valueFormatted}`;
    },
  },
];
const notEditableCells = [
  "craftManHours",
  "craftCost",
  "welderManHours",
  "welderCost",
  "materialCost",
  "equipmentCost",
  "subContractorCost",
  "costOnlyCost",
  "totalCost",
];

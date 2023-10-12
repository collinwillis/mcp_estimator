import {EditRounded} from "@mui/icons-material";
import TrashIcon from "@mui/icons-material/DeleteForever";
import RefreshIcon from "@mui/icons-material/Refresh";
import {Button, Divider, Typography} from "@mui/material";
import {Box} from "@mui/system";
import {
    GridCellParams,
    GridColumns,
    GridColumnVisibilityModel,
    GridFilterModel,
    GridRowId,
    GridSortModel,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {deleteActivityBatch, resetConstantsBatch, updateActivity,} from "../../../api/activity";
import {StyledDataGrid} from "../../../components/custom_data_grid";
import EditBaseRateDialog from "../../../components/edit_base_rate_dialog";
import useActivities from "../../../hooks/activity_hook";
import {useCurrentPhase} from "../../../hooks/current_phase_hook";
import {ActivityType} from "../../../models/activity";
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
import DeleteConfirmationDialog from "../../../components/alert_dialog";
import {useUserProfile} from "../../../hooks/user_profile_hook";

const ActivityDataGrid = () => {
    const {proposalId, wbsId, phaseId} = useParams();
    const {data, loading} = useActivities({
        currentProposalId: proposalId ?? "",
        currentWbsId: wbsId ?? "",
        currentPhaseId: phaseId ?? "",
    });
    const currentPhase = useCurrentPhase({
        phaseId: phaseId ?? "",
    });
    const {hasWritePermissions} = useUserProfile();
    const [selectedRows, setSelectedRows] = React.useState<GridRowId[]>([]);
    const [columns, setColumns] = React.useState<GridColumns>([]);
    const [openBaseRateDialog, setOpenBaseRateDialog] =
        React.useState<boolean>(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false); // New state to control delete dialog visibility
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>();
    const [filterModel, setFilterModel] = useState<GridFilterModel>();
    const [sortModel, setSortModel] = React.useState<GridSortModel>();

    useEffect(() => {
        let temp = getActivityColumns({
            activities: data,
            hasWritePermissions: hasWritePermissions
        });
        setColumns(temp);

        // Move the loading of models here to ensure they are applied after columns are set
        const visibilityJSON = localStorage.getItem("activities_visibility");
        const visibilityModel = visibilityJSON ? JSON.parse(visibilityJSON) : {};
        setColumnVisibilityModel(visibilityModel);

        const filterJSON = localStorage.getItem("activities_filter");
        const initialFilterModel = filterJSON ? JSON.parse(filterJSON) : {items: []};
        setFilterModel(initialFilterModel);

        const sortJSON = localStorage.getItem("activities_sort");
        const initialSortModel = sortJSON ? JSON.parse(sortJSON) : [];
        setSortModel(initialSortModel);
    }, [data]);

    const handleDelete = async () => {
        let ids: string[] = [];
        selectedRows.map((row) => {
            ids.push(row.toString());
        });
        await deleteActivityBatch(ids);
        setDeleteDialogOpen(false); // Close the dialog after deletion
    };

    function CustomToolbar() {
        return (
            <GridToolbarContainer
                sx={{marginBottom: "0px", borderBottom: "1px solid lightgray"}}
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
                            sx={{color: "#424242"}}
                            onResize={undefined}
                            nonce={undefined}
                            onResizeCapture={undefined}
                        />
                        <GridToolbarDensitySelector
                            sx={{color: "#424242"}}
                            onResize={undefined}
                            nonce={undefined}
                            onResizeCapture={undefined}
                        />
                    </div>
                    <Typography variant="h5">
                        {currentPhase?.phaseDatabaseName}
                    </Typography>
                    {hasWritePermissions && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                disabled={selectedRows == null || selectedRows.length <= 0}
                                sx={{color: "#424242", fontSize: "14px"}}
                                onClick={() => setDeleteDialogOpen(true)} // Open delete confirmation dialog
                                startIcon={<TrashIcon/>}
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
                                disabled={selectedRows == null || selectedRows.length <= 0}
                                sx={{color: "#424242", fontSize: "14px"}}
                                onClick={() => {
                                    let ids: string[] = [];
                                    selectedRows.map((row) => {
                                        ids.push(row.toString());
                                    });
                                    resetConstantsBatch(ids);
                                }}
                                startIcon={<RefreshIcon/>}
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
                                sx={{color: "#424242", fontSize: "14px"}}
                                onClick={() => {
                                    setOpenBaseRateDialog(true);
                                }}
                                startIcon={<EditRounded/>}
                            >
                                Base Rate / Subsistence
                            </Button>
                        </div>
                    )}
                </div>
            </GridToolbarContainer>
        );
    }

    useEffect(() => {
        let temp = getActivityColumns({
            activities: data,
            hasWritePermissions: hasWritePermissions,
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
                    textDecoration: "line-through",
                    backgroundColor: "#f0f0f0", // or use 'transparent'
                    color: "#d0d0d0", // Light grey to indicate it's disabled, or use 'transparent' to hide the text
                    fontStyle: "italic", // Optional, to make it distinct that it's not active or in use
                },
                "& .editable-cell": {
                    color: "primary.dark",
                },
            }}
        >
            <StyledDataGrid
                sortModel={sortModel}
                onSortModelChange={(newModel) => {
                    localStorage.setItem("activities_sort", JSON.stringify(newModel));
                    setSortModel(newModel);
                }}
                filterModel={filterModel}
                onFilterModelChange={(newModel) => {
                    localStorage.setItem("activities_filter", JSON.stringify(newModel));
                    setFilterModel(newModel);
                }}

                density="compact"
                columns={columns}
                onCellEditCommit={(params, event) => {
                    var {id, field, value} = params;
                    updateActivity(id.toString(), field, value);
                }}
                rows={data}
                loading={loading}
                pageSize={100}
                onSelectionModelChange={(newSelectionModel) => {
                    setSelectedRows(newSelectionModel);
                }}
                components={{Toolbar: CustomToolbar}}
                isCellEditable={(params: GridCellParams<number>) => {
                    if (!hasWritePermissions) {
                        return false;
                    }
                    const activity = data.find((activity) => activity.id === params.row.id);
                    if (!activity) return false;
                    const editableCellsMap: Record<string, string[]> = {
                        [ActivityType.laborItem]: editableLaborItemCells,
                        [ActivityType.customLaborItem]: editableLaborItemCells,
                        [ActivityType.materialItem]: editableMaterialItemCells,
                        [ActivityType.equipmentItem]: editableEquipmentItemCells,
                        [ActivityType.costOnlyItem]: editableCostOnlyItemCells,
                        [ActivityType.subContractorItem]: editableSubcontractorItemCells,
                    };
                    return editableCellsMap[activity.activityType]?.includes(params.field) || false;
                }}
                getCellClassName={(params: GridCellParams<number>) => {
                    if (!hasWritePermissions) { // Check if the user has write permissions
                        return ''; // Return an empty string to not apply any additional styling
                    }
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
            <DeleteConfirmationDialog
                title="Are you sure you want to delete the selected activity?"
                content="Once deleted, this activity cannot be recovered."
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete} // Delete activities when confirmed
            />
        </Box>
    );
};
export default ActivityDataGrid;

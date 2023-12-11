import {Button} from "@mui/material";
import {Box} from "@mui/system";
import {
    GridCellEditCommitParams,
    GridCellParams,
    GridColumns,
    GridRowId,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridValueFormatterParams,
} from "@mui/x-data-grid";
import React from "react";
import {useParams} from "react-router-dom";
import {updateWbs} from "../../../api/wbs";
import {StyledDataGrid} from "../../../components/custom_data_grid";
import {useWbs} from "../../../hooks/wbs_hook";
import {Wbs} from "../../../models/wbs";
import {useProposalPreferences} from "../../../hooks/proposal_preferences_hook";
import ExportMenu from "./export_menu";
import {useUserProfile} from "../../../hooks/user_profile_hook";

const WbsDataGrid = ({
                         openSelectWbsDialog,
                     }: {
    openSelectWbsDialog: () => void;
}) => {
    const {proposalId, wbsId, phaseId} = useParams();
    const {data, loading} = useWbs({currentProposalId: proposalId ?? ""});
    const proposalPreferences = useProposalPreferences(proposalId ?? "");
    const [selectedRows, setSelectedRows] = React.useState<GridRowId[]>([]);

    const {hasWritePermissions} = useUserProfile();

    function CustomToolbar() {
        return (
            <GridToolbarContainer
                sx={{marginBottom: "14px", borderBottom: "1px solid lightgray"}}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 15,
                    }}>
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
                        <ExportMenu proposalId={proposalId!} proposalPreferences={proposalPreferences!}/>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                        }}
                    >
                        <Button sx={{color: "#424242"}} onClick={openSelectWbsDialog}>
                            WBS Select
                        </Button>
                    </div>
                </div>
            </GridToolbarContainer>
        );
    }

    return (
        <Box
            sx={{
                height: "80%",
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
                    color: "blue",
                },
            }}
        >
            <StyledDataGrid
                loading={loading}
                columns={columns}
                rows={data}
                pageSize={100}
                onSelectionModelChange={(newSelectionModel) => {
                    setSelectedRows(newSelectionModel);
                }}
                components={{Toolbar: CustomToolbar}}
                onCellEditCommit={(params: GridCellEditCommitParams, event) => {
                    var {id, field, value} = params;
                    updateWbs(id.toString(), field, value);
                }}
                isCellEditable={(params: GridCellParams<number>) => {
                    if (!hasWritePermissions) {
                        return false;
                    }
                    if (notEditableCells.includes(params.field)) {
                        return false;
                    }
                    return true;
                }}
                getCellClassName={(params: GridCellParams<number>) => {
                    if (notEditableCells.includes(params.field)) {
                        return "";
                    } else {
                        return "editable-cell";
                    }
                }}
            />

        </Box>
    );
};

export default WbsDataGrid;

const columns: GridColumns = [
    {
        field: "name",
        headerName: "Wbs",
        minWidth: 100,
        editable: false,
        flex: 1,
        headerAlign: "center",
    },

    {
        field: "quantity",
        headerName: "Quantity",
        minWidth: 80,
        align: "right",
        flex: 1,
        headerAlign: "center",
        editable: false,
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
        field: "unit",
        headerName: "Units",
        minWidth: 80,
        align: "right",
        flex: 1,
        headerAlign: "center",
        editable: false,
    },

    {
        field: "craftManHours",
        headerName: "Craft MH",
        editable: false,
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
        editable: false,
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
            return `$${valueFormatted}`;
        },
    },

    {
        field: "welderManHours",
        headerName: "Welder MH",
        editable: false,
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
        editable: false,
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
            return `$${valueFormatted}`;
        },
    },
    {
        field: "materialCost",
        headerName: "Material Total",
        minWidth: 120,
        hide: true,
        editable: false,
        flex: 1,
        align: "right",
        headerAlign: "center",
        valueFormatter: (params: GridValueFormatterParams<number>) => {
            if (params.value == null) {
                return "";
            }
            const valueFormatted = params.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return `$${valueFormatted}`;
        },
    },
    {
        field: "equipmentCost",
        headerName: "Equip Total",
        minWidth: 120,
        hide: true,
        editable: false,
        flex: 1,
        align: "right",
        headerAlign: "center",
        valueFormatter: (params: GridValueFormatterParams<number>) => {
            if (params.value == null) {
                return "";
            }
            const valueFormatted = params.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return `$${valueFormatted}`;
        },
    },

    {
        field: "subContractorCost",
        headerName: "Sub Total",
        minWidth: 120,
        hide: true,
        editable: false,
        flex: 1,
        align: "right",
        headerAlign: "center",
        valueFormatter: (params: GridValueFormatterParams<number>) => {
            if (params.value == null) {
                return "";
            }
            const valueFormatted = params.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return `$${valueFormatted}`;
        },
    },
    {
        field: "costOnlyCost",
        headerName: "Cost Only Total",
        editable: false,
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
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return `$${valueFormatted}`;
        },
    },
    {
        field: "totalCost",
        headerName: "Total",
        minWidth: 120,
        editable: false,
        flex: 1,
        align: "right",
        headerAlign: "center",
        valueFormatter: (params: GridValueFormatterParams<number>) => {
            if (params.value == null) {
                return "";
            }
            const valueFormatted = params.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
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

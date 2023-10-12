import {MenuItem, Select} from "@mui/material";
import {GridColumns, GridValueFormatterParams} from "@mui/x-data-grid";
import {updateEquipmentOwnership, updateEquipmentUnit,} from "../../../api/activity";
import {Activity, ActivityType} from "../../../models/activity";
import {EquipmentOwnership, EquipmentUnit} from "../../../models/equipment";

export const getActivityColumns = ({
                                       activities,
                                       hasWritePermissions
                                   }: {
    activities: Activity[];
    hasWritePermissions: boolean;
}) => {
    let hasEquipment = false;
    let hasMaterial = false;
    let hasSubcontractor = false;
    let hasCostOnly = false;
    let baseColumns: GridColumns = [
        {
            field: "rowId",
            headerName: "Row",
            minWidth: 80,
            editable: false,
            flex: 1,
            headerAlign: "center",
            align: 'center',
            sortComparator: comparator,
        },
        {
            field: "description",
            headerName: "Description",
            minWidth: 250,
            editable: true,
            flex: 1,
            headerAlign: "center",
        },
        {
            field: "quantity",
            headerName: "Quantity",
            editable: true,
            align: "right",
            flex: 1,
            minWidth: 100,
            headerAlign: "center",
        },
        {
            field: "unit",
            renderCell: (params) => {
                const fullActivity = activities.find(
                    (activity) => activity.id === params.id
                );
                if (fullActivity?.activityType == ActivityType.equipmentItem) {
                    return (
                        <Select
                            disabled={!hasWritePermissions}
                            sx={{
                                width: "100%",
                                flex: 1,
                                minWidth: 50,
                                color: "primary.dark",
                                boxShadow: "none",
                                ".MuiOutlinedInput-notchedOutline": {border: 0},
                                "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                    {
                                        border: 0,
                                    },
                                "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                        border: 0,
                                    },
                            }}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={fullActivity.unit}
                            onChange={(event) =>
                                updateEquipmentUnit({
                                    activity: fullActivity,
                                    unit: event.target.value,
                                })
                            }
                        >
                            <MenuItem value={EquipmentUnit.hours}>
                                {EquipmentUnit.hours}
                            </MenuItem>
                            <MenuItem value={EquipmentUnit.days}>
                                {EquipmentUnit.days}
                            </MenuItem>
                            <MenuItem value={EquipmentUnit.weeks}>
                                {EquipmentUnit.weeks}
                            </MenuItem>
                            <MenuItem value={EquipmentUnit.months}>
                                {EquipmentUnit.months}
                            </MenuItem>
                        </Select>
                    );
                }
            },
            headerName: "Unit",
            editable: true,
            align: "right",
            flex: 1,
            minWidth: 150,
            headerAlign: "center",
        },

        {
            field: "craftConstant",
            headerName: "Craft Const.",
            editable: true,
            minWidth: 120,
            align: "right",
            flex: 1,
            headerAlign: "center",
        },
        {
            field: "craftManHours",
            headerName: "Craft Hours",
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
            field: "welderConstant",
            headerName: "Welder Const.",
            editable: true,
            minWidth: 120,
            align: "right",
            flex: 1,
            headerAlign: "center",
        },

        {
            field: "welderManHours",
            headerName: "Welder Hours",
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
            field: "craftCost",
            headerName: "Craft Total",
            minWidth: 120,
            align: "right",
            editable: true,
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
            field: "welderCost",
            headerName: "Welder Total",
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
            field: "craftBaseRate",
            headerName: "Craft Base",
            minWidth: 120,
            flex: 1,
            align: "right",
            headerAlign: "center",
            valueFormatter: (params: GridValueFormatterParams<number>) => {
                if (params.value == null) {
                    return "";
                }
                const valueFormatted = Number(params.value).toLocaleString();
                return `$${valueFormatted}`;
            },
            hide: true,
        },
        {
            field: "subsistenceRate",
            headerName: "Subsistence",
            minWidth: 120,
            flex: 1,
            align: "right",
            headerAlign: "center",
            valueFormatter: (params: GridValueFormatterParams<number>) => {
                if (params.value == null) {
                    return "";
                }
                const valueFormatted = Number(params.value).toLocaleString();
                return `$${valueFormatted}`;
            },
            hide: true,
        },
        {
            field: "totalCost",
            headerName: "Total",
            minWidth: 120,
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
    activities.map((activity) => {
        if (activity.activityType == ActivityType.equipmentItem) {
            hasEquipment = true;
        }
        if (activity.activityType == ActivityType.materialItem) {
            hasMaterial = true;
        }
        if (activity.activityType == ActivityType.costOnlyItem) {
            hasCostOnly = true;
        }
        if (activity.activityType == ActivityType.subContractorItem) {
            hasSubcontractor = true;
        }
    });
    if (hasEquipment) {
        baseColumns.splice(baseColumns.length - 2, 0, {
            field: "equipmentCost",
            headerName: "Equipment Total",
            minWidth: 120,
            align: "right",
            editable: true,
            hide: false,
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
        });
        baseColumns.splice(1, 0, {
            field: "equipmentOwnership",
            renderCell: (params) => {
                const fullActivity = activities.find(
                    (activity) => activity.id === params.id
                );
                if (fullActivity?.activityType == ActivityType.equipmentItem) {
                    return (
                        <Select
                            disabled={!hasWritePermissions}
                            sx={{
                                width: "100%",
                                flex: 1,
                                minWidth: 50,
                                color: "primary.dark",
                                boxShadow: "none",
                                ".MuiOutlinedInput-notchedOutline": {border: 0},
                                "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                    {
                                        border: 0,
                                    },
                                "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                        border: 0,
                                    },
                            }}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={
                                fullActivity.equipmentOwnership ?? EquipmentOwnership.rental
                            }
                            onChange={(event) =>
                                updateEquipmentOwnership({
                                    activity: fullActivity,
                                    ownership: event.target.value,
                                })
                            }
                        >
                            <MenuItem value={EquipmentOwnership.rental}>
                                {EquipmentOwnership.rental}
                            </MenuItem>
                            <MenuItem value={EquipmentOwnership.owned}>
                                {EquipmentOwnership.owned}
                            </MenuItem>
                        </Select>
                    );
                }
            },
            headerName: "Ownership",
            editable: true,
            align: "right",
            flex: 1,
            minWidth: 150,
            headerAlign: "center",
        });
    }
    if (hasMaterial) {
        baseColumns.splice(baseColumns.length - 2, 0, {
            field: "materialCost",
            headerName: "Material Total",
            minWidth: 120,
            align: "right",
            editable: true,
            hide: false,
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
        });
    }
    if (hasCostOnly) {
        baseColumns.splice(baseColumns.length - 2, 0, {
            field: "costOnlyCost",
            headerName: "Cost Only Total",
            minWidth: 120,
            hide: false,
            flex: 1,
            editable: true,
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
        });
    }
    if (hasSubcontractor) {
        let hasMaterialColumn = false;
        let hasEquipmentColumn = false;
        baseColumns.forEach((column) => {
            if (column.field == "materialCost") {
                hasMaterialColumn = true;
            }
            if (column.field == "equipmentCost") {
                hasEquipmentColumn = true;
            }
        });
        if (!hasMaterialColumn) {
            baseColumns.splice(baseColumns.length - 1, 0, {
                field: "materialCost",
                headerName: "Material Total",
                minWidth: 120,
                align: "right",
                editable: true,
                hide: false,
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
            });
        }
        if (!hasEquipmentColumn) {
            baseColumns.splice(baseColumns.length - 1, 0, {
                field: "equipmentCost",
                headerName: "Equipment Total",
                minWidth: 120,
                align: "right",
                editable: true,
                hide: false,
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
            });
        }
        baseColumns.splice(baseColumns.length - 1, 0, {
            field: "subContractorCost",
            headerName: "Subcontractor Total",
            minWidth: 120,
            align: "right",
            hide: false,
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
        });
    }
    if (hasCostOnly || hasEquipment || hasMaterial) {
        baseColumns.splice(3, 0, {
            field: "price",
            headerName: "Price",
            editable: true,
            hide: false,
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
                return `$${valueFormatted}`;
            },
        });
    }
    if (hasEquipment || hasSubcontractor) {
        baseColumns.splice(3, 0, {
            field: "time",
            headerName: "Duration",
            editable: true,
            align: "right",
            hide: false,
            flex: 1,
            minWidth: 100,
            headerAlign: "center",
        });
    }
    return baseColumns;
};

export const laborItemAvailableCells = [
    "rowId",
    "description",
    "quantity",
    "unit",
    "craftConstant",
    "welderConstant",
    "craftManHours",
    "welderManHours",
    "craftCost",
    "welderCost",
    "totalCost",
    "craftBaseRate",
    "subsistenceRate",
];

export const materialItemAvailableCells = [
    "rowId",
    "description",
    "quantity",
    "price",
    "materialCost",
    "totalCost",
    "unit",
    "craftBaseRate",
    "subsistenceRate",
];

export const equipmentItemAvailableCells = [
    "rowId",
    "description",
    "quantity",
    "price",
    "time",
    "unit",
    "equipmentCost",
    "totalCost",
    "craftBaseRate",
    "subsistenceRate",
    "equipmentOwnership",
];

export const costOnlyItemAvailableCells = [
    "rowId",
    "quantity",
    "description",
    "price",
    "costOnlyCost",
    "totalCost",
    "craftBaseRate",
    "subsistenceRate",
];

export const subcontractorItemAvailableCells = [
    "rowId",
    "quantity",
    "description",
    "time",
    "unit",
    "equipmentCost",
    "materialCost",
    "craftCost",
    "subContractorCost",
    "totalCost",
    "craftBaseRate",
    "subsistenceRate",
];

export const customLaborItemAvailableCells = [
    "rowId",
    "description",
    "quantity",
    "unit",
    "craftConstant",
    "welderConstant",
    "craftManHours",
    "welderManHours",
    "craftCost",
    "welderCost",
    "totalCost",
    "craftBaseRate",
    "subsistenceRate",
];

export const editableLaborItemCells = [
    "description",
    "quantity",
    "unit",
    "craftConstant",
    "welderConstant",
];

export const editableEquipmentItemCells = [
    "description",
    "quantity",
    "price",
    "time",
    "unit",
    "equipmentOwnership",
];

export const editableMaterialItemCells = [
    "description",
    "quantity",
    "price",
    "unit",
];
export const editableCostOnlyItemCells = ["quantity", "description", "price"];
export const editableSubcontractorItemCells = [
    "quantity",
    "description",
    "time",
    "unit",
    "equipmentCost",
    "materialCost",
    "craftCost",
];

const comparator = (v1: String, v2: String) => {
    const lengthDifference = v1.length - v2.length;
    if (lengthDifference !== 0) return lengthDifference;
    if (v1 < v2) return -1;
    if (v1 > v2) return 1;
    return 0;
};

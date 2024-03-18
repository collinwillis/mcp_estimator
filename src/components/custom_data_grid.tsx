import {styled} from "@mui/material";
import {DataGridPro} from "@mui/x-data-grid-pro";

export const StyledDataGrid = styled(DataGridPro)(({theme}) => ({
    border: 0,
    color: "rgba(0,0,0,.85)",
    fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
    ].join(","),
    WebkitFontSmoothing: "auto",
    letterSpacing: "normal",
    "& .MuiDataGrid-columnsContainer": {
        backgroundColor: "#fafafa",
    },
    "& .MuiPaginationItem-root": {
        backgroundColor: "blue",
        borderRadius: 0,
    },
    "& .MuiDataGrid-columnHeader, .MuiDataGrid-cell": {
        borderRight: "1px solid #e0e0e0",
    },
    "& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell": {
        borderBottom: "1px solid  #e0e0e0",
    },
    "& .MuiDataGrid-cell": {
        color: "rgba(0,0,0,.85)",
    },
    // ...CustomCheckBox(),
}));

function CustomCheckBox() {
    return {
        "& .MuiCheckbox-root svg": {
            width: 16,
            height: 16,
            backgroundColor: "transparent",
            border: "1px solid #d9d9d9",
            borderRadius: 2,
        },
        "& .MuiCheckbox-root svg path": {
            display: "none",
        },
        "& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg": {
            backgroundColor: "#1890ff",
            borderColor: "#1890ff",
        },
        "& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after": {
            position: "absolute",
            display: "table",
            border: "2px solid #fff",
            borderTop: 0,
            borderLeft: 0,
            transform: "rotate(45deg) translate(-50%,-50%)",
            opacity: 1,
            transition: "all .2s cubic-bezier(.12,.4,.29,1.46) .1s",
            content: '""',
            top: "50%",
            left: "39%",
            width: 5.71428571,
            height: 9.14285714,
        },
        "& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after":
            {
                width: 8,
                height: 8,
                backgroundColor: "#1890ff",
                transform: "none",
                top: "39%",
                border: 0,
            },
    };
}


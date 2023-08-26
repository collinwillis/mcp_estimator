import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {ProposalPreferences} from "../../../models/proposal_preferences";
import TrashIcon from "@mui/icons-material/DeleteForever";
import ExportIcon from "@mui/icons-material/SaveAlt";
import {fetchDD} from "../../../api/data_dump";
import {Backdrop, CircularProgress} from "@mui/material";

interface ExportMenuProps {
    proposalId: string,
    proposalPreferences: ProposalPreferences,
}
export default function ExportMenu({proposalId, proposalPreferences}: ExportMenuProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                sx={{ color: "#424242", fontSize: "14px" }}
                onClick={handleClick}
                startIcon={<ExportIcon />}
            >
                Data Dump
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem  onClick={async () => {
                    setLoading(true);
                    await fetchDD(proposalId!, proposalPreferences!);
                    setLoading(false);
                }}>WBS Cost Report</MenuItem>
            </Menu>
           <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

        </div>
    );
}

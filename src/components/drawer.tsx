import {AdminPanelSettings, ArrowBack, ContentCopy, EditRounded, ExitToApp, Settings} from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import {Breadcrumbs, Button, Link, ListItemIcon, ListItemText, Stack} from "@mui/material";
import MuiAppBar, {AppBarProps as MuiAppBarProps} from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {styled, useTheme} from "@mui/material/styles";
import * as React from "react";
import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import AddProposalDialog from "../features/home/components/add_proposal_dialog";
import ProposalList from "../features/home/components/proposal_list";
import {useCurrentPhase} from "../hooks/current_phase_hook";
import {useCurrentProposal} from "../hooks/current_proposal_hook";
import {useCurrentWbs} from "../hooks/current_wbs_hook";
import {Phase} from "../models/phase";
import {Proposal} from "../models/proposal";
import {Wbs} from "../models/wbs";
import AddPhaseButton from "./add_phase_button";
import AddPhaseDialog from "./add_phase_dialog";
import PhaseList from "./phase_list";
import WbsDropdown from "./wbs_drop_down";
import {auth} from "../setup/config/firebase";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from "@mui/icons-material/Add";
import {useUserProfile} from "../hooks/user_profile_hook";
import DrawerIcon from "./drawer_icon";
import EditProposalsDialog from "../features/home/components/edit_proposals_dialog";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import {useProposals} from "../hooks/proposals_hook";

const drawerWidth = 300;
const appBar = document.querySelector("header.MuiAppBar-root");
const Main = styled("main", {shouldForwardProp: (prop) => prop !== "open"})<{
    open?: boolean;
    proposalId?: string;
}>(({theme, open, proposalId}) => ({
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    height: `100vh`,
    flexGrow: 1,
    padding: proposalId ? theme.spacing(3) : 0,
    transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({theme, open}) => ({
    backgroundColor: "#007AFF",
    transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled("div")(({theme}) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}));

interface EstimatorDrawerProps {
    children: React.ReactNode;
}

export default function EstimatorDrawer({children}: EstimatorDrawerProps) {
    const {isAdmin, hasWritePermissions} = useUserProfile();
    const theme = useTheme();
    const [addProposalDialogOpen, setAddProposalDialogOpen] =
        React.useState(false);
    const [selectedProposal, setSelectedProposal] =
        React.useState<Proposal | null>(null);
    const [selectedWbs, setSelectedWbs] = React.useState<Wbs>();
    const {proposalId, wbsId, phaseId} = useParams();
    const [open, setOpen] = React.useState(proposalId === undefined);

    const [addPhaseDialogOpen, setAddPhaseDialogOpen] = React.useState(false);

    const currentProposal = useCurrentProposal({
        proposalId: proposalId ?? "",
    });
    const currentWbs: Wbs | undefined = useCurrentWbs({
        wbsId: wbsId ?? "",
    });
    const currentPhase: Phase | undefined = useCurrentPhase({
        phaseId: phaseId ?? "",
    });

    const {data, loading} = useProposals();

    // State for search input
    const [proposalSearchInput, setProposalSearchInput] = useState('');

// Function to filter proposals based on search input
    const filteredProposals: Proposal[] = data?.filter(proposal => {
        // Assuming 'proposal' has a property like 'name' or 'description' to search
        // Adjust the property according to your proposal object structure
        const searchKey = proposalSearchInput.toLowerCase();
        return proposal?.proposalDescription?.toLowerCase().includes(searchKey) ||
            proposal?.proposalNumber?.toString().includes(searchKey);
    }) || [];

    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [proposalMenuOpen, setProposalMenuOpen] = React.useState(false);
    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };
    const navigate = useNavigate();

    const [isEditProposals, setIsEditProposals] = React.useState<boolean>(false);

    // New state for managing the menu's open/close state
    const [mainMenuAnchorEl, setMainMenuAnchorEl] = React.useState<null | HTMLElement>(null);

    // Corrected function to handle menu open
    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMainMenuAnchorEl(event.currentTarget);
    };

    // Corrected function to handle menu close
    const handleMenuClose = () => {
        setMainMenuAnchorEl(null);
    };

    return (
        <Box sx={{display: "flex", overflow: "hidden"}}>
            <CssBaseline/>
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{mr: 2, ...(open && {display: "none"})}}
                    >
                        <DrawerIcon color={'white'}/>
                    </IconButton>

                    <Breadcrumbs aria-label="breadcrumb" aria-activedescendant="">
                        {currentProposal && (
                            <Link
                                underline="hover"
                                color={currentWbs ? "inherit" : "white"}
                                onClick={() => navigate("/proposal/" + currentProposal?.id)}
                            >
                                {currentProposal?.proposalNumber + " - " + currentProposal?.proposalDescription}
                            </Link>
                        )}
                        {currentWbs && (
                            <Link
                                underline="hover"
                                color={currentPhase ? "inherit" : "white"}
                                onClick={() =>
                                    navigate(
                                        "/proposal/" +
                                        currentProposal?.id +
                                        "/wbs/" +
                                        currentWbs?.id
                                    )
                                }
                            >
                                {currentWbs?.name}
                            </Link>
                        )}
                        {currentPhase && (
                            <Link
                                underline="hover"
                                color="white"
                                onClick={() =>
                                    navigate(
                                        "/proposal/" +
                                        currentProposal?.id +
                                        "/wbs/" +
                                        currentWbs?.id +
                                        "phase/" +
                                        currentPhase?.id
                                    )
                                }
                            >
                                {currentPhase.phaseNumber + " - " + currentPhase.description}
                            </Link>
                        )}
                    </Breadcrumbs>
                    <IconButton
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenuOpen}
                        edge="end"
                        sx={{ml: 'auto'}}  // Adjust the margin to position the button on the right
                    >
                        <MenuIcon/>
                    </IconButton>

                    {/* New Menu for admin console and logout options */}
                    <Menu
                        anchorEl={mainMenuAnchorEl}
                        open={Boolean(mainMenuAnchorEl)}
                        onClose={handleMenuClose}
                    >
                        {isAdmin && (
                            <MenuItem onClick={() => {
                                handleMenuClose();
                                navigate("/admin");
                            }}>
                                <ListItemIcon>
                                    <AdminPanelSettings fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText primary="Admin Console"/>
                            </MenuItem>
                        )}
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                auth.signOut();
                            }}
                            sx={{color: 'red'}}  // This line changes the text color to red
                        >
                            <ListItemIcon>
                                <ExitToApp fontSize="small" sx={{color: 'inherit'}}/>
                            </ListItemIcon>
                            <ListItemText primary="Logout"/>
                        </MenuItem>
                    </Menu>
                </Toolbar>

            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    zIndex: 999,

                    "& .MuiDrawer-paper": {
                        backgroundColor: "#FBFBFB",
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        {proposalId && currentProposal && (
                            <IconButton onClick={() => navigate("/")}>
                                <ArrowBack/>
                            </IconButton>
                        )}
                        {proposalId && currentProposal && (
                            <Typography
                                onClick={() => navigate("/proposal/" + currentProposal?.id)}
                                sx={{
                                    alignSelf: "center",
                                    textAlign: "center",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    color: "primary.main",
                                    cursor: "pointer",
                                    width: "100%",
                                    ":hover": {
                                        color: "primary.dark",
                                    },
                                }}
                                variant="h5"
                            >
                                {currentProposal?.proposalDescription}
                            </Typography>
                        )}
                        {proposalId && currentProposal && (
                            <IconButton
                                onClick={handleDrawerClose}
                                sx={{
                                    alignSelf: "flex-end",
                                    textAlign: "flex-end",
                                    marginLeft: "auto",
                                }}
                            >
                                {theme.direction === "ltr" ? (
                                    <ChevronLeftIcon/>
                                ) : (
                                    <ChevronRightIcon/>
                                )}
                            </IconButton>
                        )}
                        {!proposalId && !currentProposal && (
                            <Box sx={{display: 'flex', width: '100%'}}>
                                <Typography
                                    variant="h6"
                                    color="inherit"
                                    component="div"
                                    sx={{
                                        flexGrow: 1,
                                        textAlign: 'center',
                                        justifySelf: 'center',
                                        alignSelf: 'center'
                                    }}
                                >
                                    {!proposalId && "MCP Estimator"}
                                </Typography>
                                {!proposalId && !currentProposal && hasWritePermissions &&
                                    <Box sx={{marginLeft: 'auto'}}>
                                        <IconButton
                                            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                                        >
                                            <Settings/>
                                        </IconButton>
                                    </Box>
                                }
                            </Box>
                        )}


                    </div>
                    <ProposalMenu anchorEl={menuAnchorEl} setAnchorEl={setMenuAnchorEl}
                                  openAddProposalDialog={() => setAddProposalDialogOpen(true)}
                                  onEditClicked={() => setIsEditProposals(true)}/>

                </DrawerHeader>

                <Divider/>
                {proposalId == null && (
                    <Box sx={{padding: '16px'}}> {/* Adjust padding as needed */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small" // Makes the TextField slightly smaller
                            placeholder="Search Proposals..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon/>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                // Adjust TextField styles
                                '.MuiOutlinedInput-root': {
                                    borderRadius: '20px', // Rounded corners
                                    height: '40px', // Adjust the height as needed
                                    '.MuiInputBase-input': {
                                        height: '20px', // Adjust the input field height
                                        padding: '10px 14px', // Adjust padding for proper alignment
                                    }
                                }
                            }}
                            value={proposalSearchInput}
                            onChange={(e) => setProposalSearchInput(e.target.value)}
                        />

                    </Box>
                )}
                {proposalId == null && (
                    <>
                        <Divider sx={{}}/>
                        <Box sx={{height: "calc(100% - 64px)", overflowY: "auto"}}>
                            <ProposalList
                                onClick={(proposal: Proposal) => setSelectedProposal(proposal)}
                                proposals={filteredProposals}
                            />
                        </Box>
                    </>

                )}

                {proposalId != null && (
                    <Stack direction={"column"}>
                        <Button
                            onClick={() => navigate("/proposal/" + currentProposal?.id)}
                            disabled={wbsId == null}
                            disableElevation={true}
                            color="secondary"
                            sx={{
                                height: "50px",
                                width: "100%",
                                borderRadius: 0,
                            }}
                        >
                            <Typography>Proposal Home</Typography>
                        </Button>
                        <Button
                            onClick={() =>
                                navigate(
                                    "/proposal/" + currentProposal?.id + "/wbs/" + currentWbs?.id
                                )
                            }
                            disabled={phaseId == null}
                            disableElevation={true}
                            color="secondary"
                            sx={{
                                height: "50px",
                                width: "100%",

                                borderRadius: 0,
                            }}
                        >
                            <Typography>WBS Home</Typography>
                        </Button>
                        <WbsDropdown/>
                    </Stack>
                )}
                {wbsId != null && (
                    <Box
                        sx={{
                            pt: "10px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            w: "100%",
                            alignItems: "center",
                            justifyItems: "center",
                        }}
                    >
                        {hasWritePermissions && (
                            <AddPhaseButton
                                toggleAddDialog={() => setAddPhaseDialogOpen(true)}
                            />
                        )}
                    </Box>
                )}
                {wbsId != null && (
                    <Box sx={{height: "calc(100% - 64px)", overflowY: "auto"}}>
                        <>
                            <PhaseList onClick={(_) => {
                            }}/>
                        </>
                    </Box>
                )}
            </Drawer>

            <Main open={open} proposalId={proposalId}>
                <DrawerHeader/>
                {children}
            </Main>
            <AddProposalDialog
                open={addProposalDialogOpen}
                toggleAddDialog={() => setAddProposalDialogOpen(!addProposalDialogOpen)}
            />
            {wbsId != undefined && (
                <AddPhaseDialog
                    open={addPhaseDialogOpen}
                    onClose={() => setAddPhaseDialogOpen(false)}
                />
            )}
            <EditProposalsDialog
                open={isEditProposals}
                onClose={() => setIsEditProposals(false)}
                onDelete={() => {
                }}
            />
        </Box>
    );
}

interface ProposalMenuProps {
    anchorEl: null | HTMLElement;
    setAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
    openAddProposalDialog: () => void;
    onEditClicked: () => void;
}

const ProposalMenu: React.FC<ProposalMenuProps> = ({anchorEl, setAnchorEl, openAddProposalDialog, onEditClicked}) => {
    const open = Boolean(anchorEl);

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
        >
            <MenuItem sx={{gap: 2}} onClick={() => {
                handleClose();
                openAddProposalDialog();
            }}>
                <AddIcon>
                    <ContentCopy fontSize="small"/>
                </AddIcon>
                <ListItemText>Add</ListItemText>
            </MenuItem>
            <MenuItem sx={{gap: 2}} disabled={false} onClick={() => {
                handleClose();
                onEditClicked();
            }}>
                <EditRounded>
                    <ContentCopy fontSize="small"/>
                </EditRounded>
                <ListItemText>Edit</ListItemText>
            </MenuItem>
        </Menu>
    );
}

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Button,
  Link,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  AdminPanelSettings,
  ArrowBack,
  ExpandMore,
  ExitToApp,
  Settings,
  EditRounded,
  ContentCopy,
  AddRounded,
  DownloadForOffline,
  ChevronLeftRounded,
  ChevronRightRounded,
  SearchRounded,
  MenuRounded,
} from '@mui/icons-material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import { HStack } from '@chakra-ui/react';

import WbsDropdown from './wbs_drop_down';
import PhaseList from './phase_list';
import DrawerIcon from './drawer_icon';
import AddPhaseDialog from './add_phase_dialog';
import AddPhaseButton from './add_phase_button';
import { StoreState, estimatorStore } from '../utils/store';
import { auth } from '../setup/config/firebase';
import { Wbs } from '../models/wbs';
import { Proposal } from '../models/proposal';
import { Phase } from '../models/phase';
import { useUserProfile } from '../hooks/user_profile_hook';
import { useProposals } from '../hooks/proposals_hook';
import { useCurrentWbs } from '../hooks/current_wbs_hook';
import { useCurrentProposal } from '../hooks/current_proposal_hook';
import { useCurrentPhase } from '../hooks/current_phase_hook';
import ProposalList from '../features/home/components/proposal_list';
import EditProposalsDialog from '../features/home/components/edit_proposals_dialog';
import AddProposalDialog from '../features/home/components/add_proposal_dialog';

const drawerWidth = 300;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
  proposalId?: string;
}>(({ theme, open, proposalId }) => ({
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
  height: `100vh`,
  flexGrow: 1,
  padding: proposalId ? theme.spacing(0) : 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
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
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  backgroundColor: '#067cc1',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface EstimatorDrawerProps {
  children: React.ReactNode;
}

export default function EstimatorDrawer({ children }: EstimatorDrawerProps) {
  const { isAdmin, hasWritePermissions } = useUserProfile();
  const theme = useTheme();
  const [addProposalDialogOpen, setAddProposalDialogOpen] =
    React.useState(false);
  const [selectedProposal, setSelectedProposal] =
    React.useState<Proposal | null>(null);
  const [selectedWbs, setSelectedWbs] = React.useState<Wbs>();
  const { proposalId, wbsId, phaseId } = useParams();
  const [open, setOpen] = React.useState(proposalId === undefined);
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = React.useState(false);
  const currentProposal = useCurrentProposal({ proposalId: proposalId ?? '' });
  const currentWbs: Wbs | undefined = useCurrentWbs({ wbsId: wbsId ?? '' });
  const currentPhase: Phase | undefined = useCurrentPhase({
    phaseId: phaseId ?? '',
  });
  const { data, loading } = useProposals();
  const [proposalSearchInput, setProposalSearchInput] = useState('');

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('selectedProposalId');
    };
  }, []);

  const filteredProposals: Proposal[] =
    data?.filter((proposal) => {
      const searchKey = proposalSearchInput.toLowerCase();
      const proposalFieldsCombined = [
        proposal.proposalNumber?.toString().toLowerCase(),
        proposal.job?.toString().toString().toLowerCase(),
        proposal.coNumber?.toString().toLowerCase(),
        proposal.proposalDescription?.toLowerCase(),
        proposal.proposalOwner?.toLowerCase(),
        proposal.projectCity?.toLowerCase(),
        proposal.projectState?.toLowerCase(),
        proposal.proposalEstimators?.toLowerCase(),
        proposal.proposalDateReceived?.toString().toLowerCase(),
        proposal.proposalDateDue?.toLowerCase(),
        proposal.projectStartDate?.toLowerCase(),
        proposal.projectEndDate?.toLowerCase(),
        proposal.bidType?.toLowerCase(),
        proposal.proposalStatus?.toString().toLowerCase(),
        proposal.contactName?.toLowerCase(),
        proposal.contactAddress?.toLowerCase(),
        proposal.contactCity?.toLowerCase(),
        proposal.contactState?.toLowerCase(),
        proposal.contactZip?.toString().toLowerCase(),
        proposal.contactPhone?.toLowerCase(),
        proposal.contactEmail?.toLowerCase(),
      ]
        .filter(Boolean)
        .join(' ');
      return proposalFieldsCombined.includes(searchKey);
    }) || [];

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const loadFullProposalData = estimatorStore(
    (state: StoreState) => state.loadFullProposalData,
  );
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const navigate = useNavigate();
  const [isEditProposals, setIsEditProposals] = React.useState<boolean>(false);
  const [mainMenuAnchorEl, setMainMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMainMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMainMenuAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      <CssBaseline />
      <AppBar position='fixed' open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'full',
            justifyContent: 'space-between',
          }}>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            onClick={handleDrawerOpen}
            edge='start'
            sx={{ mr: 2, ...(open && { display: 'none' }) }}>
            <DrawerIcon color='white' />
          </IconButton>
          <Breadcrumbs aria-label='breadcrumb' aria-activedescendant=''>
            {currentProposal && (
              <Link
                underline='hover'
                color={currentWbs ? 'inherit' : 'white'}
                onClick={() => navigate(`/proposal/${currentProposal?.id}`)}>
                {`${currentProposal?.proposalNumber} - ${currentProposal?.proposalDescription}`}
              </Link>
            )}
            {currentWbs && (
              <Link
                underline='hover'
                color={currentPhase ? 'inherit' : 'white'}
                onClick={() =>
                  navigate(
                    `/proposal/${currentProposal?.id}/wbs/${currentWbs?.id}`,
                  )
                }>
                {currentWbs?.name}
              </Link>
            )}
            {currentPhase && (
              <Link
                underline='hover'
                color='white'
                onClick={() =>
                  navigate(
                    `/proposal/${currentProposal?.id}/wbs/${currentWbs?.id}phase/${currentPhase?.id}`,
                  )
                }>
                {`${currentPhase.phaseNumber} - ${currentPhase.description}`}
              </Link>
            )}
          </Breadcrumbs>
          <HStack gap={3}>
            <IconButton
              color='inherit'
              aria-label='menu'
              onClick={handleMenuOpen}
              edge='end'
              sx={{ ml: 'auto' }} // Adjust the margin to position the button on the right
            >
              <MenuRounded />
            </IconButton>

            {proposalId && (
              <IconButton
                color='inherit'
                aria-label='menu'
                onClick={() => loadFullProposalData(proposalId)}
                edge='end'>
                <DownloadForOffline />
              </IconButton>
            )}

            {/* New Menu for admin console and logout options */}
            <Menu
              anchorEl={mainMenuAnchorEl}
              open={Boolean(mainMenuAnchorEl)}
              onClose={handleMenuClose}>
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate('/admin');
                  }}>
                  <ListItemIcon>
                    <AdminPanelSettings fontSize='small' />
                  </ListItemIcon>
                  <ListItemText primary='Admin Console' />
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  auth.signOut();
                }}
                sx={{ color: 'red' }} // This line changes the text color to red
              >
                <ListItemIcon>
                  <ExitToApp fontSize='small' sx={{ color: 'inherit' }} />
                </ListItemIcon>
                <ListItemText primary='Logout' />
              </MenuItem>
            </Menu>
          </HStack>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          'width': drawerWidth,
          'flexShrink': 0,
          'zIndex': 999,

          '& .MuiDrawer-paper': {
            backgroundColor: 'white',
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant='persistent'
        anchor='left'
        open={open}>
        <DrawerHeader>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            {proposalId && currentProposal && (
              <IconButton onClick={() => navigate('/')}>
                <ArrowBack />
              </IconButton>
            )}
            {proposalId && currentProposal && (
              <Typography
                onClick={() => navigate(`/proposal/${currentProposal?.id}`)}
                sx={{
                  'alignSelf': 'center',
                  'textAlign': 'center',
                  'overflow': 'hidden',
                  'textOverflow': 'ellipsis',
                  'whiteSpace': 'nowrap',
                  'color': 'primary.main',
                  'cursor': 'pointer',
                  'width': '100%',
                  ':hover': { color: 'primary.dark' },
                }}
                variant='h5'>
                {currentProposal?.proposalDescription}
              </Typography>
            )}
            {proposalId && currentProposal && (
              <IconButton
                onClick={handleDrawerClose}
                sx={{
                  alignSelf: 'flex-end',
                  textAlign: 'flex-end',
                  marginLeft: 'auto',
                }}>
                {theme.direction === 'ltr' ? (
                  <ChevronLeftRounded />
                ) : (
                  <ChevronRightRounded />
                )}
              </IconButton>
            )}
            {!proposalId && !currentProposal && (
              <Box sx={{ display: 'flex', width: '100%' }}>
                <Typography
                  variant='h6'
                  color='inherit'
                  component='div'
                  sx={{
                    flexGrow: 1,
                    textAlign: 'center',
                    justifySelf: 'center',
                    alignSelf: 'center',
                  }}>
                  {!proposalId && 'MCP Estimator'}
                </Typography>
                {!proposalId && !currentProposal && hasWritePermissions && (
                  <Box sx={{ marginLeft: 'auto' }}>
                    <IconButton
                      onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
                      <Settings />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </div>
          <ProposalMenu
            anchorEl={menuAnchorEl}
            setAnchorEl={setMenuAnchorEl}
            openAddProposalDialog={() => setAddProposalDialogOpen(true)}
            onEditClicked={() => setIsEditProposals(true)}
          />
        </DrawerHeader>
        <Divider />
        {proposalId == null && (
          <Box sx={{ padding: '16px' }}>
            <TextField
              fullWidth
              variant='outlined'
              size='small'
              placeholder='Search Proposals...'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchRounded />
                  </InputAdornment>
                ),
              }}
              sx={{
                '.MuiOutlinedInput-root': {
                  'borderRadius': '20px',
                  'height': '40px',
                  '.MuiInputBase-input': {
                    height: '20px',
                    padding: '10px 14px',
                  },
                },
              }}
              value={proposalSearchInput}
              onChange={(e) => setProposalSearchInput(e.target.value)}
            />
          </Box>
        )}
        {proposalId == null && (
          <>
            <Divider />
            <Box sx={{ height: 'calc(100% - 64px)', overflowY: 'auto' }}>
              <ProposalList
                onClick={(proposal: Proposal) => setSelectedProposal(proposal)}
                proposals={filteredProposals}
              />
            </Box>
          </>
        )}
        {proposalId != null && (
          <Accordion
            defaultExpanded
            sx={{
              'margin': 0,
              'boxShadow': 'none',
              '&:before': {
                display: 'none',
              },
            }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Navigation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction='column' spacing={1}>
                <Button
                  onClick={() => navigate(`/proposal/${currentProposal?.id}`)}
                  disabled={wbsId == null}
                  disableElevation
                  color='primary'
                  sx={{
                    'height': '40px',
                    'width': '80%',
                    'alignSelf': 'center',
                    'borderRadius': '4px',
                    'backgroundColor': '#067cc1',
                    'color': '#fff',
                    'boxShadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
                    'transition': 'background-color 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      backgroundColor: '#005a8c',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0',
                      borderColor: 'transparent',
                    },
                    '& .MuiButton-startIcon': {
                      marginLeft: 0,
                    },
                    '& .MuiTypography-root': {
                      fontSize: '14px',
                      fontWeight: 500,
                    },
                  }}
                  startIcon={<ArrowBack />}>
                  <Typography sx={{ color: wbsId == null ? '' : 'white' }}>
                    Proposal Home
                  </Typography>
                </Button>
                <Button
                  onClick={() =>
                    navigate(
                      `/proposal/${currentProposal?.id}/wbs/${currentWbs?.id}`,
                    )
                  }
                  disabled={phaseId == null}
                  disableElevation
                  color='primary'
                  sx={{
                    'height': '40px',
                    'width': '80%',
                    'alignSelf': 'center',
                    'borderRadius': '4px',
                    'backgroundColor': '#067cc1',
                    'color': '#fff',
                    'boxShadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
                    'transition': 'background-color 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      backgroundColor: '#005a8c',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0',
                      borderColor: 'transparent',
                    },
                    '& .MuiButton-startIcon': {
                      marginLeft: 0,
                    },
                    '& .MuiTypography-root': {
                      fontSize: '14px',
                      fontWeight: 500,
                    },
                  }}
                  startIcon={<ArrowBack />}>
                  <Typography sx={{ color: phaseId == null ? '' : 'white' }}>
                    WBS Home
                  </Typography>
                </Button>
                <WbsDropdown />
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
        {wbsId != null && (
          <Box
            sx={{
              pt: '5px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              w: '100%',
              alignItems: 'center',
              justifyItems: 'center',
            }}>
            {/*{hasWritePermissions && (*/}
            {/*  <AddPhaseButton*/}
            {/*    toggleAddDialog={() => setAddPhaseDialogOpen(true)}*/}
            {/*  />*/}
            {/*)}*/}
          </Box>
        )}
        {wbsId != null && <PhaseList onClick={(_) => {}} />}
      </Drawer>
      <Main open={open} proposalId={proposalId}>
        <DrawerHeader />
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
        onDelete={() => {}}
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

const ProposalMenu: React.FC<ProposalMenuProps> = ({
  anchorEl,
  setAnchorEl,
  openAddProposalDialog,
  onEditClicked,
}) => {
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Menu
      id='basic-menu'
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}>
      <MenuItem
        sx={{ gap: 2 }}
        onClick={() => {
          handleClose();
          openAddProposalDialog();
        }}>
        <AddRounded>
          <ContentCopy fontSize='small' />
        </AddRounded>
        <ListItemText>Add</ListItemText>
      </MenuItem>
      <MenuItem
        sx={{ gap: 2 }}
        disabled={false}
        onClick={() => {
          handleClose();
          onEditClicked();
        }}>
        <EditRounded>
          <ContentCopy fontSize='small' />
        </EditRounded>
        <ListItemText>Edit</ListItemText>
      </MenuItem>
    </Menu>
  );
};

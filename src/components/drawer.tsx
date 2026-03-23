import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AdminPanelSettings,
  ArrowBack,
  ExitToApp,
  EditRounded,
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

import ProposalList from '../features/home/components/proposal_list';
import EditProposalsDialog from '../features/home/components/edit_proposals_dialog';
import AddProposalDialog from '../features/home/components/add_proposal_dialog';
import { auth } from '../setup/config/firebase';
import { useCurrentPhase } from '../hooks/current_phase_hook';
import { useCurrentProposal } from '../hooks/current_proposal_hook';
import { useCurrentWbs } from '../hooks/current_wbs_hook';
import { useProposals } from '../hooks/proposals_hook';
import { useUserProfile } from '../hooks/user_profile_hook';
import { Phase } from '../models/phase';
import { Proposal } from '../models/proposal';
import { Wbs } from '../models/wbs';
import { estimatorStore, StoreState } from '../utils/store';
import AddPhaseDialog from './add_phase_dialog';
import DrawerIcon from './drawer_icon';
import PhaseList from './phase_list';
import WbsDropdown from './wbs_drop_down';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
  proposalId?: string;
}>(({ theme, open }) => ({
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
  height: '100vh',
  flexGrow: 1,
  minWidth: 0,
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

interface AppBarStyleProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarStyleProps>(({ theme, open }) => ({
  backgroundColor: '#1f2937',
  boxShadow: 'none',
  borderBottom: '1px solid #374151',
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
  const [addProposalDialogOpen, setAddProposalDialogOpen] = React.useState(false);
  const { proposalId, wbsId, phaseId } = useParams();
  const [open, setOpen] = React.useState(proposalId === undefined);
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = React.useState(false);
  const currentProposal = useCurrentProposal({ proposalId: proposalId ?? '' });
  const currentWbs: Wbs | undefined = useCurrentWbs({ wbsId: wbsId ?? '' });
  const currentPhase: Phase | undefined = useCurrentPhase({ phaseId: phaseId ?? '' });
  const { data } = useProposals();
  const [proposalSearchInput, setProposalSearchInput] = useState('');

  useEffect(() => {
    return () => { sessionStorage.removeItem('selectedProposalId'); };
  }, []);

  const filteredProposals: Proposal[] =
    data?.filter((proposal) => {
      const searchKey = proposalSearchInput.toLowerCase();
      const fields = [
        proposal.proposalNumber?.toString().toLowerCase(),
        proposal.job?.toString().toLowerCase(),
        proposal.coNumber?.toString().toLowerCase(),
        proposal.proposalDescription?.toLowerCase(),
        proposal.proposalOwner?.toLowerCase(),
        proposal.projectCity?.toLowerCase(),
        proposal.projectState?.toLowerCase(),
        proposal.jobSiteAddress?.toLowerCase(),
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
      ].filter(Boolean).join(' ');
      return fields.includes(searchKey);
    }) || [];

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const loadFullProposalData = estimatorStore((s: StoreState) => s.loadFullProposalData);
  const navigate = useNavigate();
  const [isEditProposals, setIsEditProposals] = React.useState(false);
  const [mainMenuAnchorEl, setMainMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      <CssBaseline />

      {/* ━━━ App Bar ━━━ */}
      <AppBar position='fixed' open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: '48px !important', px: 2 }}>
          <IconButton
            color='inherit'
            onClick={() => setOpen(true)}
            edge='start'
            sx={{ mr: 1.5, ...(open && { display: 'none' }), p: 0.75 }}>
            <DrawerIcon color='white' />
          </IconButton>

          <Breadcrumbs
            aria-label='breadcrumb'
            sx={{
              flex: 1,
              '& .MuiBreadcrumbs-separator': { color: '#6b7280', mx: 0.75 },
              '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
            }}>
            {currentProposal && (
              <Link
                underline='none'
                sx={{
                  'color': '#d1d5db', 'cursor': 'pointer', 'fontSize': '0.8rem', 'fontWeight': 500,
                  'overflow': 'hidden', 'textOverflow': 'ellipsis', 'whiteSpace': 'nowrap', 'maxWidth': 300,
                  '&:hover': { color: '#ffffff' },
                }}
                onClick={() => navigate(`/proposal/${currentProposal?.id}`)}>
                {`${currentProposal?.proposalNumber} - ${currentProposal?.proposalDescription}`}
              </Link>
            )}
            {currentWbs && (
              <Link
                underline='none'
                sx={{
                  'color': '#d1d5db', 'cursor': 'pointer', 'fontSize': '0.8rem', 'fontWeight': 500,
                  '&:hover': { color: '#ffffff' },
                }}
                onClick={() => navigate(`/proposal/${currentProposal?.id}/wbs/${currentWbs?.id}`)}>
                {currentWbs?.name}
              </Link>
            )}
            {currentPhase && (
              <Typography sx={{ color: '#f3f4f6', fontSize: '0.8rem', fontWeight: 600 }}>
                {`${currentPhase.phaseNumber} - ${currentPhase.description}`}
              </Typography>
            )}
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {proposalId && (
              <IconButton
                size='small'
                onClick={() => loadFullProposalData(proposalId)}
                sx={{ color: '#9ca3af', '&:hover': { color: '#d1d5db', backgroundColor: 'rgba(255,255,255,0.06)' } }}>
                <DownloadForOffline sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <IconButton
              size='small'
              onClick={(e) => setMainMenuAnchorEl(e.currentTarget)}
              sx={{ color: '#9ca3af', '&:hover': { color: '#d1d5db', backgroundColor: 'rgba(255,255,255,0.06)' } }}>
              <MenuRounded sx={{ fontSize: 18 }} />
            </IconButton>

            <Menu
              anchorEl={mainMenuAnchorEl}
              open={Boolean(mainMenuAnchorEl)}
              onClose={() => setMainMenuAnchorEl(null)}
              PaperProps={{
                sx: { borderRadius: 1.5, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 160 },
              }}>
              {isAdmin && (
                <MenuItem onClick={() => { setMainMenuAnchorEl(null); navigate('/admin'); }} sx={{ fontSize: '0.825rem' }}>
                  <ListItemIcon><AdminPanelSettings sx={{ fontSize: 16 }} /></ListItemIcon>
                  <ListItemText primary='Admin Console' primaryTypographyProps={{ fontSize: '0.825rem' }} />
                </MenuItem>
              )}
              <MenuItem
                onClick={() => { setMainMenuAnchorEl(null); auth.signOut(); }}
                sx={{ fontSize: '0.825rem', color: '#dc2626' }}>
                <ListItemIcon><ExitToApp sx={{ fontSize: 16, color: '#dc2626' }} /></ListItemIcon>
                <ListItemText primary='Logout' primaryTypographyProps={{ fontSize: '0.825rem' }} />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ━━━ Sidebar Drawer ━━━ */}
      <Drawer
        sx={{
          'width': drawerWidth,
          'flexShrink': 0,
          'zIndex': 999,
          '& .MuiDrawer-paper': {
            backgroundColor: '#ffffff',
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e5e7eb',
            boxShadow: 'none',
          },
        }}
        variant='persistent'
        anchor='left'
        open={open}>

        {/* Drawer header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: 48,
            px: 1,
            flexShrink: 0,
            borderBottom: '1px solid #e5e7eb',
          }}>
          {proposalId && currentProposal ? (
            <>
              <IconButton size='small' onClick={() => navigate('/')} sx={{ color: '#6b7280', mr: 0.5 }}>
                <ArrowBack sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography
                onClick={() => navigate(`/proposal/${currentProposal?.id}`)}
                sx={{
                  'flex': 1, 'fontSize': '0.8rem', 'fontWeight': 600, 'color': '#111827',
                  'cursor': 'pointer', 'overflow': 'hidden', 'textOverflow': 'ellipsis',
                  'whiteSpace': 'nowrap', '&:hover': { color: '#374151' },
                }}>
                {currentProposal?.proposalDescription}
              </Typography>
              <IconButton size='small' onClick={() => setOpen(false)} sx={{ color: '#9ca3af', ml: 0.5 }}>
                <ChevronLeftRounded sx={{ fontSize: 18 }} />
              </IconButton>
            </>
          ) : (
            <>
              <Typography sx={{ flex: 1, fontSize: '0.825rem', fontWeight: 600, color: '#111827', pl: 1 }}>
                MCP Estimator
              </Typography>
              {hasWritePermissions && (
                <IconButton size='small' onClick={(e) => setMenuAnchorEl(e.currentTarget)} sx={{ color: '#6b7280' }}>
                  <MenuRounded sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </>
          )}
          <ProposalMenu
            anchorEl={menuAnchorEl}
            setAnchorEl={setMenuAnchorEl}
            openAddProposalDialog={() => setAddProposalDialogOpen(true)}
            onEditClicked={() => setIsEditProposals(true)}
          />
        </Box>

        {/* ── Home view: search + proposals ── */}
        {proposalId == null && (
          <>
            <Box sx={{ px: 1.5, py: 1 }}>
              <TextField
                fullWidth
                variant='outlined'
                size='small'
                placeholder='Search proposals...'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchRounded sx={{ fontSize: 16, color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    'height': 32,
                    'borderRadius': 1,
                    'backgroundColor': '#f3f4f6',
                    'fontSize': '0.8rem',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#d1d5db' },
                    '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
                  },
                  '& .MuiInputBase-input': { py: 0.5 },
                }}
                value={proposalSearchInput}
                onChange={(e) => setProposalSearchInput(e.target.value)}
              />
            </Box>
            <Divider sx={{ borderColor: '#f3f4f6' }} />
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <ProposalList onClick={() => {}} proposals={filteredProposals} />
            </Box>
          </>
        )}

        {/* ── Proposal view: navigation + WBS + phases ── */}
        {proposalId != null && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Navigation links */}
            <Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.675rem', fontWeight: 600, color: '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75, px: 0.5,
                }}>
                Navigate
              </Typography>
              <NavItem
                label='Proposal Home'
                disabled={wbsId == null}
                onClick={() => navigate(`/proposal/${currentProposal?.id}`)}
              />
              <NavItem
                label='WBS Home'
                disabled={phaseId == null}
                onClick={() => navigate(`/proposal/${currentProposal?.id}/wbs/${currentWbs?.id}`)}
              />
            </Box>

            <Divider sx={{ borderColor: '#f3f4f6', mx: 1.5 }} />

            {/* WBS selector */}
            <Box sx={{ px: 1.5, py: 1, flexShrink: 0 }}>
              <WbsDropdown />
            </Box>

            {/* Phase list */}
            {wbsId != null && (
              <>
                <Divider sx={{ borderColor: '#f3f4f6', mx: 1.5 }} />
                <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    sx={{
                      fontSize: '0.675rem', fontWeight: 600, color: '#9ca3af',
                      textTransform: 'uppercase', letterSpacing: '0.05em', px: 2, pt: 1, pb: 0.5,
                    }}>
                    Phases
                  </Typography>
                  <PhaseList onClick={() => {}} />
                </Box>
              </>
            )}
          </Box>
        )}
      </Drawer>

      {/* ━━━ Main content ━━━ */}
      <Main open={open} proposalId={proposalId}>
        <DrawerHeader />
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </Box>
      </Main>

      {/* Dialogs */}
      <AddProposalDialog
        open={addProposalDialogOpen}
        toggleAddDialog={() => setAddProposalDialogOpen(!addProposalDialogOpen)}
      />
      {wbsId != undefined && (
        <AddPhaseDialog open={addPhaseDialogOpen} onClose={() => setAddPhaseDialogOpen(false)} />
      )}
      <EditProposalsDialog open={isEditProposals} onClose={() => setIsEditProposals(false)} onDelete={() => {}} />
    </Box>
  );
}

// ---------------------------------------------------------------------------
//  Sidebar nav item — compact text link with left indicator
// ---------------------------------------------------------------------------

function NavItem({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        'px': 1.25,
        'py': 0.5,
        'mx': 0.5,
        'my': 0.15,
        'borderRadius': 1,
        'cursor': disabled ? 'default' : 'pointer',
        'opacity': disabled ? 0.4 : 1,
        '&:hover': disabled ? {} : { backgroundColor: '#f3f4f6' },
      }}>
      <Typography
        sx={{
          fontSize: '0.775rem',
          fontWeight: 500,
          color: disabled ? '#9ca3af' : '#374151',
        }}>
        {label}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
//  Proposal management menu (add/edit)
// ---------------------------------------------------------------------------

interface ProposalMenuProps {
  anchorEl: null | HTMLElement;
  setAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
  openAddProposalDialog: () => void;
  onEditClicked: () => void;
}

const ProposalMenu: React.FC<ProposalMenuProps> = ({ anchorEl, setAnchorEl, openAddProposalDialog, onEditClicked }) => {
  const close = () => setAnchorEl(null);

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={close}
      PaperProps={{
        sx: { borderRadius: 1.5, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 140 },
      }}>
      <MenuItem onClick={() => { close(); openAddProposalDialog(); }} sx={{ fontSize: '0.825rem' }}>
        <ListItemIcon><AddRounded sx={{ fontSize: 16 }} /></ListItemIcon>
        <ListItemText primary='Add' primaryTypographyProps={{ fontSize: '0.825rem' }} />
      </MenuItem>
      <MenuItem onClick={() => { close(); onEditClicked(); }} sx={{ fontSize: '0.825rem' }}>
        <ListItemIcon><EditRounded sx={{ fontSize: 16 }} /></ListItemIcon>
        <ListItemText primary='Edit' primaryTypographyProps={{ fontSize: '0.825rem' }} />
      </MenuItem>
    </Menu>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  PendingActions as PendingActionsIcon,
  ThumbUp as ThumbUpIcon,
  AccessTime as AccessTimeIcon,
  NotificationsActive as NotificationsActiveIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { useProposals } from '../../hooks/proposals_hook';
import { Proposal, ProposalStatus } from '../../models/proposal';
import { format, addDays, isValid, parseISO } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  height: '100%',
}));

const ProposalOverviewDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: proposals, loading } = useProposals();
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [upcomingProposals, setUpcomingProposals] = useState<Proposal[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [hitRate, setHitRate] = useState<number>(0);
  const [pendingProposalsCount, setPendingProposalsCount] = useState<number>(0);
  const [submittedProposalsCount, setSubmittedProposalsCount] =
    useState<number>(0);
  const [awardedProposalsCount, setAwardedProposalsCount] = useState<number>(0);
  const [rejectedProposalsCount, setRejectedProposalsCount] =
    useState<number>(0);

  useEffect(() => {
    if (proposals) {
      // Recent Activities
      const sortedProposals = proposals.slice().sort((a, b) => {
        const numA = parseInt(a.proposalNumber || '0', 10);
        const numB = parseInt(b.proposalNumber || '0', 10);
        return numB - numA; // Sort in descending order
      });
      setRecentProposals(sortedProposals.slice(0, 3)); // Latest 5 proposals

      // Upcoming Deadlines
      const today = new Date();
      const nextWeek = addDays(today, 7);
      const upcoming = proposals.filter((proposal) => {
        const dueDate = parseISO(proposal.proposalDateDue || '');
        return (
          isValid(dueDate) &&
          dueDate >= today &&
          dueDate <= nextWeek &&
          proposal.proposalStatus === ProposalStatus.Bidding
        );
      });
      setUpcomingProposals(upcoming);

      // Proposal Status Counts
      const pending = proposals.filter(
        (proposal) =>
          proposal.proposalStatus === ProposalStatus.Bidding ||
          proposal.proposalStatus === ProposalStatus.Open,
      ).length;

      const submitted = proposals.filter(
        (proposal) => proposal.proposalStatus === ProposalStatus.Submitted,
      ).length;

      const awarded = proposals.filter(
        (proposal) => proposal.proposalStatus === ProposalStatus.Awarded,
      ).length;

      const rejected = proposals.filter(
        (proposal) =>
          proposal.proposalStatus === ProposalStatus.Rejected ||
          proposal.proposalStatus === ProposalStatus.Declined,
      ).length;

      setPendingProposalsCount(pending);
      setSubmittedProposalsCount(submitted);
      setAwardedProposalsCount(awarded);
      setRejectedProposalsCount(rejected);

      // Hit Rate Calculation
      const totalDecided = awarded + rejected;
      const calculatedHitRate =
        totalDecided > 0 ? (awarded / totalDecided) * 100 : 0;
      setHitRate(parseFloat(calculatedHitRate.toFixed(2)));

      // Proposal Status Data for Chart
      const statusDataArray = [
        { name: 'Pending', value: pending },
        { name: 'Submitted', value: submitted },
        { name: 'Awarded', value: awarded },
        { name: 'Rejected', value: rejected },
      ];
      setStatusData(statusDataArray);
    }
  }, [proposals]);

  const COLORS = [
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ];

  return (
    <DashboardContainer>
      {/* Welcome Message */}
      <Typography variant='h4' gutterBottom>
        Welcome Back!
      </Typography>
      <Typography variant='subtitle1' color='textSecondary' gutterBottom>
        Here's an overview of your proposals.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title='Total number of proposals in the system'>
                <StatsCard>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant='h6'>
                      {proposals?.length || 0}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      Total Proposals
                    </Typography>
                  </Box>
                </StatsCard>
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title='Proposals that are currently in progress'>
                <StatsCard>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                    <PendingActionsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant='h6'>
                      {pendingProposalsCount}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      Proposals In Progress
                    </Typography>
                  </Box>
                </StatsCard>
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title='Proposals that have been awarded'>
                <StatsCard>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                    <ThumbUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant='h6'>
                      {awardedProposalsCount}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      Proposals Awarded
                    </Typography>
                  </Box>
                </StatsCard>
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title='Percentage of awarded proposals out of all decided proposals (awarded or rejected)'>
                <StatsCard>
                  <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                    <AccessTimeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant='h6'>{hitRate}%</Typography>
                    <Typography variant='body2' color='textSecondary'>
                      Hit Rate
                    </Typography>
                  </Box>
                </StatsCard>
              </Tooltip>
            </Grid>
          </Grid>

          {/* Actions */}
          {/*<Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>*/}
          {/*  <Button*/}
          {/*    variant='contained'*/}
          {/*    color='primary'*/}
          {/*    startIcon={<AddIcon />}*/}
          {/*    onClick={() => navigate('/create-proposal')}>*/}
          {/*    Create New Proposal*/}
          {/*  </Button>*/}
          {/*</Box>*/}

          {/* Proposal Status Chart */}
          <Box sx={{ mt: 4 }}>
            <Typography variant='h6' gutterBottom>
              Proposal Status Overview
            </Typography>
            <Divider />
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey='value'
                    nameKey='name'
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    fill={theme.palette.primary.main}
                    label>
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Proposals Needing Attention */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6' gutterBottom>
                Proposals Needing Attention
              </Typography>
              <Tooltip title='Proposals that are due within the next 7 days and are still in Bidding status'>
                <IconButton size='small' sx={{ ml: 1 }}>
                  <InfoIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider />
            <List>
              {upcomingProposals.length > 0 ? (
                upcomingProposals.map((proposal) => {
                  const dueDate = parseISO(proposal.proposalDateDue || '');
                  const formattedDueDate = isValid(dueDate)
                    ? format(dueDate, 'MM/dd/yyyy')
                    : 'N/A';
                  return (
                    <ListItem
                      key={proposal.id}
                      button
                      onClick={() => navigate(`/proposal/${proposal.id}`)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                          <NotificationsActiveIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${proposal.proposalNumber} - ${proposal.proposalDescription}`}
                        secondary={`Due Date: ${formattedDueDate}`}
                      />
                    </ListItem>
                  );
                })
              ) : (
                <Typography variant='body1' color='textSecondary' sx={{ p: 2 }}>
                  No proposals need immediate attention.
                </Typography>
              )}
            </List>
          </Box>

          {/* Recent Activities */}
          <Box sx={{ mt: 4 }}>
            <Typography variant='h6' gutterBottom>
              Recent Proposals
            </Typography>
            <Divider />
            <List>
              {recentProposals.length > 0 ? (
                recentProposals.map((proposal) => {
                  const receivedDate = parseISO(
                    proposal.proposalDateReceived || '',
                  );
                  const formattedReceivedDate = isValid(receivedDate)
                    ? format(receivedDate, 'MM/dd/yyyy')
                    : 'N/A';
                  return (
                    <ListItem
                      key={proposal.id}
                      button
                      onClick={() => navigate(`/proposal/${proposal.id}`)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <DescriptionIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${proposal.proposalNumber} - ${proposal.proposalDescription}`}
                        secondary={`Last Updated: ${formattedReceivedDate}`}
                      />
                    </ListItem>
                  );
                })
              ) : (
                <Typography variant='body1' color='textSecondary' sx={{ p: 2 }}>
                  No recent activities found.
                </Typography>
              )}
            </List>
          </Box>
        </>
      )}
    </DashboardContainer>
  );
};

export default ProposalOverviewDashboard;

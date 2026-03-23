import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';

import { getSingleActivity } from '../api/activity';
import { useCurrentPhase } from '../hooks/current_phase_hook';
import { useCurrentProposal } from '../hooks/current_proposal_hook';
import { useCurrentWbs } from '../hooks/current_wbs_hook';
import { Activity, ActivityType } from '../models/activity';
import { StoreState, estimatorStore } from '../utils/store';
import FormattedNumberInput from './formatted_number_input';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedRowIds: GridRowId[];
}

export default function EditBaseRateDialog({
  open,
  onClose,
  selectedRowIds,
}: Props) {
  const { wbsId, proposalId, phaseId } = useParams();
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? '',
  });
  const currentPhase = useCurrentPhase({
    phaseId: phaseId ?? '',
  });
  const currentWbs = useCurrentWbs({
    wbsId: wbsId ?? '',
  });
  const [disabled, setDisabled] = useState(true);
  const [activities, setActivities] = useState<(Activity | undefined)[]>([]);
  const [baseRate, setBaseRate] = useState<number>();
  const [subsistence, setSubsistence] = useState<number>();
  const recalculatePhase = estimatorStore(
    (state: StoreState) => state.recalculatePhase,
  );
  const updateActivityRates = estimatorStore(
    (state: StoreState) => state.updateActivityRates,
  );

  const phaseDatabasesAllowed = ['180002', '180003', '180004'];
  const onSubmit = async () => {
    const filteredActivities = activities.filter(
      (activity) => activity !== undefined,
    ) as Activity[];
    const activityIds = filteredActivities.map((activity) => activity.id);
    const effectiveBaseRate =
      baseRate ?? currentProposal?.craftBaseRate ?? 0;
    const effectiveSubsistence =
      subsistence ?? currentProposal?.subsistenceRate ?? 0;
    await updateActivityRates(activityIds, effectiveBaseRate, effectiveSubsistence);
    recalculatePhase(phaseId!);
    onClose();
  };
  useEffect(() => {
    const fetchActivities = async () => {
      const ids: string[] = [];
      selectedRowIds.map((row) => {
        ids.push(row.toString());
      });
      const promises = ids.map(async (id) => {
        const activity = await getSingleActivity({ activityId: id });
        return activity;
      });
      const fetchedActivities = await Promise.all(promises);
      const filteredActivities = fetchedActivities.filter(
        (activity) => activity !== undefined,
      );
      setActivities(filteredActivities);
    };

    fetchActivities();
  }, [selectedRowIds]);

  useEffect(() => {
    let disabled = false;
    activities.forEach((activity) => {
      if (activity && currentWbs)
        if (
          activity.activityType != ActivityType.customLaborItem &&
          currentWbs.wbsDatabaseId != 200000 &&
          !phaseDatabasesAllowed.includes(
            currentPhase!.phaseDatabaseId!.toString(),
          )
        ) {
          disabled = true;
        }
    });
    if (activities && activities.length > 0 && disabled == false) {
      if (activities.length > 1) {
        const filteredActivities = activities.filter(
          (activity) => activity !== undefined,
        ) as Activity[];
        const sameBaseRates = checkSameValue(
          filteredActivities,
          'craftBaseRate',
        );
        const sameSubsistenceRate = checkSameValue(
          filteredActivities,
          'subsistenceRate',
        );
        if (sameBaseRates && sameSubsistenceRate) {
          disabled = false;
        } else {
          disabled = true;
        }
      }
    }
    setSubsistence(
      activities[0]?.subsistenceRate ?? currentProposal?.subsistenceRate ?? 0,
    );
    setBaseRate(
      activities[0]?.craftBaseRate ?? currentProposal?.craftBaseRate ?? 0,
    );
    setDisabled(disabled);
  }, [activities, selectedRowIds]);

  const checkSameValue = (
    array: Activity[],
    propName: keyof Activity,
  ): boolean => {
    const firstValue = array[0][propName];
    return array.every((obj) => obj[propName] === firstValue);
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 320 } }}>
        <DialogTitle sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', pb: 1 }}>
          Edit Rates
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '8px !important' }}>
          <FormattedNumberInput
            disabled={disabled}
            value={baseRate?.toString()}
            label='Base Rate'
            prefix='$'
            setValue={(_) => setBaseRate(parseFloat(_))}
          />
          <FormattedNumberInput
            disabled={disabled}
            value={subsistence?.toString()}
            label='Subsistence'
            prefix='$'
            setValue={(_) => setSubsistence(parseFloat(_))}
          />
          <Button disabled={disabled} onClick={onSubmit}
            sx={{ 'textTransform': 'none', 'fontWeight': 600, 'fontSize': '0.825rem', 'color': '#fff', 'backgroundColor': '#111827', 'borderRadius': 1, 'py': 0.75, '&:hover': { backgroundColor: '#1f2937' }, '&.Mui-disabled': { backgroundColor: '#e5e7eb', color: '#9ca3af' } }}>
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

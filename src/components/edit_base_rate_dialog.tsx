import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { GridRowId } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSingleActivity, updateActivityRates } from "../api/activity";
import { useCurrentProposal } from "../hooks/current_proposal_hook";
import { useCurrentWbs } from "../hooks/current_wbs_hook";
import { Activity, ActivityType } from "../models/activity";
import FormattedInput from "./number_format";

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
  const { wbsId, proposalId } = useParams();
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? "",
  });
  const currentWbs = useCurrentWbs({
    wbsId: wbsId ?? "",
  });
  const [disabled, setDisabled] = useState(true);
  const [activities, setActivities] = useState<(Activity | undefined)[]>([]);
  const [baseRate, setBaseRate] = useState<number>();
  const [subsistence, setSubsistence] = useState<number>();

  const onSubmit = async () => {
    const filteredActivities = activities.filter(
      (activity) => activity !== undefined
    ) as Activity[];
    await updateActivityRates(
      filteredActivities,
      baseRate ?? 0,
      subsistence ?? 0
    );
    onClose();
  };
  useEffect(() => {
    const fetchActivities = async () => {
      let ids: string[] = [];
      selectedRowIds.map((row) => {
        ids.push(row.toString());
      });
      const promises = ids.map(async (id) => {
        const activity = await getSingleActivity({ activityId: id });
        return activity;
      });
      const fetchedActivities = await Promise.all(promises);
      const filteredActivities = fetchedActivities.filter(
        (activity) => activity !== undefined
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
          currentWbs.wbsDatabaseId != 200000
        ) {
          disabled = true;
          return;
        }
    });
    if (activities && activities.length > 0 && disabled == false) {
      if (activities.length > 1) {
        const filteredActivities = activities.filter(
          (activity) => activity !== undefined
        ) as Activity[];
        let sameBaseRates = checkSameValue(filteredActivities, "craftBaseRate");
        let sameSubsistenceRate = checkSameValue(
          filteredActivities,
          "subsistenceRate"
        );
        if (sameBaseRates && sameSubsistenceRate) {
          disabled = false;
        } else {
          disabled = true;
        }
      }
    }
    console.log(activities[0]);
    setSubsistence(
      activities[0]?.subsistenceRate ?? currentProposal?.subsistenceRate
    );
    setBaseRate(activities[0]?.craftBaseRate ?? currentProposal?.craftBaseRate);
    setDisabled(disabled);
  }, [activities, selectedRowIds]);

  const checkSameValue = (
    array: Activity[],
    propName: keyof Activity
  ): boolean => {
    const firstValue = array[0][propName];
    return array.every((obj) => obj[propName] === firstValue);
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Edit base rate</DialogTitle>
        <DialogContent sx={{ height: "300px", width: "300px" }}>
          <div
            style={{
              width: "100%",
              height: "95%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            <FormattedInput
              disabled={disabled}
              value={baseRate?.toString()}
              label="Base Rate"
              prefix="$"
              setValue={(_) => setBaseRate(parseFloat(_))}
            />
            <FormattedInput
              disabled={disabled}
              value={subsistence?.toString()}
              label="Subsistence"
              prefix="$"
              setValue={(_) => setSubsistence(parseFloat(_))}
            />
            <Button variant="contained" disabled={disabled} onClick={onSubmit}>
              Add Phase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

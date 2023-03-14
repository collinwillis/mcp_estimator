import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  Typography,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { width } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { insertActivityBatch } from "../../../api/activity";
import rawConstantData from "../../../data/constants.json";
import { useCurrentPhase } from "../../../hooks/current_phase_hook";
import { Activity, ActivityType } from "../../../models/activity";
import { Constant } from "../../../models/constant";
import { FirestoreActivity } from "../../../models/firestore models/activity_firestore";

export default function AddActivityDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { proposalId, wbsId, phaseId } = useParams();
  const currentPhase = useCurrentPhase({
    phaseId: phaseId ?? "",
  });
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Constant[]>([]);
  const [checked, setChecked] = useState<Constant[]>([]);
  const [constants, setConstants] = useState<Constant[]>([]);

  //batch add new activities to db
  async function addToDb() {
    let temp: FirestoreActivity[] = [];
    checked.forEach((constant) => {
      let newActivity = new FirestoreActivity({
        proposalId: proposalId,
        wbsId: wbsId,
        phaseId: phaseId,
        constant: constant,
        equipment: null,
        time: 0,
        craftConstant: constant.craftConstant,
        welderConstant: constant.weldConstant,
        activityType: ActivityType.laborItem,
        description: constant.description,
        quantity: 0,
        price: 0,
        craftBaseRate: null,
        subsistenceRate: null,
        equipmentCost: null,
        craftCost: null,
        materialCost: null,
      });
      temp.push(newActivity);
    });
    await insertActivityBatch(temp);
    setChecked([]);
    setConstants([]);
    setSearch("");
    setSearchResults([]);
    onClose();
  }

  const handleToggle = (value: Constant) => () => {
    const currentIndex = checked.indexOf(value);
    const newCheckedItems = [...checked];

    if (currentIndex === -1) {
      newCheckedItems.push(value);
    } else {
      newCheckedItems.splice(currentIndex, 1);
    }

    setChecked(newCheckedItems);
  };

  useEffect(() => {
    let temp: Constant[] = [];
    rawConstantData.forEach((constant) => {
      let newConstant: Constant = constant as Constant;
      if (newConstant.phaseDatabaseId == currentPhase?.phaseDatabaseId) {
        temp = [...temp, newConstant];
      }
    });
    temp = temp.sort((a, b) => a.sortOrder - b.sortOrder);
    setConstants(temp);
  }, [currentPhase]);

  //Filter the activities based on the search input
  useEffect(() => {
    let temp: Constant[] = [...constants];
    if (search) {
      temp = temp.filter(
        (activity) =>
          activity.description.includes(search) ||
          activity.description.toLowerCase().includes(search) ||
          activity.description.toUpperCase().includes(search)
      );
    }
    setSearchResults(temp);
  }, [search, constants]);

  function endsWithNumber(str: String) {
    return isNaN(parseInt(str.slice(-1))) ? false : true;
  }
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant="h3" sx={{ pb: "20px" }}>
          {" "}
          Add Activities
        </Typography>

        <Input
          placeholder="Search Activities"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          sx={{ width: "100%" }}
          autoFocus={true}
        />
      </DialogTitle>
      <DialogContent sx={{ height: "400px", width: "400px" }}>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {searchResults?.map((constant) => {
            const labelId = `checkbox-list-label-${constant.id}`;
            const isChecked = checked.indexOf(constant) !== -1;
            return (
              <ListItem key={constants.indexOf(constant)} disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(constant)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isChecked}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={
                      constant.description +
                      (endsWithNumber(constant.description) ? '"' : "")
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={addToDb} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

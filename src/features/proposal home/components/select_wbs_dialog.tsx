import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import React, { useEffect, useState } from "react";
import { updateUserPreferences } from "../../../api/user_preferences";
import { useUserPreferences } from "../../../hooks/user_preferences_hook";
import { FirestoreUserPreferences } from "../../../models/firestore models/user_preferences_firestore";
import { UserPreferences } from "../../../models/user_preferences";
import { auth } from "../../../setup/config/firebase";
import { WbsArray, WbsEnum } from "../../../utils/enums";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userPreferences?: UserPreferences;
}
export default function SelectWbsDialog({
  isOpen,
  onClose,
  userPreferences,
}: Props) {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (userPreferences) {
      setChecked(userPreferences?.wbsToDisplay!);
    }
  }, [userPreferences]);

  const styles = {
    dialogPaper: {
      minHeight: "80vh",
      maxHeight: "80vh",
    },
  };
  const handleToggle = (value: string) => () => {
    if (checked.includes(value)) {
      setChecked(checked.filter((wbs) => wbs !== value));
    } else {
      setChecked([...checked, value]);
    }
  };

  const handleSave = async () => {
    const updatedUserPreferences: UserPreferences = {
      ...userPreferences!,
      wbsToDisplay: checked!,
    };
    await updateUserPreferences(updatedUserPreferences);
    onClose();
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={onClose}
        classes={{ paper: styles.dialogPaper.toString() }}
      >
        <DialogTitle>
          <>
            <h2>Select WBS</h2>
            <Input
              placeholder="Search Activities"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              sx={{ width: "100%" }}
              autoFocus={true}
            />
          </>
        </DialogTitle>
        <DialogContent sx={{ height: "400px", width: "400px" }}>
          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {WbsArray?.sort((a, b) => {
              return a.wbsDatabaseId! - b.wbsDatabaseId!;
            }).map((wbs) => {
              const labelId = `checkbox-list-label-${wbs}`;
              return (
                <ListItem key={wbs.toString()} disablePadding>
                  <ListItemButton
                    role={undefined}
                    onClick={handleToggle(wbs.name)}
                    dense
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checked.includes(wbs.name)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={wbs.name} />
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
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, Typography,} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {insertActivityBatch} from "../../../api/activity";
import rawEquipment from "../../../data/equipment.json";
import {useCurrentPhase} from "../../../hooks/current_phase_hook";
import {ActivityType} from "../../../models/activity";
import {Equipment, EquipmentOwnership, EquipmentUnit,} from "../../../models/equipment";
import {FirestoreActivity} from "../../../models/firestore models/activity_firestore";

export default function AddEquipmentDialog({
                                               open,
                                               onClose,
                                           }: {
    open: boolean;
    onClose: () => void;
}) {
    const {proposalId, wbsId, phaseId} = useParams();
    const currentPhase = useCurrentPhase({
        phaseId: phaseId ?? "",
    });
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Equipment[]>([]);
    const [checked, setChecked] = useState<Equipment[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);

    //batch add new activities to db
    async function addToDb() {
        let temp: FirestoreActivity[] = [];
        checked.forEach((equipment) => {
            let newActivity = new FirestoreActivity({
                proposalId: proposalId,
                wbsId: wbsId,
                phaseId: phaseId,
                constant: null,
                equipment: equipment,
                craftConstant: 0,
                welderConstant: 0,
                activityType: ActivityType.equipmentItem,
                description: equipment.description,
                quantity: 0,
                time: 0,
                unit: EquipmentUnit.months,
                price: equipment.dayRate,
                craftBaseRate: null,
                subsistenceRate: null,
                craftCost: null,
                equipmentCost: null,
                materialCost: null,
                equipmentOwnership: EquipmentOwnership.rental,
                dateAdded: Date.now().toString(),
            });
            temp.push(newActivity);
        });
        await insertActivityBatch(temp);
        setChecked([]);
        setSearch("");
        setSearchResults([]);
        onClose();
    }

    const handleToggle = (value: Equipment) => () => {
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
        let temp: Equipment[] = [];
        rawEquipment.forEach((equipment) => {
            let newEquipment: Equipment = equipment as Equipment;

            temp = [...temp, newEquipment];
        });

        temp = temp.sort((a, b) => a.id - b.id);
        setEquipment(temp);
    }, [currentPhase]);

    //Filter the activities based on the search input
    useEffect(() => {
        let temp: Equipment[] = [...equipment];
        if (search) {
            temp = temp.filter(
                (equipment) =>
                    equipment.description.includes(search.toLowerCase()) ||
                    equipment.description.toLowerCase().includes(search.toLowerCase()) ||
                    equipment.description.toUpperCase().includes(search.toUpperCase())
            );
        }
        setSearchResults(temp);
    }, [search, equipment, open]);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                <Typography variant="h3" sx={{pb: "20px"}}>
                    Add Equipment
                </Typography>

                <Input
                    placeholder="Search Equipment"
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                    sx={{width: "100%"}}
                    autoFocus={true}
                />
            </DialogTitle>
            <DialogContent sx={{height: "400px", width: "400px"}}>
                <List
                    sx={{width: "100%", maxWidth: 360, bgcolor: "background.paper"}}
                >
                    {searchResults?.map((currentEquipment) => {
                        const labelId = `checkbox-list-label-${currentEquipment.id}`;
                        const isChecked = checked.indexOf(currentEquipment) !== -1;
                        return (
                            <ListItem
                                key={equipment.indexOf(currentEquipment)}
                                disablePadding
                            >
                                <ListItemButton
                                    role={undefined}
                                    onClick={handleToggle(currentEquipment)}
                                    dense
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={isChecked}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{"aria-labelledby": labelId}}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        id={labelId}
                                        primary={currentEquipment.description}
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

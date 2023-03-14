import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { insertPhase } from "../api/phase";
import localPhaseArray from "../data/phases.json";
import { useCurrentProposal } from "../hooks/current_proposal_hook";
import { useCurrentWbs } from "../hooks/current_wbs_hook";
import { usePhases } from "../hooks/phase_hook";
import { FirestorePhase } from "../models/firestore models/phase_firestore";
import { Phase } from "../models/phase";

interface Props {
  open: boolean;
  onClose: () => void;
}
export default function AddPhaseDialog({ open, onClose }: Props) {
  const { wbsId, proposalId } = useParams();
  const { data, isLoading } = usePhases({
    currentWbsId: wbsId ?? "",
    currentProposalId: proposalId ?? "",
  });
  const currentWbs = useCurrentWbs({
    wbsId: wbsId ?? "",
  });
  const currentProposal = useCurrentProposal({
    proposalId: proposalId ?? "",
  });
  const [phaseOptions, setPhaseOptions] = useState<
    { wbsDatabaseId: number; phaseDatabaseId: number; description: string }[]
  >([]);
  // the selected material
  const [selectedPhaseOption, setSelectedPhaseOption] = useState<{
    wbsDatabaseId: number;
    phaseDatabaseId: number;
    description: string;
  }>({
    wbsDatabaseId: 0,
    phaseDatabaseId: 0,
    description: "",
  });
  const [newPhaseNumber, setNewPhaseNumber] = useState(0);
  const [newPhaseDescription, setNewPhaseDescription] = useState("");

  const listOfWbsNamesNoDescription = ["MOBILIZE", "DEMOBILIZE", "SUPPORT"];
  const listOfPhaseNumbersForSetPhaseName = [
    10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10010, 10011,
    19999, 29987, 29998, 29999, 39982, 39987, 39991, 39998, 39999, 49982, 49988,
    49991, 49992, 49993, 49994, 49995, 49996, 49998, 49999, 59982, 59991, 59998,
    59999, 69982, 69990, 69998, 69999, 79984, 79988, 79989, 79990, 79992, 79993,
    79994, 79995, 79996, 79997, 79998, 79999, 89999, 99986, 99990, 99998, 99999,
    100001, 109999, 110001, 119999, 129998, 129999, 139983, 139984, 139985,
    139989, 139990, 139992, 139993, 139994, 139995, 139996, 139997, 139998,
    139999, 140001, 149999, 159999, 180001, 180002, 180003, 180004, 189999,
    190001, 190002, 190003, 190004, 190005, 190006, 190007, 199999, 200100,
    200200, 200300, 200400, 200500, 200600, 200700, 200800, 200900, 201010,
    201020, 201030, 201040, 201050, 201060, 209980, 209981, 209982, 209998,
    209999,
  ];

  useEffect(() => {
    let filteredPhasesForWbs = localPhaseArray.filter(
      (phase) => phase.wbsDatabaseId === currentWbs?.wbsDatabaseId
    );
    setPhaseOptions(filteredPhasesForWbs);
  }, [currentWbs, wbsId]);

  //Generate the phase name
  useEffect(() => {
    let maxPhaseNumber = 0;
    if (selectedPhaseOption) {
      let option = phaseOptions.find(
        (option) => option.description === selectedPhaseOption.description
      );
      if (
        listOfWbsNamesNoDescription.includes(currentWbs?.name!) ||
        listOfPhaseNumbersForSetPhaseName.includes(option?.phaseDatabaseId!)
      ) {
        setNewPhaseNumber(option?.phaseDatabaseId!);
      } else {
        if (data.length > 0) {
          data.forEach((phase: Phase) => {
            if (phase?.phaseNumber! > maxPhaseNumber) {
              maxPhaseNumber = phase?.phaseNumber!;
            }
          });
          setNewPhaseNumber(maxPhaseNumber + 1);
        } else {
          setNewPhaseNumber(currentWbs?.wbsDatabaseId! + 1);
        }
      }
    }
  }, [data, selectedPhaseOption]);

  useEffect(() => {
    if (listOfWbsNamesNoDescription.includes(currentWbs?.name!)) {
      setNewPhaseDescription(selectedPhaseOption?.description!);
    }
  }, [selectedPhaseOption]);

  const handlePhaseCreate = async () => {
    const newPhase: FirestorePhase = new FirestorePhase({
      phaseDatabaseName: selectedPhaseOption.description,
      phaseDatabaseId: selectedPhaseOption.phaseDatabaseId,
      phaseNumber: newPhaseNumber,
      description:
        newPhaseDescription !== ""
          ? newPhaseDescription
          : selectedPhaseOption.description,
      wbsId: currentWbs?.id,
      proposalId: currentProposal?.id,
    });
    await insertPhase(newPhase);
    // Clear all states
    setSelectedPhaseOption({
      wbsDatabaseId: 0,
      phaseDatabaseId: 0,
      description: "",
    });
    setNewPhaseNumber(0);
    setNewPhaseDescription("");
    onClose();
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add Phase</DialogTitle>
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
            <FormControl variant="standard" sx={{ width: "100%" }} size="small">
              <InputLabel id="demo-simple-select-filled-label">
                Database
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedPhaseOption?.description}
                label="Description"
              >
                {phaseOptions.map((option, index) => (
                  <MenuItem
                    value={option.description}
                    key={index}
                    sx={{ paddingTop: 2, paddingBottom: 2 }}
                    onClick={() => {
                      setSelectedPhaseOption(option);
                    }}
                  >
                    {option?.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!listOfWbsNamesNoDescription.includes(currentWbs?.name!) && (
              <TextField
                InputLabelProps={{ shrink: true }}
                variant="standard"
                label="Phase Description"
                value={newPhaseDescription}
                onChange={(event) => {
                  setNewPhaseDescription(event.target.value);
                }}
                sx={{ width: "100%" }}
              ></TextField>
            )}
            <TextField
              InputLabelProps={{ shrink: true }}
              variant="standard"
              label="Phase Number"
              disabled={
                listOfWbsNamesNoDescription.includes(currentWbs?.name!) ||
                !selectedPhaseOption
              }
              value={newPhaseNumber}
              onChange={(event) => {
                setNewPhaseNumber(parseInt(event.target.value));
              }}
              sx={{ width: "100%" }}
            ></TextField>
            <Button variant="contained" onClick={handlePhaseCreate}>
              Add Phase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

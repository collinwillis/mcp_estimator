import { ExpandMoreOutlined } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Dialog,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { updateSingleProposal } from "../../../api/proposal";
import { useCurrentProposal } from "../../../hooks/current_proposal_hook";
import { FirestoreProposal } from "../../../models/firestore models/proposal_firestore";
import {
  BidType,
  Proposal,
  ProposalStatus,
  UnitedStatesStates,
} from "../../../models/proposal";

interface ProposalInfoAccordionProps {
  proposalId: string;
}
export default function ProposalInfoAccordion({
  proposalId,
}: ProposalInfoAccordionProps) {
  const currentProposal = useCurrentProposal({
    proposalId: proposalId,
  });
  console.log("INFORMATION ACCORDION", currentProposal);
  //Proposal States
  const [proposalNumber, setProposalNumber] = useState(0);
  const [job, setJob] = useState("");
  const [coNumber, setCoNumber] = useState(0);
  const [desctription, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [jobLocationCity, setJobLocationCity] = useState("");
  const [contactInfoState, setContactInfoState] = useState("");

  //Contact States
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [proposalInfoState, setProposalInfoState] = useState("");
  const [zip, setZip] = useState(0);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  //Info States
  const [estimator, setEstimator] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [dateDue, setDateDue] = useState("");
  const [projectStartDate, setProjectStartDate] = useState("");
  const [projectEndDate, setProjectEndDate] = useState("");
  const [bidType, setBidType] = useState("");
  const [status, setStatus] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  useEffect(() => {
    setProposalNumber(currentProposal?.proposalNumber!);
    setJob(currentProposal?.job!);
    setCoNumber(currentProposal?.coNumber!);
    setDescription(currentProposal?.proposalDescription!);
    setOwner(currentProposal?.proposalOwner!);
    setJobLocationCity(currentProposal?.projectCity!);
    setContactInfoState(currentProposal?.contactState!);
    setContact(currentProposal?.contactName!);
    setAddress(currentProposal?.contactAddress!);
    setCity(currentProposal?.contactCity!);
    setProposalInfoState(currentProposal?.projectState!);
    setZip(currentProposal?.contactZip!);
    setPhone(currentProposal?.contactPhone!);
    setEmail(currentProposal?.contactEmail!);
    setEstimator("");
    setDateReceived(currentProposal?.proposalDateReceived!);
    setDateDue(currentProposal?.proposalDateDue!);
    setProjectStartDate(currentProposal?.projectStartDate!);
    setProjectEndDate(currentProposal?.projectEndDate!);
    setBidType(currentProposal?.bidType!);
    setStatus(currentProposal?.proposalStatus!);
  }, [currentProposal]);

  const handlePhoneInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // this is where we'll call our future formatPhoneNumber function that we haven't written yet.
    // const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    // we'll set the input value using our setInputValue
    // setPhone(formattedPhoneNumber);
  };

  const onSubmit = async () => {
    const newProposal: FirestoreProposal = new FirestoreProposal({
      ...currentProposal,
      proposalNumber: proposalNumber,
      job: job,
      coNumber: coNumber,
      proposalDescription: desctription,
      proposalOwner: owner,
      projectCity: jobLocationCity,
      contactState: contactInfoState,
      contactName: contact,
      contactAddress: address,
      contactCity: city,
      projectState: proposalInfoState,
      contactZip: zip,
      contactPhone: phone,
      contactEmail: email,
      proposalDateReceived: dateReceived,
      proposalDateDue: dateDue,
      projectStartDate: projectStartDate,
      projectEndDate: projectEndDate,
      bidType: bidType,
      proposalStatus: status,
    });
    await updateSingleProposal({
      proposalId: proposalId,
      proposal: newProposal,
    });
    setAlertOpen(true);
  };

  return (
    <div style={{ marginBottom: 10, marginTop: 10 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography>Proposal Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/*devide accordion into 3 sections*/}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            ></div>
            <Divider sx={{ marginTop: "10px" }} />
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div
                style={{
                  width: "66.6%",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  outline: ".2px solid #EBEBEB",
                  alignItems: "center",
                }}
              >
                <p>Project Information</p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  <div style={{ width: "50%" }}>
                    <TextField
                      variant="filled"
                      size="small"
                      type="text"
                      label="Proposal #"
                      sx={{ width: "100%" }}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) =>
                        setProposalNumber(parseInt(e.target.value))
                      }
                      value={proposalNumber ?? ""}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="text"
                      label="Job"
                      sx={{ width: "100%" }}
                      onChange={(e) => setJob(e.target.value)}
                      value={job ?? ""}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="text"
                      label="CO #"
                      sx={{ width: "100%" }}
                      onChange={(e) => setCoNumber(parseInt(e.target.value))}
                      value={coNumber ?? ""}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="text"
                      label="Description"
                      sx={{ width: "100%" }}
                      onChange={(e) => setDescription(e.target.value)}
                      value={desctription ?? ""}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="text"
                      label="Owner"
                      sx={{ width: "100%" }}
                      onChange={(e) => setOwner(e.target.value)}
                      value={owner ?? ""}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="text"
                      label="City"
                      sx={{ width: "100%" }}
                      onChange={(e) => setJobLocationCity(e.target.value)}
                      value={jobLocationCity ?? ""}
                    ></TextField>
                    <FormControl variant="filled" fullWidth>
                      <InputLabel
                        id="demo-simple-select-filled-label"
                        shrink={true}
                      >
                        State
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        value={proposalInfoState ?? ""}
                      >
                        {Object.values(UnitedStatesStates).map((item) => (
                          <MenuItem
                            key={item}
                            value={item}
                            onClick={() => setProposalInfoState(item)}
                          >
                            <ListItemText primary={item} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div style={{ width: "50%" }}>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="text"
                      label="Estimator(s)"
                      sx={{ width: "100%" }}
                      onChange={(e) => setEstimator(e.target.value)}
                      value={estimator ?? ""}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="date"
                      label="Date Rec."
                      placeholder="none"
                      sx={{ width: "100%" }}
                      onChange={(e) => setDateReceived(e.target.value)}
                      value={dateReceived?.toString() ?? ""}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="date"
                      label="Due Date"
                      onChange={(e) => setDateDue(e.target.value)}
                      value={dateDue ?? ""}
                      sx={{ width: "100%" }}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="date"
                      label="Project Start Date"
                      onChange={(e) => setProjectStartDate(e.target.value)}
                      value={projectStartDate ?? ""}
                      sx={{ width: "100%" }}
                    ></TextField>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      size="small"
                      type="date"
                      label="Project End Date"
                      onChange={(e) => setProjectEndDate(e.target.value)}
                      value={projectEndDate ?? ""}
                      sx={{ width: "100%" }}
                    ></TextField>
                    <FormControl variant="filled" fullWidth>
                      <InputLabel
                        id="demo-simple-select-filled-label"
                        shrink={true}
                      >
                        Bid Type
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        value={bidType ?? ""}
                      >
                        {Object.values(BidType).map((item) => (
                          <MenuItem
                            key={item}
                            value={item}
                            onClick={() => setBidType(item)}
                          >
                            <ListItemText primary={item} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl variant="filled" fullWidth>
                      <InputLabel
                        id="demo-simple-select-filled-label"
                        shrink={true}
                      >
                        Status
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        value={status ?? ""}
                      >
                        {Object.values(ProposalStatus).map((item) => (
                          <MenuItem
                            key={item}
                            value={item}
                            onClick={() => setStatus(item)}
                          >
                            <ListItemText primary={item} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "33.3%",
                  display: "flex",
                  flexDirection: "column",
                  outline: ".2px solid #EBEBEB",
                  padding: "10px",
                  alignItems: "center",
                }}
              >
                <p>Contact Information</p>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  variant="filled"
                  size="small"
                  type="text"
                  label="Contact"
                  sx={{ width: "100%" }}
                  onChange={(e) => setContact(e.target.value)}
                  value={contact ?? ""}
                ></TextField>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  variant="filled"
                  size="small"
                  type="text"
                  label="Address"
                  sx={{ width: "100%" }}
                  onChange={(e) => setAddress(e.target.value)}
                  value={address ?? ""}
                ></TextField>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  variant="filled"
                  size="small"
                  type="text"
                  label="City"
                  sx={{ width: "100%" }}
                  onChange={(e) => setCity(e.target.value)}
                  value={city ?? ""}
                ></TextField>
                <FormControl variant="filled" fullWidth>
                  <InputLabel
                    id="demo-simple-select-filled-label"
                    shrink={true}
                  >
                    State
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    value={contactInfoState ?? ""}
                  >
                    {Object.values(UnitedStatesStates).map((item) => (
                      <MenuItem
                        key={item}
                        value={item}
                        onClick={() => setContactInfoState(item)}
                      >
                        <ListItemText primary={item} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  variant="filled"
                  size="small"
                  type="text"
                  label="Zip"
                  sx={{ width: "100%" }}
                  onChange={(e) => setZip(parseInt(e.target.value))}
                  value={zip ?? ""}
                ></TextField>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  variant="filled"
                  size="small"
                  type="text"
                  label="Phone"
                  sx={{ width: "100%" }}
                  onChange={(e) => handlePhoneInput(e)}
                  value={phone ?? ""}
                ></TextField>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  variant="filled"
                  size="small"
                  type="text"
                  label="Email"
                  sx={{ width: "100%" }}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email ?? ""}
                ></TextField>
              </div>
            </div>
          </div>
        </AccordionDetails>
        <AccordionActions>
          <div style={{ paddingRight: "20px" }}>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                onSubmit();
              }}
            >
              Save
            </Button>
          </div>
        </AccordionActions>
      </Accordion>
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
        <Alert severity="info">Proposal information successfully saved.</Alert>
      </Dialog>
    </div>
  );
}

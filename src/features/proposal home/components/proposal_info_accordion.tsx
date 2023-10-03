import {ExpandMoreOutlined} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
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
import React, {useEffect, useState} from "react";
import "react-phone-number-input/style.css";
import {updateProposalField, updateSingleProposal} from "../../../api/proposal";
import {useCurrentProposalListener} from "../../../hooks/current_proposal_listener_hook";
import {FirestoreProposal} from "../../../models/firestore models/proposal_firestore";
import {BidType, ProposalStatus, UnitedStatesStates,} from "../../../models/proposal";

interface ProposalInfoAccordionProps {
    proposalId: string;
}

export default function ProposalInfoAccordion({
                                                  proposalId,
                                              }: ProposalInfoAccordionProps) {
    const currentProposal = useCurrentProposalListener({
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

    const autoSaveField = async (field: string, value: any) => {
        await updateProposalField({
            proposalId: proposalId,
            field: field,
            value: value,
        });
    };

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
        setEstimator(currentProposal?.proposalEstimators!);
        setDateReceived(currentProposal?.proposalDateReceived!);
        setDateDue(currentProposal?.proposalDateDue!);
        setProjectStartDate(currentProposal?.projectStartDate!);
        setProjectEndDate(currentProposal?.projectEndDate!);
        setBidType(currentProposal?.bidType!);
        setStatus(currentProposal?.proposalStatus!);
    }, [currentProposal]);
    const formatPhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/\D/g, ''); // Strip all non-numeric characters

        if (input.length <= 3) {
            setPhone(input);
        } else if (input.length <= 6) {
            setPhone(`(${input.substring(0, 3)}) ${input.substring(3)}`);
        } else {
            setPhone(`(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6, 10)}`);
        }
    };
    const onSubmit = async () => {
        const newProposal: FirestoreProposal = new FirestoreProposal({
            ...currentProposal,
            proposalNumber: proposalNumber,
            job: job,
            coNumber: coNumber,
            proposalEstimators: estimator,
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
        <div style={{marginBottom: 10, marginTop: 10}}>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreOutlined/>}>
                    <Typography>Proposal Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
                        <Divider sx={{marginTop: "10px"}}/>
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <div style={{
                                width: "66.6%", padding: "10px", display: "flex", flexDirection: "column",
                                outline: ".2px solid #EBEBEB", alignItems: "center"
                            }}>
                                <p>Project Information</p>
                                <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                                    <div style={{width: "50%"}}>
                                        <TextField variant="filled" size="small" type="number" label="Proposal #"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setProposalNumber(parseInt(e.target.value))}
                                                   onBlur={() => autoSaveField('proposalNumber', proposalNumber)}
                                                   value={proposalNumber ?? ""}/>
                                        <TextField variant="filled" size="small" type="text" label="Job"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setJob(e.target.value)}
                                                   onBlur={() => autoSaveField('job', job)}
                                                   value={job ?? ""}/>
                                        <TextField variant="filled" size="small" type="number" label="CO #"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setCoNumber(parseInt(e.target.value))}
                                                   onBlur={() => autoSaveField('coNumber', coNumber)}
                                                   value={coNumber ?? ""}/>
                                        <TextField variant="filled" size="small" type="text" label="Description"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setDescription(e.target.value)}
                                                   onBlur={() => autoSaveField('proposalDescription', desctription)}
                                                   value={desctription ?? ""}/>
                                        <TextField variant="filled" size="small" type="text" label="Owner"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setOwner(e.target.value)}
                                                   onBlur={() => autoSaveField('proposalOwner', owner)}
                                                   value={owner ?? ""}/>
                                        <TextField variant="filled" size="small" type="text" label="City"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setJobLocationCity(e.target.value)}
                                                   onBlur={() => autoSaveField('projectCity', jobLocationCity)}
                                                   value={jobLocationCity ?? ""}/>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-filled-label"
                                                        shrink={true}>State</InputLabel>
                                            <Select labelId="demo-simple-select-filled-label"
                                                    id="demo-simple-select-filled"
                                                    value={proposalInfoState ?? ""}
                                                    onChange={(e) => setProposalInfoState(e.target.value)}
                                                    onBlur={() => autoSaveField('projectState', proposalInfoState)}>
                                                {Object.values(UnitedStatesStates).map((item) => (
                                                    <MenuItem key={item} value={item}>
                                                        <ListItemText primary={item}/>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div style={{width: "50%"}}>
                                        <TextField variant="filled" size="small" type="text" label="Estimator(s)"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setEstimator(e.target.value)}
                                                   onBlur={() => autoSaveField('proposalEstimators', estimator)}
                                                   value={estimator ?? ""}/>
                                        <TextField variant="filled" size="small" type="date" label="Date Rec."
                                                   placeholder="none" sx={{width: "100%"}}
                                                   InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setDateReceived(e.target.value)}
                                                   onBlur={() => autoSaveField('proposalDateReceived', dateReceived)}
                                                   value={dateReceived?.toString() ?? ""}/>
                                        <TextField variant="filled" size="small" type="date" label="Due Date"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setDateDue(e.target.value)}
                                                   onBlur={() => autoSaveField('proposalDateDue', dateDue)}
                                                   value={dateDue ?? ""}/>
                                        <TextField variant="filled" size="small" type="date" label="Project Start Date"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setProjectStartDate(e.target.value)}
                                                   onBlur={() => autoSaveField('projectStartDate', projectStartDate)}
                                                   value={projectStartDate ?? ""}/>
                                        <TextField variant="filled" size="small" type="date" label="Project End Date"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setProjectEndDate(e.target.value)}
                                                   onBlur={() => autoSaveField('projectEndDate', projectEndDate)}
                                                   value={projectEndDate ?? ""}/>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-filled-label"
                                                        shrink={true}>Bid Type</InputLabel>
                                            <Select labelId="demo-simple-select-filled-label"
                                                    id="demo-simple-select-filled" value={bidType ?? ""}
                                                    onChange={(e) => setBidType(e.target.value)}
                                                    onBlur={() => autoSaveField('bidType', bidType)}>
                                                {Object.values(BidType).map((item) => (
                                                    <MenuItem key={item} value={item}>
                                                        <ListItemText primary={item}/>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-filled-label"
                                                        shrink={true}>Status</InputLabel>
                                            <Select labelId="demo-simple-select-filled-label"
                                                    id="demo-simple-select-filled" value={status ?? ""}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    onBlur={() => autoSaveField('proposalStatus', status)}>
                                                {Object.values(ProposalStatus).map((item) => (
                                                    <MenuItem key={item} value={item}>
                                                        <ListItemText primary={item}/>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                width: "33.3%", display: "flex", flexDirection: "column",
                                outline: ".2px solid #EBEBEB", padding: "10px", alignItems: "center"
                            }}>
                                <p>Contact Information</p>
                                <TextField variant="filled" size="small" type="text" label="Contact"
                                           sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                           onChange={(e) => setContact(e.target.value)}
                                           onBlur={() => autoSaveField('contactName', contact)}
                                           value={contact ?? ""}/>
                                <TextField variant="filled" size="small" type="text" label="Address"
                                           sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                           onChange={(e) => setAddress(e.target.value)}
                                           onBlur={() => autoSaveField('contactAddress', address)}
                                           value={address ?? ""}/>
                                <TextField variant="filled" size="small" type="text" label="City"
                                           sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                           onChange={(e) => setCity(e.target.value)}
                                           onBlur={() => autoSaveField('contactCity', city)}
                                           value={city ?? ""}/>
                                <FormControl variant="filled" fullWidth>
                                    <InputLabel id="demo-simple-select-filled-label"
                                                shrink={true}>State</InputLabel>
                                    <Select labelId="demo-simple-select-filled-label"
                                            id="demo-simple-select-filled" value={contactInfoState ?? ""}
                                            onChange={(e) => setContactInfoState(e.target.value)}
                                            onBlur={() => autoSaveField('contactState', contactInfoState)}>
                                        {Object.values(UnitedStatesStates).map((item) => (
                                            <MenuItem key={item} value={item}>
                                                <ListItemText primary={item}/>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField variant="filled" size="small" type="number" label="Zip"
                                           sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                           onChange={(e) => setZip(parseInt(e.target.value))}
                                           onBlur={() => autoSaveField('contactZip', zip)}
                                           value={zip ?? ""}/>
                                <TextField variant="filled" size="small" label="Phone" sx={{width: "100%"}}
                                           onChange={formatPhoneNumber}
                                           onBlur={() => autoSaveField('contactPhone', phone)}
                                           value={phone ?? ""}/>
                                <TextField variant="filled" size="small" type="email" label="Email"
                                           sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                           onChange={(e) => setEmail(e.target.value)}
                                           onBlur={() => autoSaveField('contactEmail', email)}
                                           value={email ?? ""}/>
                            </div>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
            <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
                <Alert severity="info">Proposal information successfully saved.</Alert>
            </Dialog>
        </div>
    );
}

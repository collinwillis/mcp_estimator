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
import {useUserProfile} from "../../../hooks/user_profile_hook";

interface ProposalInfoAccordionProps {
    proposalId: string;
}

export default function ProposalInfoAccordion({
                                                  proposalId,
                                              }: ProposalInfoAccordionProps) {
    const currentProposal = useCurrentProposalListener({
        proposalId: proposalId,
    });
    //Proposal States
    const [proposalNumber, setProposalNumber] = useState('');
    const [job, setJob] = useState("");
    const [coNumber, setCoNumber] = useState('');
    const [desctription, setDescription] = useState("");
    const [owner, setOwner] = useState("");
    const [jobLocationCity, setJobLocationCity] = useState("");
    const [contactInfoState, setContactInfoState] = useState("");

    //Contact States
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [proposalInfoState, setProposalInfoState] = useState("");
    const [zip, setZip] = useState('');
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

    const [originalProposalNumber, setOriginalProposalNumber] = useState('');
    const [originalJob, setOriginalJob] = useState("");
    const [originalCoNumber, setOriginalCoNumber] = useState('');
    const [originalDescription, setOriginalDescription] = useState("");
    const [originalOwner, setOriginalOwner] = useState("");
    const [originalJobLocationCity, setOriginalJobLocationCity] = useState("");
    const [originalContactInfoState, setOriginalContactInfoState] = useState("");

// Contact States
    const [originalContact, setOriginalContact] = useState("");
    const [originalAddress, setOriginalAddress] = useState("");
    const [originalCity, setOriginalCity] = useState("");
    const [originalProposalInfoState, setOriginalProposalInfoState] = useState("");
    const [originalZip, setOriginalZip] = useState('');
    const [originalPhone, setOriginalPhone] = useState("");
    const [originalEmail, setOriginalEmail] = useState("");

// Info States
    const [originalEstimator, setOriginalEstimator] = useState("");
    const [originalDateReceived, setOriginalDateReceived] = useState("");
    const [originalDateDue, setOriginalDateDue] = useState("");
    const [originalProjectStartDate, setOriginalProjectStartDate] = useState("");
    const [originalProjectEndDate, setOriginalProjectEndDate] = useState("");
    const [originalBidType, setOriginalBidType] = useState("");
    const [originalStatus, setOriginalStatus] = useState("");

    const [alertOpen, setAlertOpen] = useState(false);

    const autoSaveField = async (field: string, value: any) => {
        await updateProposalField({
            proposalId: proposalId,
            field: field,
            value: value,
        });
    };

    useEffect(() => {
        setProposalNumber(currentProposal?.proposalNumber?.toString() || '');
        setOriginalProposalNumber(currentProposal?.proposalNumber?.toString() || '');

        setJob(currentProposal?.job || "");
        setOriginalJob(currentProposal?.job || "");

        setCoNumber(currentProposal?.coNumber?.toString() || '');
        setOriginalCoNumber(currentProposal?.coNumber?.toString() || '');

        setDescription(currentProposal?.proposalDescription || "");
        setOriginalDescription(currentProposal?.proposalDescription || "");

        setOwner(currentProposal?.proposalOwner || "");
        setOriginalOwner(currentProposal?.proposalOwner || "");

        setJobLocationCity(currentProposal?.projectCity || "");
        setOriginalJobLocationCity(currentProposal?.projectCity || "");

        setContactInfoState(currentProposal?.contactState || "");
        setOriginalContactInfoState(currentProposal?.contactState || "");

        setContact(currentProposal?.contactName || "");
        setOriginalContact(currentProposal?.contactName || "");

        setAddress(currentProposal?.contactAddress || "");
        setOriginalAddress(currentProposal?.contactAddress || "");

        setCity(currentProposal?.contactCity || "");
        setOriginalCity(currentProposal?.contactCity || "");

        setProposalInfoState(currentProposal?.projectState || "");
        setOriginalProposalInfoState(currentProposal?.projectState || "");

        setZip(currentProposal?.contactZip?.toString() || '');
        setOriginalZip(currentProposal?.contactZip?.toString() || '');

        setPhone(currentProposal?.contactPhone || "");
        setOriginalPhone(currentProposal?.contactPhone || "");

        setEmail(currentProposal?.contactEmail || "");
        setOriginalEmail(currentProposal?.contactEmail || "");

        setEstimator(currentProposal?.proposalEstimators || "");
        setOriginalEstimator(currentProposal?.proposalEstimators || "");

        setDateReceived(currentProposal?.proposalDateReceived || "");
        setOriginalDateReceived(currentProposal?.proposalDateReceived || "");

        setDateDue(currentProposal?.proposalDateDue || "");
        setOriginalDateDue(currentProposal?.proposalDateDue || "");

        setProjectStartDate(currentProposal?.projectStartDate || "");
        setOriginalProjectStartDate(currentProposal?.projectStartDate || "");

        setProjectEndDate(currentProposal?.projectEndDate || "");
        setOriginalProjectEndDate(currentProposal?.projectEndDate || "");

        setBidType(currentProposal?.bidType || "");
        setOriginalBidType(currentProposal?.bidType || "");

        setStatus(currentProposal?.proposalStatus || "");
        setOriginalStatus(currentProposal?.proposalStatus || "");
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
            proposalNumber: parseInt(proposalNumber),
            job: job,
            coNumber: parseInt(coNumber),
            proposalEstimators: estimator,
            proposalDescription: desctription,
            proposalOwner: owner,
            projectCity: jobLocationCity,
            contactState: contactInfoState,
            contactName: contact,
            contactAddress: address,
            contactCity: city,
            projectState: proposalInfoState,
            contactZip: parseInt(zip),
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
    const {hasWritePermissions} = useUserProfile();
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
                                        <TextField
                                            InputProps={{readOnly: !hasWritePermissions}}
                                            variant="filled"
                                            size="small"
                                            type="number"
                                            label="Proposal #"
                                            sx={{width: "100%"}}
                                            InputLabelProps={{shrink: true}}
                                            onFocus={(e) => e.target.value === proposalNumber.toString() && setProposalNumber('')}
                                            onChange={(e) => setProposalNumber(e.target.value || '')}
                                            onBlur={() => {
                                                if (proposalNumber === null) {
                                                    setProposalNumber(originalProposalNumber);
                                                } else {
                                                    autoSaveField('proposalNumber', proposalNumber);
                                                    setOriginalProposalNumber(proposalNumber);
                                                }
                                            }}
                                            value={proposalNumber ?? ""}
                                        />

                                        <TextField
                                            InputProps={{readOnly: !hasWritePermissions}}
                                            variant="filled"
                                            size="small"
                                            type="text"
                                            label="Job"
                                            sx={{width: "100%"}}
                                            InputLabelProps={{shrink: true}}
                                            onFocus={(e) => e.target.value === job && setJob('')}
                                            onChange={(e) => setJob(e.target.value)}
                                            onBlur={() => {
                                                if (job === '') {
                                                    setJob(originalJob);
                                                } else {
                                                    autoSaveField('job', job);
                                                    setOriginalJob(job);
                                                }
                                            }}
                                            value={job ?? ""}
                                        />

                                        <TextField
                                            InputProps={{readOnly: !hasWritePermissions}}
                                            variant="filled"
                                            size="small"
                                            type="number"
                                            label="CO #"
                                            sx={{width: "100%"}}
                                            InputLabelProps={{shrink: true}}
                                            onFocus={(e) => e.target.value === coNumber.toString() && setCoNumber('')}
                                            onChange={(e) => setCoNumber(e.target.value || '')}
                                            onBlur={() => {
                                                if (coNumber === '') {
                                                    setCoNumber(originalCoNumber);
                                                } else {
                                                    autoSaveField('coNumber', coNumber);
                                                    setOriginalCoNumber(coNumber);
                                                }
                                            }}
                                            value={coNumber ?? ""}
                                        />

                                        <TextField
                                            InputProps={{readOnly: !hasWritePermissions}}
                                            variant="filled"
                                            size="small"
                                            type="text"
                                            label="Description"
                                            sx={{width: "100%"}}
                                            InputLabelProps={{shrink: true}}
                                            onFocus={(e) => e.target.value === desctription && setDescription('')}
                                            onChange={(e) => setDescription(e.target.value)}
                                            onBlur={() => {
                                                if (desctription === '') {
                                                    setDescription(originalDescription);
                                                } else {
                                                    autoSaveField('proposalDescription', desctription);
                                                    setOriginalDescription(desctription);
                                                }
                                            }}
                                            value={desctription ?? ""}
                                        />

                                        <TextField
                                            InputProps={{readOnly: !hasWritePermissions}}
                                            variant="filled"
                                            size="small"
                                            type="text"
                                            label="Owner"
                                            sx={{width: "100%"}}
                                            InputLabelProps={{shrink: true}}
                                            onFocus={(e) => e.target.value === owner && setOwner('')}
                                            onChange={(e) => setOwner(e.target.value)}
                                            onBlur={() => {
                                                if (owner === '') {
                                                    setOwner(originalOwner);
                                                } else {
                                                    autoSaveField('proposalOwner', owner);
                                                    setOriginalOwner(owner);
                                                }
                                            }}
                                            value={owner ?? ""}
                                        />

                                        <TextField
                                            InputProps={{readOnly: !hasWritePermissions}}
                                            variant="filled"
                                            size="small"
                                            type="text"
                                            label="City"
                                            sx={{width: "100%"}}
                                            InputLabelProps={{shrink: true}}
                                            onFocus={(e) => e.target.value === jobLocationCity && setJobLocationCity('')}
                                            onChange={(e) => setJobLocationCity(e.target.value)}
                                            onBlur={() => {
                                                if (jobLocationCity === '') {
                                                    setJobLocationCity(originalJobLocationCity);
                                                } else {
                                                    autoSaveField('projectCity', jobLocationCity);
                                                    setOriginalJobLocationCity(jobLocationCity);
                                                }
                                            }}
                                            value={jobLocationCity ?? ""}
                                        />
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-filled-label"
                                                        shrink={true}>State</InputLabel>
                                            <Select disabled={!hasWritePermissions}
                                                    labelId="demo-simple-select-filled-label"
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
                                        <TextField
                                            InputProps={{readOnly: !hasWritePermissions}}
                                            variant="filled"
                                            size="small"
                                            type="text"
                                            label="Estimator(s)"
                                            sx={{width: "100%"}}
                                            InputLabelProps={{shrink: true}}
                                            onFocus={(e) => e.target.value === estimator && setEstimator('')}
                                            onChange={(e) => setEstimator(e.target.value)}
                                            onBlur={() => {
                                                if (estimator === '') {
                                                    setEstimator(originalEstimator);
                                                } else {
                                                    autoSaveField('proposalEstimators', estimator);
                                                    setOriginalEstimator(estimator);
                                                }
                                            }}
                                            value={estimator ?? ""}
                                        />
                                        <TextField InputProps={{
                                            readOnly: !hasWritePermissions
                                        }} variant="filled" size="small" type="date" label="Date Rec."
                                                   placeholder="none" sx={{width: "100%"}}
                                                   InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setDateReceived(e.target.value)}
                                                   onBlur={() => autoSaveField('proposalDateReceived', dateReceived)}
                                                   value={dateReceived?.toString() ?? ""}/>
                                        <TextField InputProps={{
                                            readOnly: !hasWritePermissions
                                        }} variant="filled" size="small" type="date" label="Due Date"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setDateDue(e.target.value)}
                                                   onBlur={() => autoSaveField('proposalDateDue', dateDue)}
                                                   value={dateDue ?? ""}/>
                                        <TextField InputProps={{
                                            readOnly: !hasWritePermissions
                                        }} variant="filled" size="small" type="date" label="Project Start Date"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setProjectStartDate(e.target.value)}
                                                   onBlur={() => autoSaveField('projectStartDate', projectStartDate)}
                                                   value={projectStartDate ?? ""}/>
                                        <TextField InputProps={{
                                            readOnly: !hasWritePermissions
                                        }} variant="filled" size="small" type="date" label="Project End Date"
                                                   sx={{width: "100%"}} InputLabelProps={{shrink: true}}
                                                   onChange={(e) => setProjectEndDate(e.target.value)}
                                                   onBlur={() => autoSaveField('projectEndDate', projectEndDate)}
                                                   value={projectEndDate ?? ""}/>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-filled-label"
                                                        shrink={true}>Bid Type</InputLabel>
                                            <Select disabled={!hasWritePermissions}
                                                    labelId="demo-simple-select-filled-label"
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
                                            <Select disabled={!hasWritePermissions}
                                                    labelId="demo-simple-select-filled-label"
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
                                <TextField
                                    InputProps={{readOnly: !hasWritePermissions}}
                                    variant="filled"
                                    size="small"
                                    type="text"
                                    label="Contact"
                                    sx={{width: "100%"}}
                                    InputLabelProps={{shrink: true}}
                                    onFocus={(e) => e.target.value === contact && setContact('')}
                                    onChange={(e) => setContact(e.target.value)}
                                    onBlur={() => {
                                        if (contact === '') {
                                            setContact(originalContact);
                                        } else {
                                            autoSaveField('contactName', contact);
                                            setOriginalContact(contact);
                                        }
                                    }}
                                    value={contact ?? ""}
                                />

                                <TextField
                                    InputProps={{readOnly: !hasWritePermissions}}
                                    variant="filled"
                                    size="small"
                                    type="text"
                                    label="Address"
                                    sx={{width: "100%"}}
                                    InputLabelProps={{shrink: true}}
                                    onFocus={(e) => e.target.value === address && setAddress('')}
                                    onChange={(e) => setAddress(e.target.value)}
                                    onBlur={() => {
                                        if (address === '') {
                                            setAddress(originalAddress);
                                        } else {
                                            autoSaveField('contactAddress', address);
                                            setOriginalAddress(address);
                                        }
                                    }}
                                    value={address ?? ""}
                                />

                                <TextField
                                    InputProps={{readOnly: !hasWritePermissions}}
                                    variant="filled"
                                    size="small"
                                    type="text"
                                    label="City"
                                    sx={{width: "100%"}}
                                    InputLabelProps={{shrink: true}}
                                    onFocus={(e) => e.target.value === city && setCity('')}
                                    onChange={(e) => setCity(e.target.value)}
                                    onBlur={() => {
                                        if (city === '') {
                                            setCity(originalCity);
                                        } else {
                                            autoSaveField('contactCity', city);
                                            setOriginalCity(city);
                                        }
                                    }}
                                    value={city ?? ""}
                                />
                                <FormControl variant="filled" fullWidth>
                                    <InputLabel id="demo-simple-select-filled-label"
                                                shrink={true}>State</InputLabel>
                                    <Select disabled={!hasWritePermissions} labelId="demo-simple-select-filled-label"
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
                                <TextField
                                    InputProps={{readOnly: !hasWritePermissions}}
                                    variant="filled"
                                    size="small"
                                    type="number"
                                    label="Zip"
                                    sx={{width: "100%"}}
                                    InputLabelProps={{shrink: true}}
                                    onFocus={(e) => e.target.value === zip.toString() && setZip('')}
                                    onChange={(e) => setZip(e.target.value)}
                                    onBlur={() => {
                                        if (zip === '') {
                                            setZip(originalZip);
                                        } else {
                                            autoSaveField('contactZip', zip);
                                            setOriginalZip(zip);
                                        }
                                    }}
                                    value={zip ?? ""}
                                />

                                <TextField
                                    InputProps={{readOnly: !hasWritePermissions}}
                                    variant="filled"
                                    size="small"
                                    label="Phone"
                                    sx={{width: "100%"}}
                                    onFocus={(e) => e.target.value === phone && setPhone('')}
                                    onChange={formatPhoneNumber}
                                    onBlur={() => {
                                        if (phone === '') {
                                            setPhone(originalPhone);
                                        } else {
                                            autoSaveField('contactPhone', phone);
                                            setOriginalPhone(phone);
                                        }
                                    }}
                                    value={phone ?? ""}
                                />

                                <TextField
                                    InputProps={{readOnly: !hasWritePermissions}}
                                    variant="filled"
                                    size="small"
                                    type="email"
                                    label="Email"
                                    sx={{width: "100%"}}
                                    InputLabelProps={{shrink: true}}
                                    onFocus={(e) => e.target.value === email && setEmail('')}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => {
                                        if (email === '') {
                                            setEmail(originalEmail);
                                        } else {
                                            autoSaveField('contactEmail', email);
                                            setOriginalEmail(email);
                                        }
                                    }}
                                    value={email ?? ""}
                                />

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

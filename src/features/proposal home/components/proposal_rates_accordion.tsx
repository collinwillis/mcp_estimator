import {ExpandMoreOutlined} from "@mui/icons-material";
import {Accordion, AccordionDetails, AccordionSummary, Alert, Dialog, Typography,} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {updateProposalField, updateSingleProposal} from "../../../api/proposal";
import FormattedNumberInput from "../../../components/formatted_number_input";
import {useCurrentProposalListener} from "../../../hooks/current_proposal_listener_hook";
import {FirestoreProposal} from "../../../models/firestore models/proposal_firestore";
import {useUserProfile} from "../../../hooks/user_profile_hook";

interface ProposalRatesAccordionProps {
    proposalId: string;
}

export default function ProposalRatesAccordion({
                                                   proposalId,
                                               }: ProposalRatesAccordionProps) {
    const currentProposal = useCurrentProposalListener({
        proposalId: proposalId,
    });
    //Initialize the States of all of the markups
    const [craftbaseState, setCraftbaseState] = useState<string>("0");
    const [weldbaseState, setWeldbaseState] = useState<string>("0");
    const [burdenState, setBurdenState] = useState<string>("0");
    const [overheadState, setOverheadState] = useState<string>("0");
    const [laborprofitsState, setLaborProfitsState] = useState<string>("0");
    const [fuelState, setFuelState] = useState<string>("0");
    const [consumableState, setConsumableState] = useState<string>("0");
    const [subsistState, setSubsistState] = useState<string>("0");
    const [rigState, setRigState] = useState<string>("0");
    const [materialProfitsState, setMaterialProfitsState] = useState<string>("0");
    const [equipmentProfitsState, setEquipmentProfitsState] =
        useState<string>("0");
    const [subProfitsState, setSubProfitsState] = useState<string>("0");
    const [useTaxState, setUseTaxState] = useState<string>("0");
    const [salesTaxState, setSalesTaxState] = useState<string>("0");
    const [rigProfit, setRigProfit] = useState<string>("0");
    const [originalCraftbaseState, setOriginalCraftbaseState] = useState<string>("0");
    const [originalWeldbaseState, setOriginalWeldbaseState] = useState<string>("0");
    const [originalBurdenState, setOriginalBurdenState] = useState<string>("0");
    const [originalOverheadState, setOriginalOverheadState] = useState<string>("0");
    const [originalLaborprofitsState, setOriginalLaborProfitsState] = useState<string>("0");
    const [originalFuelState, setOriginalFuelState] = useState<string>("0");
    const [originalConsumableState, setOriginalConsumableState] = useState<string>("0");
    const [originalSubsistState, setOriginalSubsistState] = useState<string>("0");
    const [originalRigState, setOriginalRigState] = useState<string>("0");
    const [originalMaterialProfitsState, setOriginalMaterialProfitsState] = useState<string>("0");
    const [originalEquipmentProfitsState, setOriginalEquipmentProfitsState] = useState<string>("0");
    const [originalSubProfitsState, setOriginalSubProfitsState] = useState<string>("0");
    const [originalUseTaxState, setOriginalUseTaxState] = useState<string>("0");
    const [originalSalesTaxState, setOriginalSalesTaxState] = useState<string>("0");
    const [originalRigProfit, setOriginalRigProfit] = useState<string>("0");
    const currentFocusRef = useRef<string | null>(null);

    const {hasWritePermissions} = useUserProfile();

    //Success Dialog State
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    //If the user submits, update the Markups
    const onSubmit = async () => {
        const updatedProposal: FirestoreProposal = new FirestoreProposal({
            ...currentProposal,
            craftBaseRate: parseFloat(craftbaseState),
            weldBaseRate: parseFloat(weldbaseState),
            burdenRate: parseFloat(burdenState),
            overheadRate: parseFloat(overheadState),
            laborProfitRate: parseFloat(laborprofitsState),
            fuelRate: parseFloat(fuelState),
            consumablesRate: parseFloat(consumableState),
            subsistenceRate: parseFloat(subsistState),
            rigRate: parseFloat(rigState),
            materialProfitRate: parseFloat(materialProfitsState),
            equipmentProfitRate: parseFloat(equipmentProfitsState),
            subContractorProfitRate: parseFloat(subProfitsState),
            useTaxRate: parseFloat(useTaxState),
            salesTaxRate: parseFloat(salesTaxState),
            rigProfitRate: parseFloat(rigProfit),
        });
        await updateSingleProposal({
            proposalId: proposalId,
            proposal: updatedProposal,
        });
        setSuccessDialogOpen(true);
    };

    const handleFocus = (fieldName: string) => {
        currentFocusRef.current = fieldName;
        setTimeout(() => {
            if (currentFocusRef.current === fieldName) {
                // Clear the value of the currently focused field
                switch (fieldName) {
                    case 'craftBaseRate':
                        setCraftbaseState('');
                        break;
                    case 'weldBaseRate':
                        setWeldbaseState('');
                        break;
                    case 'burdenRate':
                        setBurdenState('');
                        break;
                    case 'overheadRate':
                        setOverheadState('');
                        break;
                    case 'laborProfitRate':
                        setLaborProfitsState('');
                        break;
                    case 'fuelRate':
                        setFuelState('');
                        break;
                    case 'consumablesRate':
                        setConsumableState('');
                        break;
                    case 'subsistenceRate':
                        setSubsistState('');
                        break;
                    case 'rigRate':
                        setRigState('');
                        break;
                    case 'materialProfitRate':
                        setMaterialProfitsState('');
                        break;
                    case 'equipmentProfitRate':
                        setEquipmentProfitsState('');
                        break;
                    case 'subContractorProfitRate':
                        setSubProfitsState('');
                        break;
                    case 'useTaxRate':
                        setUseTaxState('');
                        break;
                    case 'salesTaxRate':
                        setSalesTaxState('');
                        break;
                    case 'rigProfitRate':
                        setRigProfit('');
                        break;
                    // Add any additional fields as needed
                }
            }
        }, 10);
    };


    const handleBlur = async (fieldName: string, value: string) => {
        let originalStateSetter;
        let stateSetter;
        let origValue: React.SetStateAction<string>;

        switch (fieldName) {
            case 'craftBaseRate':
                originalStateSetter = setOriginalCraftbaseState;
                stateSetter = setCraftbaseState;
                origValue = originalCraftbaseState;
                break;
            case 'weldBaseRate':
                originalStateSetter = setOriginalWeldbaseState;
                stateSetter = setWeldbaseState;
                origValue = originalWeldbaseState;
                break;
            case 'burdenRate':
                originalStateSetter = setOriginalBurdenState;
                stateSetter = setBurdenState;
                origValue = originalBurdenState;
                break;
            case 'overheadRate':
                originalStateSetter = setOriginalOverheadState;
                stateSetter = setOverheadState;
                origValue = originalOverheadState;
                break;
            case 'laborProfitRate':
                originalStateSetter = setOriginalLaborProfitsState;
                stateSetter = setLaborProfitsState;
                origValue = originalLaborprofitsState;
                break;
            case 'fuelRate':
                originalStateSetter = setOriginalFuelState;
                stateSetter = setFuelState;
                origValue = originalFuelState;
                break;
            case 'consumablesRate':
                originalStateSetter = setOriginalConsumableState;
                stateSetter = setConsumableState;
                origValue = originalConsumableState;
                break;
            case 'subsistenceRate':
                originalStateSetter = setOriginalSubsistState;
                stateSetter = setSubsistState;
                origValue = originalSubsistState;
                break;
            case 'rigRate':
                originalStateSetter = setOriginalRigState;
                stateSetter = setRigState;
                origValue = originalRigState;
                break;
            case 'materialProfitRate':
                originalStateSetter = setOriginalMaterialProfitsState;
                stateSetter = setMaterialProfitsState;
                origValue = originalMaterialProfitsState;
                break;
            case 'equipmentProfitRate':
                originalStateSetter = setOriginalEquipmentProfitsState;
                stateSetter = setEquipmentProfitsState;
                origValue = originalEquipmentProfitsState;
                break;
            case 'subContractorProfitRate':
                originalStateSetter = setOriginalSubProfitsState;
                stateSetter = setSubProfitsState;
                origValue = originalSubProfitsState;
                break;
            case 'useTaxRate':
                originalStateSetter = setOriginalUseTaxState;
                stateSetter = setUseTaxState;
                origValue = originalUseTaxState;
                break;
            case 'salesTaxRate':
                originalStateSetter = setOriginalSalesTaxState;
                stateSetter = setSalesTaxState;
                origValue = originalSalesTaxState;
                break;
            case 'rigProfitRate':
                originalStateSetter = setOriginalRigProfit;
                stateSetter = setRigProfit;
                origValue = originalRigProfit;
                break;
            // Add any additional fields as needed
        }

        if (typeof stateSetter === "function" && typeof originalStateSetter === "function") {
            if (value === '') {
                stateSetter(origValue!);
            } else {
                await autoSaveField(fieldName, parseFloat(value));
                originalStateSetter(value);
            }
        } else {
            console.warn(`No setter function defined for field: ${fieldName}`);
        }

        if (currentFocusRef.current === fieldName) {
            currentFocusRef.current = null;
        }
    };

    useEffect(() => {
        if (currentProposal) {
            const formatRate = (rate: number | undefined) => rate ? rate.toFixed(2) : "0";

            setCraftbaseState(formatRate(currentProposal.craftBaseRate));
            setOriginalCraftbaseState(formatRate(currentProposal.craftBaseRate));

            setWeldbaseState(formatRate(currentProposal.weldBaseRate));
            setOriginalWeldbaseState(formatRate(currentProposal.weldBaseRate));

            setBurdenState(formatRate(currentProposal.burdenRate));
            setOriginalBurdenState(formatRate(currentProposal.burdenRate));

            setOverheadState(formatRate(currentProposal.overheadRate));
            setOriginalOverheadState(formatRate(currentProposal.overheadRate));

            setLaborProfitsState(formatRate(currentProposal.laborProfitRate));
            setOriginalLaborProfitsState(formatRate(currentProposal.laborProfitRate));

            setFuelState(formatRate(currentProposal.fuelRate));
            setOriginalFuelState(formatRate(currentProposal.fuelRate));

            setConsumableState(formatRate(currentProposal.consumablesRate));
            setOriginalConsumableState(formatRate(currentProposal.consumablesRate));

            setSubsistState(formatRate(currentProposal.subsistenceRate));
            setOriginalSubsistState(formatRate(currentProposal.subsistenceRate));

            setRigState(formatRate(currentProposal.rigRate));
            setOriginalRigState(formatRate(currentProposal.rigRate));

            setMaterialProfitsState(formatRate(currentProposal.materialProfitRate));
            setOriginalMaterialProfitsState(formatRate(currentProposal.materialProfitRate));

            setEquipmentProfitsState(formatRate(currentProposal.equipmentProfitRate));
            setOriginalEquipmentProfitsState(formatRate(currentProposal.equipmentProfitRate));

            setSubProfitsState(formatRate(currentProposal.subContractorProfitRate));
            setOriginalSubProfitsState(formatRate(currentProposal.subContractorProfitRate));

            setUseTaxState(formatRate(currentProposal.useTaxRate));
            setOriginalUseTaxState(formatRate(currentProposal.useTaxRate));

            setSalesTaxState(formatRate(currentProposal.salesTaxRate));
            setOriginalSalesTaxState(formatRate(currentProposal.salesTaxRate));

            setRigProfit(formatRate(currentProposal.rigProfitRate));
            setOriginalRigProfit(formatRate(currentProposal.rigProfitRate));
        }
    }, [currentProposal]);


    const autoSaveField = async (field: string, value: any) => {
        await updateProposalField({
            proposalId: proposalId,
            field: field,
            value: value,
        });
        console.log(field + " updated to " + value);
    };
    return (
        <div style={{marginBottom: 10, marginTop: 10}}>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreOutlined/>}>
                    <Typography>Rates</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "25%",
                                justifyContent: "space-between",
                            }}
                        ></div>
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <div
                                style={{
                                    width: "33.3%",
                                    outline: ".2px solid #EBEBEB",
                                    padding: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    prefix="$"
                                    label="Craft Base"
                                    value={craftbaseState}
                                    setValue={setCraftbaseState}
                                    onBlur={() => handleBlur('craftBaseRate', craftbaseState)}
                                    onFocus={() => handleFocus('craftBaseRate')}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    prefix="$"
                                    label="Weld Base"
                                    value={weldbaseState}
                                    setValue={setWeldbaseState}
                                    onBlur={() => handleBlur('weldBaseRate', weldbaseState)}
                                    onFocus={() => handleFocus('weldBaseRate')}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    prefix="$"
                                    label="Subsistence"
                                    value={subsistState}
                                    setValue={setSubsistState}
                                    onBlur={() => handleBlur('subsistenceRate', subsistState)}
                                    onFocus={() => handleFocus('subsistenceRate')}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Use Tax"
                                    value={useTaxState}
                                    setValue={setUseTaxState}
                                    onBlur={() => handleBlur('useTaxRate', useTaxState)}
                                    onFocus={() => handleFocus('useTaxRate')}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Sales Tax"
                                    value={salesTaxState}
                                    setValue={setSalesTaxState}
                                    onBlur={() => handleBlur('salesTaxRate', salesTaxState)}
                                    onFocus={() => handleFocus('salesTaxRate')}
                                />

                            </div>
                            <div
                                style={{
                                    width: "33.3%",
                                    outline: ".2px solid #EBEBEB",
                                    padding: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                                // value={updatedMakrup}
                            >
                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Overhead"
                                    value={overheadState}
                                    setValue={setOverheadState}
                                    onFocus={() => handleFocus('overheadRate')}
                                    onBlur={() => handleBlur('overheadRate', overheadState)}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Consumables"
                                    value={consumableState}
                                    setValue={setConsumableState}
                                    onFocus={() => handleFocus('consumablesRate')}
                                    onBlur={() => handleBlur('consumablesRate', consumableState)}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Burden"
                                    value={burdenState}
                                    setValue={setBurdenState}
                                    onFocus={() => handleFocus('burdenRate')}
                                    onBlur={() => handleBlur('burdenRate', burdenState)}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Fuel"
                                    value={fuelState}
                                    setValue={setFuelState}
                                    onFocus={() => handleFocus('fuelRate')}
                                    onBlur={() => handleBlur('fuelRate', fuelState)}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    prefix="$"
                                    label="Rig Pay"
                                    value={rigState}
                                    setValue={setRigState}
                                    onFocus={() => handleFocus('rigRate')}
                                    onBlur={() => handleBlur('rigRate', rigState)}
                                />
                            </div>
                            <div
                                style={{
                                    width: "33.3%",
                                    outline: ".2px solid #EBEBEB",
                                    padding: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Labor Profit"
                                    value={laborprofitsState}
                                    setValue={setLaborProfitsState}
                                    onFocus={() => handleFocus('laborProfitRate')}
                                    onBlur={() => handleBlur('laborProfitRate', laborprofitsState)}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Material Profit"
                                    value={materialProfitsState}
                                    setValue={setMaterialProfitsState}
                                    onFocus={() => handleFocus('materialProfitRate')}
                                    onBlur={() => handleBlur('materialProfitRate', materialProfitsState)}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Equipment Profit"
                                    value={equipmentProfitsState}
                                    setValue={setEquipmentProfitsState}
                                    onFocus={() => handleFocus('equipmentProfitRate')}
                                    onBlur={() => handleBlur('equipmentProfitRate', equipmentProfitsState)}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Subcontractor Profit"
                                    value={subProfitsState}
                                    setValue={setSubProfitsState}
                                    onFocus={() => handleFocus('subContractorProfitRate')}
                                    onBlur={() => handleBlur('subContractorProfitRate', subProfitsState)}
                                />

                                <FormattedNumberInput
                                    readOnly={!hasWritePermissions}
                                    suffix="%"
                                    label="Rig Profit"
                                    value={rigProfit}
                                    setValue={setRigProfit}
                                    onFocus={() => handleFocus('rigProfitRate')}
                                    onBlur={() => handleBlur('rigProfitRate', rigProfit)}
                                />
                            </div>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
            <Dialog
                open={successDialogOpen}
                onClose={() => setSuccessDialogOpen(false)}
            >
                <Alert severity="info">Markups successfully saved.</Alert>
            </Dialog>
        </div>
    );
}

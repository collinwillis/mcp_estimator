import { ExpandMoreOutlined } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Dialog,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import * as CurrencyFormat from "react-currency-format";
import { updateSingleProposal } from "../../../api/proposal";
import FormattedNumberInput from "../../../components/formatted_number_input";
import { useCurrentProposal } from "../../../hooks/current_proposal_hook";
import { useCurrentProposalListener } from "../../../hooks/current_proposal_listener_hook";
import { FirestoreProposal } from "../../../models/firestore models/proposal_firestore";
import { Proposal } from "../../../models/proposal";
interface ProposalRatesAccordionProps {
  proposalId: string;
}
export default function ProposalRatesAccordion({
  proposalId,
}: ProposalRatesAccordionProps) {
  const currentProposal = useCurrentProposalListener({
    proposalId: proposalId,
  });
  console.log(currentProposal);
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

  useEffect(() => {
    if (currentProposal) {
      setCraftbaseState(currentProposal.craftBaseRate!.toFixed(2));
      setWeldbaseState(currentProposal.weldBaseRate!.toFixed(2));
      setBurdenState(currentProposal.burdenRate!.toFixed(2));
      setOverheadState(currentProposal.overheadRate!.toFixed(2));
      setLaborProfitsState(currentProposal.laborProfitRate!.toFixed(2));
      setFuelState(currentProposal.fuelRate!.toFixed(2));
      setConsumableState(currentProposal.consumablesRate!.toFixed(2));
      setSubsistState(currentProposal.subsistenceRate!.toFixed(2));
      setRigState(currentProposal.rigRate!.toFixed(2));
      setMaterialProfitsState(currentProposal.materialProfitRate!.toFixed(2));
      setEquipmentProfitsState(currentProposal.equipmentProfitRate!.toFixed(2));
      setSubProfitsState(currentProposal.subContractorProfitRate!.toFixed(2));
      setUseTaxState(currentProposal.useTaxRate!.toFixed(2));
      setSalesTaxState(currentProposal.salesTaxRate!.toFixed(2));
      setRigProfit(currentProposal.rigProfitRate!.toFixed(2));
    }
  }, [currentProposal]);

  return (
    <div style={{ marginBottom: 10, marginTop: 10 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography>Rates</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                width: "25%",
                justifyContent: "space-between",
              }}
            ></div>
            <div style={{ display: "flex", flexDirection: "row" }}>
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
                  prefix="$"
                  label="Craft Base"
                  value={craftbaseState}
                  setValue={(_) => {
                    setCraftbaseState(_);
                  }}
                />
                <FormattedNumberInput
                  prefix="$"
                  label="Weld Base"
                  value={weldbaseState}
                  setValue={(_) => {
                    setWeldbaseState(_);
                  }}
                />
                <FormattedNumberInput
                  prefix="$"
                  label="Subsistence"
                  value={subsistState}
                  setValue={(_) => {
                    setSubsistState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Use Tax"
                  value={useTaxState}
                  setValue={(_) => {
                    setUseTaxState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Sales Tax"
                  value={salesTaxState}
                  setValue={(_) => {
                    setSalesTaxState(_);
                  }}
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
                  suffix="%"
                  label="Overhead"
                  value={overheadState}
                  setValue={(_) => {
                    setOverheadState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Consumables"
                  value={consumableState}
                  setValue={(_) => {
                    setConsumableState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Burden"
                  value={burdenState}
                  setValue={(_) => {
                    setBurdenState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Fuel"
                  value={fuelState}
                  setValue={(_) => {
                    setFuelState(_);
                  }}
                />
                <FormattedNumberInput
                  prefix="$"
                  label="Rig Pay"
                  value={rigState}
                  setValue={(_) => {
                    setRigState(_);
                  }}
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
                  suffix="%"
                  label="Labor Profit"
                  value={laborprofitsState}
                  setValue={(_) => {
                    setLaborProfitsState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Material Profit"
                  value={materialProfitsState}
                  setValue={(_) => {
                    setMaterialProfitsState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Equipment Profit"
                  value={equipmentProfitsState}
                  setValue={(_) => {
                    setEquipmentProfitsState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Subcontractor Profit"
                  value={subProfitsState}
                  setValue={(_) => {
                    setSubProfitsState(_);
                  }}
                />
                <FormattedNumberInput
                  suffix="%"
                  label="Rig Profit"
                  value={rigProfit}
                  setValue={(_) => {
                    setRigProfit(_);
                  }}
                />
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
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
      >
        <Alert severity="info">Markups successfully saved.</Alert>
      </Dialog>
    </div>
  );
}

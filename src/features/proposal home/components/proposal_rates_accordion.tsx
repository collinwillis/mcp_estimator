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
import { FirestoreProposal } from "../../../models/firestore models/proposal_firestore";
import { Proposal } from "../../../models/proposal";
interface ProposalRatesAccordionProps {
  currentProposal: Proposal;
}
export default function ProposalRatesAccordion({
  currentProposal,
}: ProposalRatesAccordionProps) {
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

  //Set the States of the Markups to the Current Markups
  useEffect(() => {}, []);

  //Create an Updated Markups object

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
      proposalId: currentProposal.id!,
      proposal: updatedProposal,
    });
    setSuccessDialogOpen(true);
  };

  useEffect(() => {
    if (currentProposal) {
      setCraftbaseState(currentProposal.craftBaseRate!.toString());
      setWeldbaseState(currentProposal.weldBaseRate!.toString());
      setBurdenState(currentProposal.burdenRate!.toString());
      setOverheadState(currentProposal.overheadRate!.toString());
      setLaborProfitsState(currentProposal.laborProfitRate!.toString());
      setFuelState(currentProposal.fuelRate!.toString());
      setConsumableState(currentProposal.consumablesRate!.toString());
      setSubsistState(currentProposal.subsistenceRate!.toString());
      setRigState(currentProposal.rigRate!.toString());
      setMaterialProfitsState(currentProposal.materialProfitRate!.toString());
      setEquipmentProfitsState(currentProposal.equipmentProfitRate!.toString());
      setSubProfitsState(currentProposal.subContractorProfitRate!.toString());
      setUseTaxState(currentProposal.useTaxRate!.toString());
      setSalesTaxState(currentProposal.salesTaxRate!.toString());
      setRigProfit(currentProposal.rigProfitRate!.toString());
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
            >
              {/* <Typography>
                Craft Loaded Rate: ${parseFloat(craftLoadedRate).toFixed(2)}
              </Typography>
              <Typography>
                Weld Loaded Rate: ${parseFloat(weldLoadedRate).toFixed(2)}
              </Typography> */}
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div
                style={{
                  width: "33.3%",
                  outline: ".2px solid #EBEBEB",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  prefix="$"
                  suffix="/hr"
                  decimalScale={2}
                  placeholder="Craft Base"
                  label="Craft Base"
                  fixedDecimalScale={true}
                  onValueChange={(values) => {
                    setCraftbaseState(values.value);
                  }}
                  value={craftbaseState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  prefix="$"
                  suffix="/hr"
                  decimalScale={2}
                  placeholder="Weld Base"
                  label="Weld Base"
                  fixedDecimalScale={true}
                  onValueChange={(values: CurrencyFormat.Values) => {
                    setWeldbaseState(values.value);
                  }}
                  value={weldbaseState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  prefix="$"
                  suffix="/hr"
                  decimalScale={2}
                  placeholder="Subsistence"
                  label="Subsistence"
                  fixedDecimalScale={true}
                  onValueChange={(values) => {
                    setSubsistState(values.value);
                  }}
                  value={subsistState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Use Tax"
                  label="Use Tax"
                  onValueChange={(values) => {
                    setUseTaxState(values.value);
                  }}
                  value={useTaxState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Sales Tax"
                  label="Sales Tax"
                  onValueChange={(values) => {
                    setSalesTaxState(values.value);
                  }}
                  value={salesTaxState}
                />
              </div>
              <div
                style={{
                  width: "33.3%",
                  outline: ".2px solid #EBEBEB",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
                // value={updatedMakrup}
              >
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Overhead"
                  label="Overhead"
                  onValueChange={(values) => {
                    setOverheadState(values.value);
                  }}
                  value={overheadState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Consumables"
                  label="Consumables"
                  onValueChange={(values) => {
                    setConsumableState(values.value);
                  }}
                  value={consumableState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Burden"
                  label="Burden"
                  onValueChange={(values) => {
                    setBurdenState(values.value);
                  }}
                  value={burdenState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Fuel"
                  label="Fuel"
                  onValueChange={(values) => {
                    setFuelState(values.value);
                  }}
                  value={fuelState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  prefix="$"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Rig"
                  label="Rig"
                  onValueChange={(values) => {
                    setRigState(values.value);
                  }}
                  value={rigState}
                />
              </div>
              <div
                style={{
                  width: "33.3%",
                  outline: ".2px solid #EBEBEB",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Labor Profit"
                  label="Labor Profits"
                  onValueChange={(values) => {
                    setLaborProfitsState(values.value);
                  }}
                  value={laborprofitsState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Material Profit"
                  label="Material Profit"
                  onValueChange={(values) => {
                    setMaterialProfitsState(values.value);
                  }}
                  value={materialProfitsState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Equipment Profit"
                  label="Equipment Profit"
                  onValueChange={(values) => {
                    setEquipmentProfitsState(values.value);
                  }}
                  value={equipmentProfitsState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Subcontractor Profit"
                  label="Subcontractor Profit"
                  onValueChange={(values) => {
                    setSubProfitsState(values.value);
                  }}
                  value={subProfitsState}
                />
                <CurrencyFormat
                  customInput={(props) => <TextField {...props} />}
                  thousandSeparator
                  variant="filled"
                  suffix="%"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Sub Profit"
                  label="Rig Profit"
                  onValueChange={(values) => {
                    setRigProfit(values.value);
                  }}
                  value={rigProfit}
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

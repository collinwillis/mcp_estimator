import React, { useEffect, useState } from 'react';
import { ExpandMoreOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Dialog,
  Typography,
  Box,
  Divider,
} from '@mui/material';

import { updateSingleProposal } from '../../../api/proposal';
import FormattedNumberInput from '../../../components/formatted_number_input';
import { useCurrentProposalListener } from '../../../hooks/current_proposal_listener_hook';
import { useUserProfile } from '../../../hooks/user_profile_hook';
import { FirestoreProposal } from '../../../models/firestore models/proposal_firestore';

interface ProposalRatesAccordionProps {
  proposalId: string;
}

export default function ProposalRatesAccordion({
  proposalId,
}: ProposalRatesAccordionProps) {
  const currentProposal = useCurrentProposalListener({
    proposalId,
  });
  const { hasWritePermissions } = useUserProfile();

  const [craftbaseState, setCraftbaseState] = useState<string>('0');
  const [weldbaseState, setWeldbaseState] = useState<string>('0');
  const [burdenState, setBurdenState] = useState<string>('0');
  const [overheadState, setOverheadState] = useState<string>('0');
  const [laborprofitsState, setLaborProfitsState] = useState<string>('0');
  const [fuelState, setFuelState] = useState<string>('0');
  const [consumableState, setConsumableState] = useState<string>('0');
  const [subsistState, setSubsistState] = useState<string>('0');
  const [rigState, setRigState] = useState<string>('0');
  const [materialProfitsState, setMaterialProfitsState] = useState<string>('0');
  const [equipmentProfitsState, setEquipmentProfitsState] =
    useState<string>('0');
  const [subProfitsState, setSubProfitsState] = useState<string>('0');
  const [useTaxState, setUseTaxState] = useState<string>('0');
  const [salesTaxState, setSalesTaxState] = useState<string>('0');
  const [rigProfit, setRigProfit] = useState<string>('0');

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    if (currentProposal) {
      const formatRate = (rate: number | undefined) =>
        rate ? rate.toFixed(2) : '0';

      setCraftbaseState(formatRate(currentProposal.craftBaseRate));
      setWeldbaseState(formatRate(currentProposal.weldBaseRate));
      setBurdenState(formatRate(currentProposal.burdenRate));
      setOverheadState(formatRate(currentProposal.overheadRate));
      setLaborProfitsState(formatRate(currentProposal.laborProfitRate));
      setFuelState(formatRate(currentProposal.fuelRate));
      setConsumableState(formatRate(currentProposal.consumablesRate));
      setSubsistState(formatRate(currentProposal.subsistenceRate));
      setRigState(formatRate(currentProposal.rigRate));
      setMaterialProfitsState(formatRate(currentProposal.materialProfitRate));
      setEquipmentProfitsState(formatRate(currentProposal.equipmentProfitRate));
      setSubProfitsState(formatRate(currentProposal.subContractorProfitRate));
      setUseTaxState(formatRate(currentProposal.useTaxRate));
      setSalesTaxState(formatRate(currentProposal.salesTaxRate));
      setRigProfit(formatRate(currentProposal.rigProfitRate));
    }
  }, [currentProposal]);

  const onSubmit = async () => {
    const updatedProposal: FirestoreProposal = new FirestoreProposal({
      ...currentProposal as any,
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
      proposalId,
      proposal: updatedProposal,
    });
    setSuccessDialogOpen(true);
  };

  return (
    <Box mb={2} mt={2}>
      <Accordion elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant='h6'>Rates</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display='flex' flexDirection='column'>
            <Divider sx={{ mb: 2 }} />
            <Box display='flex' flexDirection='row' gap={2}>
              <Box width='33.3%' p={2} display='flex' flexDirection='column'>
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  prefix='$'
                  label='Craft Base'
                  value={craftbaseState}
                  setValue={setCraftbaseState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  prefix='$'
                  label='Weld Base'
                  value={weldbaseState}
                  setValue={setWeldbaseState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  prefix='$'
                  label='Subsistence'
                  value={subsistState}
                  setValue={setSubsistState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Use Tax'
                  value={useTaxState}
                  setValue={setUseTaxState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Sales Tax'
                  value={salesTaxState}
                  setValue={setSalesTaxState}
                />
              </Box>
              <Box width='33.3%' p={2} display='flex' flexDirection='column'>
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Overhead'
                  value={overheadState}
                  setValue={setOverheadState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Consumables'
                  value={consumableState}
                  setValue={setConsumableState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Burden'
                  value={burdenState}
                  setValue={setBurdenState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Fuel'
                  value={fuelState}
                  setValue={setFuelState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  prefix='$'
                  label='Rig Pay'
                  value={rigState}
                  setValue={setRigState}
                />
              </Box>
              <Box width='33.3%' p={2} display='flex' flexDirection='column'>
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Labor Profit'
                  value={laborprofitsState}
                  setValue={setLaborProfitsState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Material Profit'
                  value={materialProfitsState}
                  setValue={setMaterialProfitsState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Equipment Profit'
                  value={equipmentProfitsState}
                  setValue={setEquipmentProfitsState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Subcontractor Profit'
                  value={subProfitsState}
                  setValue={setSubProfitsState}
                />
                <FormattedNumberInput
                  readOnly={!hasWritePermissions}
                  suffix='%'
                  label='Rig Profit'
                  value={rigProfit}
                  setValue={setRigProfit}
                />
              </Box>
            </Box>
            <Button
              variant='contained'
              size='large'
              sx={{ width: 200, alignSelf: 'center', mt: 2 }}
              color='primary'
              onClick={onSubmit}>
              Save
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}>
        <Alert severity='info'>Markups successfully saved.</Alert>
      </Dialog>
    </Box>
  );
}

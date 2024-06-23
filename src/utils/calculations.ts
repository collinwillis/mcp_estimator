// Helper functions
import { Activity } from '../models/activity';
import { EquipmentOwnership } from '../models/equipment';
import { Proposal } from '../models/proposal';

const pctToDecimal = (rate: number): number => rate / 100;
const sumRates = (...rates: number[]): number =>
  rates.reduce((acc, rate) => acc + pctToDecimal(rate), 0);

// Calculates and returns the craft loaded rate.
export const getCraftLoadedRate = ({
  proposal,
  customCraftBaseRate = 0,
  customSubsistenceRate = 0,
}: {
  proposal: Proposal;
  customCraftBaseRate?: number;
  customSubsistenceRate?: number;
}): number => {
  const {
    craftBaseRate,
    burdenRate,
    overheadRate,
    laborProfitRate,
    fuelRate,
    consumablesRate,
    subsistenceRate,
  } = proposal;
  const craftBase = customCraftBaseRate || craftBaseRate;
  const subsistence = customSubsistenceRate || subsistenceRate;
  const totalRateSum = sumRates(
    burdenRate!,
    overheadRate!,
    laborProfitRate!,
    fuelRate!,
    consumablesRate!,
  );
  return craftBase! + craftBase! * totalRateSum + subsistence!;
};

// Calculates and returns the welder loaded rate.
export const getWelderLoadedRate = ({
  proposal,
}: {
  proposal: Proposal;
}): number => {
  const {
    weldBaseRate,
    burdenRate,
    overheadRate,
    laborProfitRate,
    fuelRate,
    consumablesRate,
    subsistenceRate,
    rigProfitRate,
    rigRate,
  } = proposal;
  const ratesSum = sumRates(
    burdenRate!,
    overheadRate!,
    laborProfitRate!,
    fuelRate!,
    consumablesRate!,
    rigProfitRate!,
  );
  return (
    weldBaseRate! +
    weldBaseRate! * ratesSum +
    subsistenceRate! +
    rigRate! +
    rigRate! * pctToDecimal(rigProfitRate!)
  );
};

// Calculates and returns the material cost.
export const getMaterialCost = ({
  activity,
  proposal,
}: {
  activity: Activity;
  proposal: Proposal;
}): number => {
  const { price, quantity } = activity;
  const { salesTaxRate, materialProfitRate } = proposal;
  return quantity * price * (1 + sumRates(materialProfitRate!, salesTaxRate!));
};

// Calculates and returns the equipment cost.
export const getEquipmentCost = ({
  activity,
  proposal,
}: {
  activity: Activity;
  proposal: Proposal;
}): number => {
  const { quantity, time, price, equipmentOwnership } = activity;
  const { equipmentProfitRate, useTaxRate } = proposal;
  return equipmentOwnership === EquipmentOwnership.owned
    ? quantity * time * price
    : quantity *
        time *
        price *
        (1 + sumRates(equipmentProfitRate!, useTaxRate!));
};

// Calculates and returns the subcontractor cost.
export const getSubcontractorCost = ({
  activity,
  proposal,
}: {
  activity: Activity;
  proposal: Proposal;
}): number => {
  const { materialCost, quantity, equipmentCost, craftCost } = activity;
  const { subContractorProfitRate, salesTaxRate } = proposal;
  return (
    quantity *
    (craftCost * (1 + pctToDecimal(subContractorProfitRate!)) +
      materialCost *
        (1 +
          pctToDecimal(subContractorProfitRate!) +
          pctToDecimal(salesTaxRate!)) +
      equipmentCost * (1 + pctToDecimal(subContractorProfitRate!)))
  );
};

// Calculates and returns the cost-only cost.
export const getCostOnlyCost = ({
  activity,
}: {
  activity: Activity;
}): number => {
  const { price, quantity } = activity;
  return quantity * price;
};

// Calculates and returns the total cost.
export const getTotalCost = ({ activity }: { activity: Activity }): number => {
  const {
    craftCost,
    welderCost,
    materialCost,
    equipmentCost,
    subContractorCost,
    costOnlyCost,
  } = activity;
  return (
    craftCost +
    welderCost +
    materialCost +
    equipmentCost +
    subContractorCost +
    costOnlyCost
  );
};

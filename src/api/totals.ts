import { Activity } from "../models/activity";
import { Proposal } from "../models/proposal";

export const getCraftLoadedRate = ({
  proposal,
  customCraftBaseRate,
  customSubsistenceRate,
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
  let craftBase = customCraftBaseRate ?? craftBaseRate;
  let subsistence = customSubsistenceRate ?? subsistenceRate;

  let tempCraftLoadedRate =
    (craftBase ?? 0) +
    (craftBase ?? 0) *
      ((burdenRate ?? 0) / 100 +
        (overheadRate ?? 0) / 100 +
        (laborProfitRate ?? 0) / 100 +
        (fuelRate ?? 0) / 100 +
        (consumablesRate ?? 0) / 100) +
    (subsistence ?? 0);

  return tempCraftLoadedRate;
};

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

  let tempWeldLoadedRate =
    (weldBaseRate ?? 0) +
    (weldBaseRate ?? 0) *
      ((burdenRate ?? 0) / 100 +
        (overheadRate ?? 0) / 100 +
        (laborProfitRate ?? 0) / 100 +
        (fuelRate ?? 0) / 100 +
        (consumablesRate ?? 0) / 100) +
    (subsistenceRate ?? 0) +
    ((rigRate ?? 0) + (rigRate ?? 0) * ((rigProfitRate ?? 0) / 100));

  return tempWeldLoadedRate;
};

export const getMaterialCost = ({
  activity,
  proposal,
}: {
  activity: Activity;
  proposal: Proposal;
}): number => {
  const { price, quantity } = activity;
  const { salesTaxRate, materialProfitRate } = proposal;

  let tempMaterialCost =
    quantity *
    (price +
      price * ((materialProfitRate ?? 0) / 100 + (salesTaxRate ?? 0) / 100));

  return tempMaterialCost;
};

export const getEquipmentCost = ({
  activity,
  proposal,
}: {
  activity: Activity;
  proposal: Proposal;
}): number => {
  const { quantity, time, price } = activity;
  const { equipmentProfitRate, useTaxRate } = proposal;

  let tempEquipmentCost =
    quantity *
    (time *
      (price +
        price * ((equipmentProfitRate ?? 0) / 100 + (useTaxRate ?? 0) / 100)));

  return tempEquipmentCost;
};

export const getSubcontractorCost = ({
  activity,
  proposal,
}: {
  activity: Activity;
  proposal: Proposal;
}): number => {
  const { materialCost, quantity, equipmentCost, craftCost } = activity;
  const { subContractorProfitRate, salesTaxRate, useTaxRate } = proposal;

  let subProfit = subContractorProfitRate! / 100;
  let salesTax = salesTaxRate! / 100;
  let useTax = useTaxRate! / 100;
  let craftProfit = craftCost * subProfit;
  let materialProfit = materialCost * (subProfit + salesTax);
  let equipmentProfit = equipmentCost * subProfit;

  let tempSubcontractorCost =
    quantity *
    (craftCost +
      craftProfit +
      (materialCost + materialProfit) +
      (equipmentCost + equipmentProfit));

  return tempSubcontractorCost;
};

export const getCostOnlyCost = ({
  activity,
}: {
  activity: Activity;
}): number => {
  const { price, quantity } = activity;

  let tempCostOnlyCost = quantity * price;

  return tempCostOnlyCost;
};

export const getTotalCost = ({ activity }: { activity: Activity }): number => {
  const {
    craftCost,
    welderCost,
    materialCost,
    equipmentCost,
    subContractorCost,
    costOnlyCost,
  } = activity;

  let tempTotalCost =
    craftCost +
    welderCost +
    materialCost +
    equipmentCost +
    subContractorCost +
    costOnlyCost;

  return tempTotalCost;
};

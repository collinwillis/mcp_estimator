import {Activity} from "../models/activity";
import {EquipmentOwnership} from "../models/equipment";
import {Proposal} from "../models/proposal";

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
        craftBaseRate = 0,
        burdenRate = 0,
        overheadRate = 0,
        laborProfitRate = 0,
        fuelRate = 0,
        consumablesRate = 0,
        subsistenceRate = 0,
    } = proposal;

    // Applying custom rates if provided, else default to proposal rates.
    const craftBase = customCraftBaseRate || craftBaseRate;
    const subsistence = customSubsistenceRate || subsistenceRate;

    // Calculate and return the craft loaded rate.
    return (
        craftBase +
        craftBase *
        (burdenRate + overheadRate + laborProfitRate + fuelRate + consumablesRate) / 100 +
        subsistence
    );
};

// Calculates and returns the welder loaded rate.
export const getWelderLoadedRate = ({proposal}: { proposal: Proposal }): number => {
    const {
        weldBaseRate = 0,
        burdenRate = 0,
        overheadRate = 0,
        laborProfitRate = 0,
        fuelRate = 0,
        consumablesRate = 0,
        subsistenceRate = 0,
        rigProfitRate = 0,
        rigRate = 0,
    } = proposal;

    return (
        weldBaseRate +
        weldBaseRate *
        (burdenRate + overheadRate + laborProfitRate + fuelRate + consumablesRate) / 100 +
        subsistenceRate +
        rigRate +
        rigRate * rigProfitRate / 100
    );
};

// Calculates and returns the material cost.
export const getMaterialCost = ({
                                    activity: {price = 0, quantity = 0},
                                    proposal: {salesTaxRate = 0, materialProfitRate = 0},
                                }: {
    activity: Activity;
    proposal: Proposal;
}): number => quantity * price * (1 + (materialProfitRate + salesTaxRate) / 100);

// Calculates and returns the equipment cost.
export const getEquipmentCost = ({
                                     activity: {quantity = 0, time = 0, price = 0, equipmentOwnership},
                                     proposal: {equipmentProfitRate = 0, useTaxRate = 0},
                                 }: {
    activity: Activity;
    proposal: Proposal;
}): number =>
    equipmentOwnership === EquipmentOwnership.owned
        ? quantity * time * price
        : quantity * time * price * (1 + (equipmentProfitRate + useTaxRate) / 100);

// Calculates and returns the subcontractor cost.
export const getSubcontractorCost = ({
                                         activity: {materialCost = 0, quantity = 0, equipmentCost = 0, craftCost = 0},
                                         proposal: {subContractorProfitRate = 0, salesTaxRate = 0, useTaxRate = 0},
                                     }: {
    activity: Activity;
    proposal: Proposal;
}): number => {
    const subProfit = subContractorProfitRate / 100;
    const salesTax = salesTaxRate / 100;

    return quantity * (
        craftCost * (1 + subProfit) +
        materialCost * (1 + subProfit + salesTax) +
        equipmentCost * (1 + subProfit)
    );
};

// Calculates and returns the cost-only cost.
export const getCostOnlyCost = ({
                                    activity: {price = 0, quantity = 0},
                                }: {
    activity: Activity;
}): number => quantity * price;

// Calculates and returns the total cost.
export const getTotalCost = ({activity}: { activity: Activity }): number => {
    const {
        craftCost = 0,
        welderCost = 0,
        materialCost = 0,
        equipmentCost = 0,
        subContractorCost = 0,
        costOnlyCost = 0,
    } = activity;

    return craftCost + welderCost + materialCost + equipmentCost + subContractorCost + costOnlyCost;
};

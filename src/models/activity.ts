import {Constant} from "./constant";
import {Equipment} from "./equipment";

export class Activity {
    id: string;
    proposalId: string;
    wbsId: string;
    phaseId: string;
    constant: Constant | null;
    equipment: Equipment | null;
    description: string;
    quantity: number;
    sortOrder: number;
    activityType: ActivityType;
    unit: string;
    craftConstant: number;
    price: number;
    time: number;
    welderConstant: number;
    craftManHours: number;
    craftCost: number;
    welderManHours: number;
    welderCost: number;
    materialCost: number;
    equipmentCost: number;
    subContractorCost: number;
    costOnlyCost: number;
    totalCost: number;
    craftBaseRate: number;
    subsistenceRate: number;
    weldBaseRate: number;
    customCraftRate: number | null;
    customSubsistenceRate: number | null;
    equipmentOwnership: string | null;
    dateAdded: number | null; // Added new property
    rowId: string | null; // Added new property

    constructor(
        id: string,
        description: string,
        proposalId: string,
        wbsId: string,
        phaseId: string,
        constant: Constant | null,
        equipment: Equipment | null,
        quantity: number,
        sortOrder: number,
        activityType: ActivityType,
        unit: string,
        craftConstant: number = 0,
        welderConstant: number = 0,
        craftManHours: number = 0,
        craftCost: number = 0,
        welderManHours: number = 0,
        welderCost: number = 0,
        price: number = 0,
        time: number = 0,
        materialCost: number = 0,
        equipmentCost: number = 0,
        subContractorCost: number = 0,
        costOnlyCost: number = 0,
        totalCost: number = 0,
        craftBaseRate: number = 0,
        subsistenceRate: number = 0,
        weldBaseRate: number = 0,
        customCraftRate: number | null,
        customSubsistenceRate: number | null,
        equipmentOwnership: string | null,
        dateAdded: number | null, // Added new parameter
        rowId: string | null // Added new parameter
    ) {
        this.id = id;
        this.description = description;
        this.constant = constant;
        this.equipment = equipment;
        this.proposalId = proposalId;
        this.wbsId = wbsId;
        this.phaseId = phaseId;
        this.quantity = quantity;
        this.sortOrder = sortOrder;
        this.activityType = activityType;
        this.unit = unit;
        this.craftConstant = craftConstant;
        this.price = price;
        this.time = time;
        this.welderConstant = welderConstant;
        this.craftManHours = craftManHours;
        this.craftCost = craftCost;
        this.welderManHours = welderManHours;
        this.welderCost = welderCost;
        this.materialCost = materialCost;
        this.equipmentCost = equipmentCost;
        this.subContractorCost = subContractorCost;
        this.costOnlyCost = costOnlyCost;
        this.totalCost = totalCost;
        this.craftBaseRate = craftBaseRate;
        this.subsistenceRate = subsistenceRate;
        this.weldBaseRate = weldBaseRate;
        this.customCraftRate = customCraftRate;
        this.customSubsistenceRate = customSubsistenceRate;
        this.equipmentOwnership = equipmentOwnership;
        this.dateAdded = dateAdded; // Initialize new property
        this.rowId = rowId; // Initialize new property
    }
}

export enum ActivityType {
    laborItem = "laborItem",
    materialItem = "materialItem",
    equipmentItem = "equipmentItem",
    subContractorItem = "subContractorItem",
    costOnlyItem = "costOnlyItem",
    customLaborItem = "customLaborItem",
}

import { ActivityType } from '../activity';
import { Constant } from '../constant';
import { Equipment } from '../equipment';

export class FirestoreActivity {
  proposalId: string | null;

  wbsId: string | null;

  phaseId: string | null;

  unit: string | null;

  constant: Constant | null;

  equipment: Equipment | null;

  craftConstant: number | null;

  welderConstant: number | null;

  price: number | null;

  time: number | null;

  activityType: ActivityType | null;

  description: string | null;

  quantity: number | null;

  craftBaseRate: number | null;

  subsistenceRate: number | null;

  equipmentCost: number | null;

  materialCost: number | null;

  craftCost: number | null;

  equipmentOwnership: string | null;

  dateAdded: number | null;

  sortOrder: number | null;

  constructor({
    proposalId,
    wbsId,
    phaseId,
    unit,
    description,
    quantity,
    constant,
    equipment,
    craftConstant,
    welderConstant,
    price,
    time,
    activityType,
    craftBaseRate,
    subsistenceRate,
    equipmentCost,
    materialCost,
    craftCost,
    equipmentOwnership,
    dateAdded,
    sortOrder,
  }: {
    proposalId?: string | null;
    wbsId?: string | null;
    phaseId?: string | null;
    unit?: string | null;
    description?: string | null;
    quantity?: number | null;
    constant: Constant | null;
    equipment: Equipment | null;
    craftConstant: number | null;
    welderConstant: number | null;
    price: number | null;
    time: number | null;
    activityType: ActivityType | null;
    craftBaseRate: number | null;
    subsistenceRate: number | null;
    equipmentCost: number | null;
    materialCost: number | null;
    craftCost: number | null;
    equipmentOwnership: string | null;
    dateAdded: number | null;
    sortOrder: number | null;
  }) {
    this.proposalId = proposalId ?? null;
    this.wbsId = wbsId ?? null;
    this.phaseId = phaseId ?? null;
    this.unit = unit ?? null;
    this.description = description ?? null;
    this.quantity = quantity ?? null;
    this.activityType = activityType ?? null;
    this.constant = constant ?? null;
    this.equipment = equipment ?? null;
    this.craftConstant = craftConstant ?? null;
    this.welderConstant = welderConstant ?? null;
    this.price = price ?? null;
    this.time = time ?? null;
    this.craftBaseRate = craftBaseRate ?? null;
    this.subsistenceRate = subsistenceRate ?? null;
    this.equipmentCost = equipmentCost ?? null;
    this.materialCost = materialCost ?? null;
    this.craftCost = craftCost ?? null;
    this.equipmentOwnership = equipmentOwnership ?? null;
    this.dateAdded = dateAdded ?? null;
    this.sortOrder = sortOrder ?? null;
  }
}

export const baseCustomLabor: Partial<FirestoreActivity> = {
  constant: null,
  equipment: null,
  time: 0,
  craftConstant: 0,
  welderConstant: 0,
  activityType: ActivityType.customLaborItem,
  description: 'NEW CUSTOM LABOR ITEM',
  quantity: 0,
  price: 0,
  craftBaseRate: null,
  subsistenceRate: null,
  craftCost: null,
  equipmentCost: null,
  materialCost: null,
  equipmentOwnership: null,
  sortOrder: null,
};
export const baseCostOnly: Partial<FirestoreActivity> = {
  constant: null,
  equipment: null,
  time: 0,
  craftConstant: 0,
  welderConstant: 0,
  activityType: ActivityType.costOnlyItem,
  description: 'NEW COST ONLY ITEM',
  quantity: 0,
  price: 0,
  craftBaseRate: null,
  subsistenceRate: null,
  craftCost: null,
  equipmentCost: null,
  materialCost: null,
  equipmentOwnership: null,
  sortOrder: null,
};
export const baseMaterial: Partial<FirestoreActivity> = {
  constant: null,
  equipment: null,
  time: 0,
  craftConstant: 0,
  welderConstant: 0,
  activityType: ActivityType.materialItem,
  description: 'NEW MATERIAL ITEM',
  quantity: 0,
  price: 0,
  craftBaseRate: null,
  subsistenceRate: null,
  craftCost: null,
  equipmentCost: null,
  materialCost: null,
  equipmentOwnership: null,
  sortOrder: null,
};
export const baseSubcontractor: Partial<FirestoreActivity> = {
  unit: 'HOURS',
  constant: null,
  equipment: null,
  time: 0,
  craftConstant: 0,
  welderConstant: 0,
  activityType: ActivityType.subContractorItem,
  description: 'NEW SUBCONTRACTOR',
  quantity: 0,
  price: 0,
  craftBaseRate: null,
  subsistenceRate: null,
  craftCost: 0,
  equipmentCost: 0,
  materialCost: 0,
  equipmentOwnership: null,
  sortOrder: null,
};

import { DocumentReference } from "firebase/firestore";
import { ActivityType } from "../activity";
import { Constant } from "../constant";
import { Equipment } from "../equipment";

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
  }
}

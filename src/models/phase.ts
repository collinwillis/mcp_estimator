export class Phase {
  id?: string;
  phaseDatabaseId?: number | string;
  phaseDatabaseName?: string;
  phaseNumber?: number;
  description?: string;
  size?: string;
  flc?: string;
  system?: string;
  spec?: string;
  insulation?: string;
  insulationSize?: string;
  sheet?: string;
  area?: string;
  status?: string;
  customQuantity?: number;
  quantity?: number;
  customUnit?: string;
  unit?: string;
  craftManHours?: number;
  craftCost?: number;
  welderManHours?: number;
  welderCost?: number;
  materialCost?: number;
  equipmentCost?: number;
  subContractorCost?: number;
  costOnlyCost?: number;
  totalCost?: number;
  constructor(data: Partial<Phase>) {
    Object.assign(this, data);
  }
}

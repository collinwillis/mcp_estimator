export class Wbs {
  id?: string;
  proposalId?: string;
  wbsDatabaseId?: number;
  name?: string;
  quantity?: number;
  customQuantity?: number;
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
  constructor(data: Partial<Wbs>) {
    Object.assign(this, data);
  }
}

enum WbsEnum {
  mobilize = "MOBILIZE",
  sitePreperation = "SITE PREPERATION",
  concrete = "CONCRETE",
  towersVesselsEquipment = "TOWERS/VESSELS/EQUIPMENT",
  pumpsAndDrivers = "PUMPS & DRIVERS",
  structural = "STRUCTURAL",
  agPiping = "AG PIPING",
  electrical = "ELECTRICAL",
  instruments = "INSTRUMENTS",
  insulation = "INSULATION",
  painting = "PAINTING",
  dismantling = "DISMANTLING",
  bgPiping = "BG PIPING",
  refractory = "REFRACTORY",
  buildings = "BUILDINGS",
  specialtyServices = "SPECIALTY SERVICES",
  demobilize = "DEMOBILIZE",
  support = "SUPPORT",
}

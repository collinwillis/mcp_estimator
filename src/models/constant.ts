export class Constant {
  id: number;
  phaseDatabaseId: number;
  description: string;
  sortOrder: number;
  craftConstant: number;
  craftUnits: string;
  weldConstant: number;
  weldUnits: string;

  constructor(
    id: number,
    phaseDatabaseId: number,
    description: string,
    sortOrder: number,
    craftConstant: number,
    craftUnits: string,
    weldConstant: number,
    weldUnits: string
  ) {
    this.id = id;
    this.phaseDatabaseId = phaseDatabaseId;
    this.description = description;
    this.sortOrder = sortOrder;
    this.craftConstant = craftConstant;
    this.craftUnits = craftUnits;
    this.weldConstant = weldConstant;
    this.weldUnits = weldUnits;
  }
}

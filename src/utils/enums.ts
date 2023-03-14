export enum DrawerVariation {
  Project,
  Wbs,
  Phase,
}
export class WbsEnum {
  static readonly MOBILIZE = new WbsEnum("MOBILIZE", "MOBILIZE", 10000);
  static readonly INSULATION = new WbsEnum("INSULATION", "INSULATION", 100000);
  static readonly PAINTING = new WbsEnum("PAINTING", "PAINTING", 110000);
  static readonly DISMANTLING = new WbsEnum(
    "DISMANTLING",
    "DISMANTLING",
    120000
  );
  static readonly BG_PIPING = new WbsEnum("BG PIPING", "BG PIPING", 130000);
  static readonly REFRATORY = new WbsEnum("REFRACTORY", "REFRACTORY", 140000);
  static readonly BUILDINGS = new WbsEnum("BUILDINGS", "BUILDINGS", 150000);
  static readonly SPECIALTY_SERVICES = new WbsEnum(
    "SPECIALTY SERVICES",
    "SPECIALTY SERVICES",
    180000
  );
  static readonly DEMOBILIZE = new WbsEnum("DEMOBILIZE", "DEMOBILIZE", 190000);
  static readonly SITE_PREPARATION = new WbsEnum(
    "SITE PREPARATION",
    "SITE PREPARATION",
    20000
  );
  static readonly CONCRETE = new WbsEnum("CONCRETE", "CONCRETE", 30000);
  static readonly TOWERS_VESSELS_EQUIPMENT = new WbsEnum(
    "TOWERS/VESSELS/EQUIPMENT",
    "TOWERS/VESSELS/EQUIPMENT",
    40000
  );
  static readonly PUMPS_AND_DRIVERS = new WbsEnum(
    "PUMPS & DRIVERS",
    "PUMPS & DRIVERS",
    50000
  );
  static readonly STRUCTURAL = new WbsEnum("STRUCTURAL", "STRUCTURAL", 60000);
  static readonly AG_PIPING = new WbsEnum("AG PIPING", "AG PIPING", 70000);
  static readonly ELECTRICAL = new WbsEnum("ELECTRICAL", "ELECTRICAL", 80000);
  static readonly INSTRUMENTS = new WbsEnum(
    "INSTRUMENTS",
    "INSTRUMENTS",
    90000
  );
  static readonly SUPPORT = new WbsEnum("SUPPORT", "SUPPORT", 200000);

  private constructor(
    private readonly key: string,
    public readonly name: string,
    public readonly wbsDatabaseId: number
  ) {}

  toString() {
    return this.key;
  }
}

export const WbsArray: WbsEnum[] = [
  WbsEnum.AG_PIPING,
  WbsEnum.BG_PIPING,
  WbsEnum.BUILDINGS,
  WbsEnum.CONCRETE,
  WbsEnum.DEMOBILIZE,
  WbsEnum.DISMANTLING,
  WbsEnum.ELECTRICAL,
  WbsEnum.INSULATION,
  WbsEnum.INSTRUMENTS,
  WbsEnum.MOBILIZE,
  WbsEnum.PAINTING,
  WbsEnum.PUMPS_AND_DRIVERS,
  WbsEnum.REFRATORY,
  WbsEnum.SITE_PREPARATION,
  WbsEnum.SPECIALTY_SERVICES,
  WbsEnum.STRUCTURAL,
  WbsEnum.SUPPORT,
  WbsEnum.TOWERS_VESSELS_EQUIPMENT,
];

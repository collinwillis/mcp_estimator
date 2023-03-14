export class FirestoreProposal {
  proposalNumber: number | null;
  job: string | null;
  coNumber: number | null;
  proposalDescription: string | null;
  proposalOwner: string | null;
  projectCity: string | null;
  projectState: string | null;
  proposalEstimators: string[] | null;
  proposalDateReceived: string | null;
  proposalDateDue: string | null;
  projectStartDate: string | null;
  projectEndDate: string | null;
  bidType: string | null;
  proposalStatus: string | null;
  contactName: string | null;
  contactAddress: string | null;
  contactCity: string | null;
  contactState: string | null;
  contactZip: number | null;
  contactPhone: string | null;
  contactEmail: string | null;
  customQuantity: number | null;
  customUnit: string | null;
  craftBaseRate: number;
  weldBaseRate: number;
  subsistenceRate: number;
  useTaxRate: number;
  salesTaxRate: number;
  overheadRate: number;
  consumablesRate: number;
  burdenRate: number;
  fuelRate: number;
  rigRate: number;
  laborProfitRate: number;
  materialProfitRate: number;
  equipmentProfitRate: number;
  subContractorProfitRate: number;
  rigProfitRate: number;

  constructor({
    proposalNumber,
    job,
    coNumber,
    proposalDescription,
    proposalOwner,
    projectCity,
    projectState,
    proposalEstimators,
    proposalDateReceived,
    proposalDateDue,
    projectStartDate,
    projectEndDate,
    bidType,
    proposalStatus,
    contactName,
    contactAddress,
    contactCity,
    contactState,
    contactZip,
    contactPhone,
    contactEmail,
    customQuantity,
    customUnit,
    craftBaseRate,
    weldBaseRate,
    subsistenceRate,
    useTaxRate,
    salesTaxRate,
    overheadRate,
    consumablesRate,
    burdenRate,
    fuelRate,
    rigRate,
    laborProfitRate,
    materialProfitRate,
    equipmentProfitRate,
    subContractorProfitRate,
    rigProfitRate,
  }: {
    proposalNumber?: number | null;
    job?: string | null;
    coNumber?: number | null;
    proposalDescription?: string | null;
    proposalOwner?: string | null;
    projectCity?: string | null;
    projectState?: string | null;
    proposalEstimators?: string[] | null;
    proposalDateReceived?: string | null;
    proposalDateDue?: string | null;
    projectStartDate?: string | null;
    projectEndDate?: string | null;
    bidType?: string | null;
    proposalStatus?: string | null;
    contactName?: string | null;
    contactAddress?: string | null;
    contactCity?: string | null;
    contactState?: string | null;
    contactZip?: number | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    customQuantity?: number | null;
    customUnit?: string | null;
    craftBaseRate?: number;
    weldBaseRate?: number;
    subsistenceRate?: number;
    useTaxRate?: number;
    salesTaxRate?: number;
    overheadRate?: number;
    consumablesRate?: number;
    burdenRate?: number;
    fuelRate?: number;
    rigRate?: number;
    laborProfitRate?: number;
    materialProfitRate?: number;
    equipmentProfitRate?: number;
    subContractorProfitRate?: number;
    rigProfitRate?: number;
  }) {
    this.proposalNumber = proposalNumber ?? null;
    this.job = job ?? null;
    this.coNumber = coNumber ?? null;
    this.proposalDescription = proposalDescription ?? null;
    this.proposalOwner = proposalOwner ?? null;
    this.projectCity = projectCity ?? null;
    this.projectState = projectState ?? null;
    this.proposalEstimators = proposalEstimators ?? null;
    this.proposalDateReceived = proposalDateReceived ?? null;
    this.proposalDateDue = proposalDateDue ?? null;
    this.projectStartDate = projectStartDate ?? null;
    this.projectEndDate = projectEndDate ?? null;
    this.bidType = bidType ?? null;
    this.proposalStatus = proposalStatus ?? null;
    this.contactName = contactName ?? null;
    this.contactAddress = contactAddress ?? null;
    this.contactCity = contactCity ?? null;
    this.contactState = contactState ?? null;
    this.contactZip = contactZip ?? null;
    this.contactPhone = contactPhone ?? null;
    this.contactEmail = contactEmail ?? null;
    this.customQuantity = customQuantity ?? null;
    this.customUnit = customUnit ?? null;
    this.craftBaseRate = craftBaseRate ?? 0;
    this.weldBaseRate = weldBaseRate ?? 0;
    this.subsistenceRate = subsistenceRate ?? 0;
    this.useTaxRate = useTaxRate ?? 0;
    this.salesTaxRate = salesTaxRate ?? 0;
    this.overheadRate = overheadRate ?? 0;
    this.consumablesRate = consumablesRate ?? 0;
    this.burdenRate = burdenRate ?? 0;
    this.fuelRate = fuelRate ?? 0;
    this.rigRate = rigRate ?? 0;
    this.laborProfitRate = laborProfitRate ?? 0;
    this.materialProfitRate = materialProfitRate ?? 0;
    this.equipmentProfitRate = equipmentProfitRate ?? 0;
    this.subContractorProfitRate = subContractorProfitRate ?? 0;
    this.rigProfitRate = rigProfitRate ?? 0;
  }
}

import { DocumentReference } from "firebase/firestore";

export class FirestorePhase {
  proposalId: string | null;
  wbsId: string | null;
  phaseDatabaseId: number | null;
  phaseNumber: number | null;
  description: string | null;
  phaseDatabaseName: string | null;
  size: string | null;
  flc: string | null;
  system: string | null;
  spec: string | null;
  insulation: string | null;
  insulationSize: string | null;
  sheet: string | null;
  area: string | null;
  status: string | null;
  customQuantity: number | null;
  quantity: number | null;
  customUnit: string | null;
  unit: string | null;

  constructor({
    proposalId,
    wbsId,
    phaseDatabaseId,
    phaseNumber,
    description,
      phaseDatabaseName,
    size,
    flc,
    system,
    spec,
    insulation,
    insulationSize,
    sheet,
    area,
    status,
    customQuantity,
    quantity,
    customUnit,
    unit,
  }: {
    proposalId?: string | null;
    wbsId?: string | null;
    phaseDatabaseId?: number | null;
    phaseNumber?: number | null;
    description?: string | null;
    phaseDatabaseName?: string | null;
    size?: string | null;
    flc?: string | null;
    system?: string | null;
    spec?: string | null;
    insulation?: string | null;
    insulationSize?: string | null;
    sheet?: string | null;
    area?: string | null;
    status?: string | null;
    customQuantity?: number | null;
    quantity?: number | null;
    customUnit?: string | null;
    unit?: string | null;
  }) {
    this.proposalId = proposalId ?? null;
    this.wbsId = wbsId ?? null;
    this.phaseDatabaseId = phaseDatabaseId ?? null;
    this.phaseNumber = phaseNumber ?? null;
    this.description = description ?? null;
    this.phaseDatabaseName = phaseDatabaseName ?? null;
    this.size = size ?? null;
    this.flc = flc ?? null;
    this.system = system ?? null;
    this.spec = spec ?? null;
    this.insulation = insulation ?? null;
    this.insulationSize = insulationSize ?? null;
    this.sheet = sheet ?? null;
    this.area = area ?? null;
    this.status = status ?? null;
    this.customQuantity = customQuantity ?? null;
    this.quantity = quantity ?? null;
    this.customUnit = customUnit ?? null;
    this.unit = unit ?? null;
  }
}

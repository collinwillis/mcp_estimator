import { DocumentReference } from "firebase/firestore";

export class FirestoreWbs {
  proposalId: string | null;
  wbsDatabaseId: number | null;
  name: string | null;
  customQuantity: number | null;
  customUnit: string | null;

  constructor({
    proposalId,
    wbsDatabaseId,
    name,
    customQuantity,
    customUnit,
  }: {
    proposalId?: string | null;
    wbsDatabaseId?: number | null;
    name?: string | null;
    customQuantity?: number | null;
    customUnit?: string | null;
  }) {
    this.proposalId = proposalId ?? null;
    this.wbsDatabaseId = wbsDatabaseId ?? null;
    this.name = name ?? null;
    this.customQuantity = customQuantity ?? null;
    this.customUnit = customUnit ?? null;
  }
}

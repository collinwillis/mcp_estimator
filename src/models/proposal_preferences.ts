import { FirestoreProposalPreferences } from "./firestore models/proposal_preferences_firestore";

export class ProposalPreferences {
  id?: string | null;
  wbsToDisplay?: string[] | null;

  constructor(data: Partial<ProposalPreferences>) {
    Object.assign(this, data);
  }
}

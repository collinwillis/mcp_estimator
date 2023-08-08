import { DocumentReference } from "firebase/firestore";

export class FirestoreProposalPreferences {
  wbsToDisplay: string[] | null;

  constructor({ wbsToDisplay }: { wbsToDisplay?: string[] | null }) {
    this.wbsToDisplay = wbsToDisplay ?? null;
  }
}

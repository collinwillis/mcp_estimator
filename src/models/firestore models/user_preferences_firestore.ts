import { DocumentReference } from "firebase/firestore";

export class FirestoreUserPreferences {
  wbsToDisplay: string[] | null;

  constructor({ wbsToDisplay }: { wbsToDisplay?: string[] | null }) {
    this.wbsToDisplay = wbsToDisplay ?? null;
  }
}

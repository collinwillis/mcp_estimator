import { FirestoreUserPreferences } from "./firestore models/user_preferences_firestore";

export class UserPreferences {
  id?: string | null;
  wbsToDisplay?: string[] | null;

  constructor(data: Partial<UserPreferences>) {
    Object.assign(this, data);
  }
}

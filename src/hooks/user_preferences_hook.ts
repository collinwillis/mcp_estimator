import { ref as databaseRef, off, onValue } from "firebase/database";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { insertUserPreferences } from "../api/user_preferences";

import { FirestoreUserPreferences } from "../models/firestore models/user_preferences_firestore";
import { Proposal } from "../models/proposal";
import { UserPreferences } from "../models/user_preferences";
import { auth, firestore } from "../setup/config/firebase";

export const useUserPreferences = (userId: string) => {
  const [data, setData] = useState<UserPreferences>();
  useEffect(() => {
    const userPrefRef = doc(firestore, "user-preferences", userId);

    const unsubscribe = onSnapshot(userPrefRef, (doc) => {
      //if the document exists, set the data & if the document doesn't exist, create it
      if (doc.exists()) {
        const userPreferences = doc.data() as UserPreferences;
        userPreferences.id = doc.id;
        setData(userPreferences);
      }
      //if the document doesn't exist, create it
      else {
        insertUserPreferences(userId);
      }
    });

    return unsubscribe;
  }, []);
  return data;
};

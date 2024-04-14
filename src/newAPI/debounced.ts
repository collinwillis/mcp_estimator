import {updateProposalPreferencesInFirestore} from "./api";
import {debounce} from "@mui/material";

export const debouncedUpdateProposalPreferencesInFirestore = debounce(updateProposalPreferencesInFirestore, 300);

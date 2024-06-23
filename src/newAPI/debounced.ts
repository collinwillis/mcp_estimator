import { debounce } from '@mui/material';
import { updateProposalPreferencesInFirestore } from './api';

export const debouncedUpdateProposalPreferencesInFirestore = debounce(
  updateProposalPreferencesInFirestore,
  300
);

import type { Proposal } from '../models/proposal';

import {
  DatasetVersions,
  DEFAULT_DATA_VERSION,
  isDataVersion,
} from './dataset_types';
import { resolveDatasetVersion } from './datasets';

export const getProposalDatasetVersions = (
  proposal?: Proposal,
): DatasetVersions => {
  const stored: Partial<DatasetVersions> = proposal?.datasetVersions ?? {};

  const laborPreferred = isDataVersion(stored.labor)
    ? stored.labor
    : DEFAULT_DATA_VERSION;
  const phasesPreferred = isDataVersion(stored.phases)
    ? stored.phases
    : DEFAULT_DATA_VERSION;
  const wbsPreferred = isDataVersion(stored.wbs)
    ? stored.wbs
    : DEFAULT_DATA_VERSION;
  const equipmentPreferred = isDataVersion(stored.equipment)
    ? stored.equipment
    : DEFAULT_DATA_VERSION;

  return {
    labor: resolveDatasetVersion('labor', laborPreferred),
    phases: resolveDatasetVersion('phases', phasesPreferred),
    wbs: resolveDatasetVersion('wbs', wbsPreferred),
    equipment: resolveDatasetVersion('equipment', equipmentPreferred),
  };
};

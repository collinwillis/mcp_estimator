import equipmentV1 from './v1/equipment_v1.json';
import laborV1 from './v1/labor_v1.json';
import phasesV1 from './v1/phases_v1.json';
import wbsV1 from './v1/wbs_v1.json';
import equipmentV2 from './v2/equipment_v2.json';

import {
  DataType,
  DataVersion,
  DatasetVersions,
  DATA_VERSION_ORDER,
  DEFAULT_DATA_VERSION,
} from './dataset_types';

const DATASETS: Record<DataType, Partial<Record<DataVersion, unknown>>> = {
  labor: { v1: laborV1 },
  phases: { v1: phasesV1 },
  wbs: { v1: wbsV1 },
  equipment: { v1: equipmentV1, v2: equipmentV2 },
};

export const resolveDatasetVersion = (
  type: DataType,
  preferred: DataVersion,
): DataVersion => {
  const startIndex = DATA_VERSION_ORDER.indexOf(preferred);
  for (let i = startIndex; i >= 0; i -= 1) {
    const version = DATA_VERSION_ORDER[i];
    if (DATASETS[type][version]) {
      return version;
    }
  }
  return DEFAULT_DATA_VERSION;
};

export const buildDatasetVersions = (
  preferred: DataVersion,
): DatasetVersions => ({
  labor: resolveDatasetVersion('labor', preferred),
  phases: resolveDatasetVersion('phases', preferred),
  wbs: resolveDatasetVersion('wbs', preferred),
  equipment: resolveDatasetVersion('equipment', preferred),
});

export const resolveDataset = <T,>(
  type: DataType,
  preferred: DataVersion,
): T => {
  const resolvedVersion = resolveDatasetVersion(type, preferred);
  const dataset = DATASETS[type][resolvedVersion];
  if (!dataset) {
    throw new Error(`No dataset available for ${type}`);
  }
  return dataset as T;
};

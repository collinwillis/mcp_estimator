export type DataVersion = 'v1' | 'v2';
export type DataType = 'labor' | 'phases' | 'wbs' | 'equipment';

export type DatasetVersions = Record<DataType, DataVersion>;

export const DATA_VERSION_ORDER: DataVersion[] = ['v1', 'v2'];
export const DEFAULT_DATA_VERSION: DataVersion = 'v1';
export const CURRENT_DATA_VERSION: DataVersion = 'v2';

export const isDataVersion = (value: unknown): value is DataVersion =>
  value === 'v1' || value === 'v2';

import { DataDumpActivity } from './data_dump_activity';
import { DataDumpItem } from './data_dump_item';

export interface DataDumpPhase extends DataDumpItem {
  activities?: DataDumpActivity[] | null;
}

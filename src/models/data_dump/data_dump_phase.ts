import {DataDumpItem} from "./data_dump_item";
import {DataDumpActivity} from "./data_dump_activity";

export interface DataDumpPhase extends DataDumpItem{
    activities?: DataDumpActivity[] | null;
}

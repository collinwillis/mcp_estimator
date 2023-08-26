import {DataDumpItem} from "./data_dump_item";
import {DataDumpPhase} from "./data_dump_phase";


export interface DataDumpWbs extends DataDumpItem{
    phases?: DataDumpPhase[] | null;
}

import {DataDumpItem} from "./data_dump_item";

export interface DataDumpActivity extends DataDumpItem {
    sortOrder?: number | null;
}

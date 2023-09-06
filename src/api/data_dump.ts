import {collection, getDocs, query, where,} from "firebase/firestore";
import {calculateActivityData} from "../api/activity";
import {Activity, ActivityType} from "../models/activity";
import {FirestoreActivity} from "../models/firestore models/activity_firestore";
import {firestore} from "../setup/config/firebase";
import {getSingleProposal} from "./proposal";
import {Phase} from "../models/phase";
import {ProposalPreferences} from "../models/proposal_preferences";
import {Wbs} from "../models/wbs";
import {DataDumpActivity} from "../models/data_dump/data_dump_activity";
import {currencyRound} from "./helpers";
import {EquipmentOwnership} from "../models/equipment";
import {Proposal} from "../models/proposal";
import {DataDumpPhase} from "../models/data_dump/data_dump_phase";
import {DataDumpWbs} from "../models/data_dump/data_dump_wbs";
import {BookType, utils, WorkBook} from 'xlsx-js-style';
import { write } from 'xlsx-js-style';
import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile, writeFile } from '@tauri-apps/api/fs';
import {DataDumpItem} from "../models/data_dump/data_dump_item";


interface UseActivitiesOptions {
    proposalId: string;
    phaseId?: string;
    wbsId?: string;
}
interface Cell{
    v?: any;
    s?: any;
    t?: any;
    z?: any;

}

export const fetchDD = async (
    proposalId: string,
    preferences: ProposalPreferences,
) => {
    const proposal = await getSingleProposal({proposalId: proposalId});
    const activities = await fetchDDActivities(proposalId);
    const phases = await fetchDDPhases(proposalId, activities);
    const wbs = await fetchDDWbs(proposalId, phases, preferences);
    wbs.sort((a, b) => a.wbs! - b.wbs!);
    const wb = utils.book_new();

    let style = {
        font: { name: "Calibri (Body)", sz: 10 },
        alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        border: {
            top: { style: 'thin', color: '#000000' },
            bottom: { style: 'thin', color: '#000000' },
            right: { style: 'thin', color: '#000000' }
        }
    };
    let top = topMarkups;
    top[17].v = '$' + proposal!.rigRate?.toFixed(2);
    top[34].v = proposal!.useTaxRate?.toFixed(2) + "%";

    let bm = bottomMarkups;
    bm[17].v = '$' + proposal!.weldBaseRate?.toFixed(2);
    bm[20].v = '$' + proposal!.craftBaseRate?.toFixed(2);
    bm[21].v = proposal!.burdenRate?.toFixed(2) + "%";
    bm[22].v = proposal!.overheadRate?.toFixed(2) + "%";
    bm[23].v = proposal!.laborProfitRate?.toFixed(2) + "%";
    bm[24].v = proposal!.fuelRate?.toFixed(2) + "%";
    bm[25].v = proposal!.consumablesRate?.toFixed(2) + "%";
    bm[26].v = '$' + proposal!.subsistenceRate?.toFixed(2);
    bm[28].v = proposal!.rigProfitRate?.toFixed(2) + "%";
    bm[29].v = proposal!.materialProfitRate?.toFixed(2) + "%";
    bm[30].v = proposal!.equipmentProfitRate?.toFixed(2) + "%";
    bm[31].v = proposal!.subContractorProfitRate?.toFixed(2) + "%";
    bm[34].v = proposal!.salesTaxRate?.toFixed(2) + "%";

    let p1 = proposalInfo1;
    let p2 = proposalInfo2;
    let p3 = proposalInfo3;
    let p4 = proposalInfo4;
    let p5 = proposalInfo5;
    let p6 = proposalInfo6;
    let p7 = proposalInfo7;

    var today = new Date();

// Define an array of month names
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];

// Get the month, day, and year from the date object
    var month = monthNames[today.getMonth()];
    var day = today.getDate();
    var year = today.getFullYear();

// Format the date as "Month Day, Year"
    var formattedDate = month + " " + day + ", " + year;

    p1[31].v = proposal!.proposalNumber ?? "";
    p2[31].v = proposal!.job ?? "";
   // p3[31].v = proposal
    p4[31].v = proposal!.proposalDescription ?? "";
    p5[31].v = proposal!.proposalOwner ?? "";
    p6[31].v = (proposal!.projectCity ?? "") + ", " + (proposal!.projectState ?? "");
    p7[31].v = formattedDate;


    let data = await mapModelsToRows(wbs);
    let rows = [
        proposalInfo1,
        proposalInfo2,
        proposalInfo3,
        proposalInfo4,
        proposalInfo5,
        proposalInfo6,
        proposalInfo7,
        topMarkupLabels,
            top,
        [
            { v: "WBS", t: "s", s: style },
            { v: "PHASE", t: "s", s: style },
            { v: "SIZE", t: "s", s: style },
            { v: "FLC", t: "s", s: style },
            { v: "LINE / DESCRIP", t: "s", s: style },
            { v: "SPEC", t: "s", s: style },
            { v: "INSUL", t: "s", s: style },
            { v: "INSL. SIZE", t: "s", s: style },
            { v: "SHT", t: "s", s: style },
            { v: "AREA", t: "s", s: style },
            { v: "STATUS", t: "s", s: style },
            { v: "SPCL RATE", t: "s", s: style },
            { v: "SPCL SUB", t: "s", s: style },
            { v: "OWNERSHIP", t: "s", s: style },
            { v: "QTY", t: "s", s: style },
            { v: "UNIT", t: "s", s: style },
            { v: "CRAFT", t: "s", s: style },
            { v: "WELD", t: "s", s: style },
            { v: "SUB", t: "s", s: style },
            { v: "TOTAL", t: "s", s: style },
            { v: "BASE", t: "s", s: style },
            { v: "BURDEN", t: "s", s: style },
            { v: "OVERHEAD", t: "s", s: style },
            { v: "LABOR PROFIT", t: "s", s: style },
            { v: "FUEL", t: "s", s: style },
            { v: "CNSMBLE", t: "s", s: style },
            { v: "SUBSIST", t: "s", s: style },
            { v: "LABOR", t: "s", s: style },
            { v: "RIGS", t: "s", s: style },
            { v: "MATERIAL", t: "s", s: style },
            { v: "EQUIP", t: "s", s: style },
            { v: "SUBS", t: "s", s: style },
            { v: "COST ONLY", t: "s", s: style },
            { v: "PROFIT TOTAL (R/M/E/S)", t: "s", s: style },
            { v: "SALES TAX", t: "s", s: style },
            { v: "TOTAL", t: "s", s: style }
        ],
        bm,
        ...data
    ];
    const ws = utils.aoa_to_sheet(rows);

    ws['!cols'] = [
        {'width' : 10},
        {'width' : 10},
        {'width' : 8.5},
        {'width' : 7},
        {'width' : 55},
        {'width' : 11},
        {'width' : 8},
        {'width' : 8},
        {'width' : 7},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 15},
        {'width' : 18},

    ];
    ws['!rows'] = [
        {'hpx' : 15},
        {'hpx' : 15},
        {'hpx' : 15},
        {'hpx' : 15},
        {'hpx' : 15},
        {'hpx' : 15},
        {'hpx' : 15},
        {'hpx' : 23},// height for row 1
        {'hpx' : 16},
        {'hpx' : 31},
        {'hpx' : 16},
    ];
    /* merge cells A1:B1 */
    var merge = [
        { s: {r:10, c:32}, e: {r:10, c:33} },
        { s: {r:0, c:31}, e: {r:0, c:35} },
        { s: {r:1, c:31}, e: {r:1, c:35} },
        { s: {r:2, c:31}, e: {r:2, c:35} },
        { s: {r:3, c:31}, e: {r:3, c:35} },
        { s: {r:4, c:31}, e: {r:4, c:35} },
        { s: {r:5, c:31}, e: {r:5, c:35} },
        { s: {r:6, c:31}, e: {r:6, c:35} },
    ];
//var merge = XLSX.utils.decode_range("A1:B1"); // this is equivalent

    /* add merges */
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'] = merge;

    utils.book_append_sheet(wb, ws, "readme demo");
   await saveFile(wb, proposal!.proposalNumber!);
};


export const fetchDDActivities = async (
    proposalId: string,
): Promise<DataDumpActivity[]> => {
    const activitiesRef = collection(firestore, "activities");
    let activityQuery = query(
        activitiesRef,
        where("proposalId", "==", proposalId)
    );

    const querySnapshot = await getDocs(activityQuery);
    const proposal = await getSingleProposal({ proposalId });


    const activityPromises = querySnapshot.docs.map(async (doc) => {
        const rawActivity = doc.data() as FirestoreActivity;
        if (proposal) {
            let baseActivity = await calculateActivityData(doc.id, rawActivity, proposal);
            return activityToDataDumpItem(baseActivity, proposal);

        }
        return null;
    });

    const activities: (DataDumpActivity | null)[] = await Promise.all(activityPromises);

    // Filter out null values and ensure a valid Activity array
    const validActivities = activities.filter((activity): activity is DataDumpActivity => activity !== null);

    return validActivities;
};


const fetchDDPhases = async (
    proposalId: string,
    allActivities: DataDumpActivity[]
): Promise<DataDumpPhase[]> => {
    const phaseRef = collection(firestore, "phase");
    const phaseQuery = query(phaseRef, where("proposalId", "==", proposalId));
    const querySnapshot = await getDocs(phaseQuery);

    const phases: DataDumpPhase[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
            const phase = doc.data() as Phase;
            phase.id = doc.id;

            let craftMH = 0;
            let weldMH = 0;
            //let subMH = 0;
            let baseCost = 0;
            let burden = 0;
            let overhead = 0;
            let laborProfit = 0;
            let fuel = 0;
            let consumables = 0;
            let subsistence = 0;
            let laborCost = 0;
            let rigCost = 0;
            let materialCost = 0;
            let equipmentCost = 0;
            let subcontractorCost = 0;
            let costOnlyCost = 0;
            let profitTotal = 0;
            let salesTax = 0;
            let total = 0;

            const activities = allActivities.filter(
                (activity) => activity.phaseId === phase.id
            );

            activities.forEach((activity) => {
                craftMH += activity.craftMH ?? 0;
                weldMH += activity.weldMH ?? 0;
                baseCost += activity.baseCost ?? 0;
                burden += activity.burden ?? 0;
                overhead += activity.overhead ?? 0;
                laborProfit += activity.laborProfit ?? 0;
                fuel += activity.fuel ?? 0;
                consumables += activity.consumables ?? 0;
                subsistence += activity.subsistence ?? 0;
                laborCost += activity.laborCost ?? 0;
                rigCost += activity.rigCost ?? 0;
                materialCost += activity.materialCost ?? 0;
                equipmentCost += activity.equipmentCost ?? 0;
                subcontractorCost += activity.subcontractorCost ?? 0;
                costOnlyCost += activity.costOnlyCost ?? 0;
                profitTotal += activity.profitTotal ?? 0;
                salesTax += activity.salesTax ?? 0;
                total += activity.total ?? 0;
                activity.phase = phase.phaseNumber;
                activity.size = phase.size;
                activity.flc = phase.flc;
                activity.lineDescription = phase.description;
                activity.specification = phase.spec;
                activity.insulation = phase.insulation;
                activity.insulationSize = phase.insulationSize;
                activity.sheet = phase.sheet;
                activity.area = phase.area;
                activity.status = phase.status;
            });
            let newPhase: DataDumpPhase = {
                phaseId: phase.id,
                wbsId: phase.wbsId,
                wbs: null,
                proposalId: phase.proposalId,
                phase: phase.phaseNumber,
                size: phase.size,
                flc: phase.flc,
                lineDescription: phase.description,
                specification: phase.spec,
                insulation: phase.insulation,
                insulationSize: phase.insulationSize,
                sheet: phase.sheet,
                area: phase.area,
                status: phase.status,
                specialCraftRate: null,
                specialSubRate: null,
                ownership: null,
                quantity: phase.quantity,
                unit: phase.unit,
                craftMH: currencyRound(craftMH),
                weldMH: currencyRound(weldMH),
                subMH: null,
                totalMH: currencyRound((craftMH + weldMH)),
                baseCost:  baseCost,
                burden:  burden,
                overhead:  overhead,
                laborProfit:  laborProfit,
                fuel:  fuel,
                consumables:  consumables,
                subsistence:  subsistence,
                laborCost:  laborCost,
                rigCost:  rigCost,
                materialCost:  materialCost,
                equipmentCost:  equipmentCost,
                subcontractorCost: subcontractorCost,
                costOnlyCost: costOnlyCost,
                profitTotal:  profitTotal,
                salesTax:  salesTax,
                total: total,
                activities: activities,
            }
            return newPhase;
        })
    );
    return phases.sort((a, b) => a.phase! - b.phase!);
};

const fetchDDWbs = async (
    proposalId: string,
    allPhases: DataDumpPhase[],
    preferences: ProposalPreferences,
): Promise<DataDumpWbs[]> => {
    const wbsRef = collection(firestore, "wbs");
    const q = query(wbsRef, where("proposalId", "==", proposalId));
    const querySnapshot = await getDocs(q);
    let returnMe: DataDumpWbs[] = [];
    const wbs: Wbs[] = await Promise.all(
        querySnapshot.docs.sort((a, b) => {
            let first = a.data() as Wbs;
            let second = a.data() as Wbs;
            return first.wbsDatabaseId! - second.wbsDatabaseId!;
        }).map(async (doc) => {
            const curr = doc.data() as Wbs;
            curr.id = doc.id;

            let craftMH = 0;
            let weldMH = 0;
            //let subMH = 0;
            let baseCost = 0;
            let burden = 0;
            let overhead = 0;
            let laborProfit = 0;
            let fuel = 0;
            let consumables = 0;
            let subsistence = 0;
            let laborCost = 0;
            let rigCost = 0;
            let materialCost = 0;
            let equipmentCost = 0;
            let subcontractorCost = 0;
            let costOnlyCost = 0;
            let profitTotal = 0;
            let salesTax = 0;
            let total = 0;

            if(preferences.wbsToDisplay?.includes(curr.name!))
            {
                const phases = allPhases.filter(
                    (phase) => phase.wbsId === doc.id
                );

                phases.forEach((phase) => {
                    craftMH += phase.craftMH ?? 0;
                    weldMH += phase.weldMH ?? 0;
                    baseCost += phase.baseCost ?? 0;
                    burden += phase.burden ?? 0;
                    overhead += phase.overhead ?? 0;
                    laborProfit += phase.laborProfit ?? 0;
                    fuel += phase.fuel ?? 0;
                    consumables += phase.consumables ?? 0;
                    subsistence += phase.subsistence ?? 0;
                    laborCost += phase.laborCost ?? 0;
                    rigCost += phase.rigCost ?? 0;
                    materialCost += phase.materialCost ?? 0;
                    equipmentCost += phase.equipmentCost ?? 0;
                    subcontractorCost += phase.subcontractorCost ?? 0;
                    costOnlyCost += phase.costOnlyCost ?? 0;
                    profitTotal += phase.profitTotal ?? 0;
                    salesTax += phase.salesTax ?? 0;
                    total += phase.total ?? 0;
                });

                let newWbs: DataDumpWbs = {
                    wbsId: curr.id,
                    wbs: curr.wbsDatabaseId,
                    proposalId: curr.proposalId,
                    phase: null,
                    phaseId: null,
                    size: null,
                    flc: null,
                    lineDescription: curr.name,
                    specification: null,
                    insulation: null,
                    insulationSize: null,
                    sheet: null,
                    area: null,
                    status: null,
                    specialCraftRate: null,
                    specialSubRate: null,
                    ownership: null,
                    quantity: curr.quantity,
                    unit: curr.unit,
                    craftMH: currencyRound(craftMH),
                    weldMH: currencyRound(weldMH),
                    subMH: null,
                    totalMH: currencyRound((craftMH + weldMH)),
                    baseCost:  baseCost,
                    burden:  burden,
                    overhead:  overhead,
                    laborProfit:  laborProfit,
                    fuel:  fuel,
                    consumables:  consumables,
                    subsistence:  subsistence,
                    laborCost:  laborCost,
                    rigCost:  rigCost,
                    materialCost:  materialCost,
                    equipmentCost:  equipmentCost,
                    subcontractorCost: subcontractorCost,
                    costOnlyCost: costOnlyCost,
                    profitTotal:  profitTotal,
                    salesTax:  salesTax,
                    total: total,
                    phases: phases,
                }


                returnMe.push(newWbs);
            }
            return curr;
        })
    );
    return returnMe;
};

const activityToDataDumpItem = (baseActivity: Activity, proposal: Proposal) => {
    const getSubProfit = () => {
        let subProfit = proposal.subContractorProfitRate! / 100;
        let salesTax = proposal.salesTaxRate! / 100;
        let useTax = proposal.useTaxRate! / 100;
        let craftProfit = baseActivity.craftCost * subProfit;
        let materialProfit = baseActivity.craftCost * (subProfit + salesTax);
        let equipmentProfit = baseActivity.equipmentCost * subProfit;
        return (craftProfit + materialProfit + equipmentProfit);
    };
    let isEquip = baseActivity.activityType == ActivityType.equipmentItem;
    let isMat = baseActivity.activityType == ActivityType.materialItem;
    let isCostOnly = baseActivity.activityType == ActivityType.costOnlyItem;
    let isSub = baseActivity.activityType == ActivityType.subContractorItem;
    let isOwnedEquip = isEquip && baseActivity.equipmentOwnership == EquipmentOwnership.owned;
    let materialCost = baseActivity.activityType == ActivityType.materialItem ? baseActivity.quantity * baseActivity.price : 0;
    let equipmentCost = baseActivity.activityType == ActivityType.equipmentItem ? (baseActivity.quantity * (baseActivity.time * baseActivity.price)) : 0;
    let craftBase = ((baseActivity.customCraftRate ?? baseActivity.craftBaseRate) * baseActivity.craftManHours) + (baseActivity.weldBaseRate * baseActivity.welderManHours);
    let burden = ((proposal.burdenRate ?? 0) / 100) * craftBase;
    let overhead = ((proposal.overheadRate ?? 0) / 100) * craftBase;
    let laborProfit = ((proposal.laborProfitRate ?? 0) / 100) * craftBase;
    let fuel = ((proposal.fuelRate ?? 0) / 100) * craftBase;
    let consumables = ((proposal.consumablesRate ?? 0) / 100) * craftBase;
    let subsistence = (baseActivity.craftManHours + baseActivity.welderManHours) * ((baseActivity.customSubsistenceRate ?? proposal.subsistenceRate) ?? 0);
    let rig = (proposal.rigRate ?? 0) * baseActivity.welderManHours;
    let subCost = baseActivity.activityType == ActivityType.subContractorItem ?  currencyRound(baseActivity.quantity * (baseActivity.craftCost + (baseActivity.equipmentCost + baseActivity.materialCost))) : 0;
    let profitTotal = ((((proposal.materialProfitRate ?? 0) / 100) * materialCost) + (((proposal.rigProfitRate ?? 0) / 100) * rig) + (((proposal.equipmentProfitRate ?? 0) / 100) * equipmentCost) + (((proposal.subContractorProfitRate ?? 0) / 100) * (subCost)));
    let salesTax = (materialCost * ((proposal.salesTaxRate ?? 0) / 100)) + (equipmentCost * ((proposal.useTaxRate ?? 0) / 100));
    let laborCost = craftBase + burden + overhead + laborProfit + fuel + consumables + subsistence;


    let newActivity: DataDumpActivity = {
        phaseId: baseActivity.phaseId,
        wbsId: baseActivity.wbsId,
        proposalId: baseActivity.proposalId,
        wbs: null,
        phase: null,
        size: null,
        flc: null,
        lineDescription: baseActivity.description,
        specification: null,
        insulation: null,
        insulationSize: null,
        sheet: null,
        area: null,
        status: null,
        specialCraftRate: baseActivity.customCraftRate,
        specialSubRate: baseActivity.customSubsistenceRate,
        ownership: baseActivity.equipmentOwnership,
        quantity: baseActivity.quantity,
        unit: baseActivity.unit,
        craftMH: currencyRound(baseActivity.craftManHours),
        weldMH: currencyRound(baseActivity.welderManHours),
        subMH: null,
        totalMH: currencyRound((baseActivity.craftManHours + baseActivity.welderManHours)),
        baseCost:  currencyRound(craftBase),
        burden:  currencyRound(burden),
        overhead:  currencyRound(overhead),
        laborProfit:  currencyRound(laborProfit),
        fuel:  currencyRound(fuel),
        consumables:  currencyRound(consumables),
        subsistence:  currencyRound(subsistence),
        laborCost:  currencyRound(craftBase + burden + overhead + laborProfit + fuel + consumables + subsistence),
        rigCost:  currencyRound(rig),
        materialCost:  isMat ? currencyRound(materialCost) : null,
        equipmentCost:  isEquip ? isOwnedEquip ? null : currencyRound(equipmentCost) : null,
        subcontractorCost: isSub ? currencyRound(baseActivity.quantity * (baseActivity.craftCost + (baseActivity.equipmentCost + baseActivity.materialCost))) : null,
        costOnlyCost: isOwnedEquip ? equipmentCost : isCostOnly ? currencyRound(baseActivity.costOnlyCost) : null,
        profitTotal:  isOwnedEquip ? null : currencyRound(profitTotal),
        salesTax:  currencyRound(salesTax),
        total: isOwnedEquip ? equipmentCost : currencyRound(laborCost + rig + materialCost + equipmentCost + subCost + baseActivity.costOnlyCost + profitTotal + salesTax),
    }
    return newActivity;
}



const filters = [
    {name: "Excel Workbook", extensions: ["xlsx"]},
    // ... other desired formats ...
];
async function saveFile(wb: WorkBook, proposalNumber: number) {
    /* show save file dialog */
    const selected = await save({
        defaultPath: `./${proposalNumber}-WBS-Cost-Report`,
        title: "Save to Spreadsheet",
        filters
    });
    if(!selected) return;
    /* Generate workbook */
    const extension = selected.slice(selected.lastIndexOf(".") + 1);
    const bookType: BookType = 'xlsx' as BookType;
    const d = write(wb, {type: "buffer", bookType});

    /* save data to file */
    await writeBinaryFile(selected, d);
}

interface StyleDefinition {
    font?: any;
    border?: any;
    fill?: any;
    alignment?: any;
}

const styles: Record<string, StyleDefinition> = {
    wbs: {
        font: { name: "Calibri", sz: 14, bold: true },
        fill: { fgColor: { rgb: "ddebf7" } },
        alignment: {horizontal: 'right'}
    },
    wbsCenter: {
        font: { name: "Calibri", sz: 14, bold: true },
        fill: { fgColor: { rgb: "ddebf7" } },
        alignment: {horizontal: 'center'}
    },
    wbsLeft: {
        font: { name: "Calibri", sz: 14, bold: true },
        fill: { fgColor: { rgb: "ddebf7" } },
        alignment: {horizontal: 'left'}
    },
    phaseLeft: {
        font: { name: "Calibri", sz: 12, bold: true },
        fill: { fgColor: { rgb: "fff2cc" } },
        alignment: {horizontal: 'left'}
    },
    activityLeft: {
        font: { name: "Calibri", sz: 10 },
        alignment: {horizontal: 'left'}
    },
    wbsBorder: {
        border: { right: { style: "medium", color: "#000000" } },
        font: { name: "Calibri", sz: 14, bold: true },
        fill: { fgColor: { rgb: "ddebf7" } },
        alignment: {horizontal: 'right'}
    },
    phase: {
        font: { name: "Calibri", sz: 12, bold: true },
        fill: { fgColor: { rgb: "fff2cc" } },
        alignment: {horizontal: 'right'}
    },
    phaseBorder: {
        border: { right: { style: "medium", color: "#000000" } },
        font: { name: "Calibri", sz: 12, bold: true },
        fill: { fgColor: { rgb: "fff2cc" } },
        alignment: {horizontal: 'right'}
    },
    activity: {
        font: { name: "Calibri", sz: 10 },
        alignment: {horizontal: 'right'}
    },
    activityBorder: {
        border: { right: { style: "medium", color: "#000000" } },
        font: { name: "Calibri", sz: 10 },
        alignment: {horizontal: 'right'}
    },
    activityBorderAll: {
        border: {
            right: { style: "medium", color: "#000000" },
            left: { style: "medium", color: "#000000" },
            top: { style: "medium", color: "#000000" },
            bottom: { style: "medium", color: "#000000" }
        },
        font: { name: "Calibri", sz: 10 },
        alignment: {horizontal: 'right'}
    },
    summary: {
        border: {
            bottom: { style: "medium", color: "#000000" },
            top: { style: "medium", color: "#000000" },
        },
        font: { name: "Calibri", sz: 14, bold: true },
        alignment: {horizontal: 'right'},
        fill: { fgColor: { rgb: "e2eeda" } },
    },
    summaryBorder: {
        border: {
            right: { style: "medium", color: "#000000" },
            bottom: { style: "medium", color: "#000000" },
            top: { style: "medium", color: "#000000" },
        },
        font: { name: "Calibri", sz: 14, bold: true },
        alignment: {horizontal: 'right'},
        fill: { fgColor: { rgb: "e2eeda" } },
    },
};

let currencyItems = [
    "baseCost",
    "burden",
    "overhead",
    "laborProfit",
    "fuel",
    "consumables",
    "subsistence",
    "laborCost",
    "rigCost",
    "materialCost",
    "equipmentCost",
    "subcontractorCost",
    "costOnlyCost",
    "profitTotal",
    "salesTax",
    "total",
    "specialSubRate",
    "specialCraftRate",
];

let regNumItems = [
    'quantity',
    'craftMH',
    'weldMH',
    'subMH',
    'totalMH'
];

async function mapModelsToRows(wbs: DataDumpWbs[]): Promise<Cell[][]> {
    const rows: Cell[][] = [];
    function applyStyle(styleKey: string, cellValue: any, key: any): Cell {
        let style = styles[styleKey];
        let isCurrency = currencyItems.includes(key) &&  !isNaN(Number(cellValue)) && cellValue != 0 && cellValue != null;
        let isRegNum = regNumItems.includes(key) &&  !isNaN(Number(cellValue)) && cellValue != 0 && cellValue != null;
        let val = cellValue == 0 || cellValue == null ? currencyItems.includes(key) ? '-' : '' : cellValue;
        if(key === 'wbs' && styleKey == 'wbs')
        {
            style = styles['wbsCenter'];
        }
        else if(((key === 'lineDescription' || key === 'unit') && styleKey != 'summary'))
        {
            style = styles[`${styleKey}Left`];
        }
        else if((key === 'specialCraftRate' || key === 'specialSubRate') && styleKey == 'activity' && (cellValue != null && cellValue !== 0))
        {
            style = styles['activityBorderAll'];
        }
        let format = '';
        if(isCurrency)
        {
            format = '_("$"* #,##0.00_);_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)';
        }
        else if(isRegNum)
        {
            format = '_(* #,##0.00_);_(* \\\\(#,##0.00\\\\);_(* "-"??_);_(@_)';
        }
        return {
            v: val,
            s: style,
            t: (isCurrency || isRegNum) ? "n" : 's',
            z: format,
        };
    }

    function processRow(data: Record<string, any>, styleKey: string): void {
        if (data.total !== 0 && data.total !== null) {
            const row: Cell[] = [];
            for (const [key, value] of Object.entries(data)) {
                if (!doNotInclude.includes(key)) {
                    const cellStyleKey = rightBorderedCells.includes(key)
                        ? `${styleKey}Border`
                        : styleKey;
                    const cell = applyStyle(cellStyleKey, value, key);
                    row.push(cell);
                }
            }
            rows.push(row);
        }
    }
    for (const wbsItem of wbs) {
        processRow(wbsItem, "wbs");

        if (wbsItem.phases) {
            for (const phase of wbsItem.phases) {
                processRow(phase, "phase");

                if (phase.activities) {
                    for (const activity of phase.activities) {
                        processRow(activity, "activity");
                    }
                }
            }
        }
    }
    let temp = createSummaryRow(wbs);
    processRow(temp, 'summary');

    return rows;
}

const createSummaryRow = (wbs: DataDumpWbs[]) => {
    let craftMH = 0;
    let weldMH = 0;
    //let subMH = 0;
    let baseCost = 0;
    let burden = 0;
    let overhead = 0;
    let laborProfit = 0;
    let fuel = 0;
    let consumables = 0;
    let subsistence = 0;
    let laborCost = 0;
    let rigCost = 0;
    let materialCost = 0;
    let equipmentCost = 0;
    let subcontractorCost = 0;
    let costOnlyCost = 0;
    let profitTotal = 0;
    let salesTax = 0;
    let total = 0;
    wbs.forEach((item) => {
        craftMH += item.craftMH ?? 0;
        weldMH += item.weldMH ?? 0;
        baseCost += item.baseCost ?? 0;
        burden += item.burden ?? 0;
        overhead += item.overhead ?? 0;
        laborProfit += item.laborProfit ?? 0;
        fuel += item.fuel ?? 0;
        consumables += item.consumables ?? 0;
        subsistence += item.subsistence ?? 0;
        laborCost += item.laborCost ?? 0;
        rigCost += item.rigCost ?? 0;
        materialCost += item.materialCost ?? 0;
        equipmentCost += item.equipmentCost ?? 0;
        subcontractorCost += item.subcontractorCost ?? 0;
        costOnlyCost += item.costOnlyCost ?? 0;
        profitTotal += item.profitTotal ?? 0;
        salesTax += item.salesTax ?? 0;
        total += item.total ?? 0;
    });

    let summaryRow: DataDumpItem = {
        wbsId: null,
        wbs: null,
        proposalId: null,
        phase: null,
        phaseId: null,
        size: null,
        flc: null,
        lineDescription: null,
        specification: null,
        insulation: null,
        insulationSize: null,
        sheet: null,
        area: null,
        status: null,
        specialCraftRate: null,
        specialSubRate: null,
        ownership: null,
        quantity: null,
        unit: null,
        craftMH: currencyRound(craftMH),
        weldMH: currencyRound(weldMH),
        subMH: null,
        totalMH: currencyRound((craftMH + weldMH)),
        baseCost:  baseCost,
        burden:  burden,
        overhead:  overhead,
        laborProfit:  laborProfit,
        fuel:  fuel,
        consumables:  consumables,
        subsistence:  subsistence,
        laborCost:  laborCost,
        rigCost:  rigCost,
        materialCost:  materialCost,
        equipmentCost:  equipmentCost,
        subcontractorCost: subcontractorCost,
        costOnlyCost: costOnlyCost,
        profitTotal:  profitTotal,
        salesTax:  salesTax,
        total: total,
    }
    return summaryRow;
};

let markupLabelStyle = {
    font: { name: "Calibri", sz: 10 },
    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
};
let markupStyle = {
    font: { name: "Calibri", sz: 10, color: {rgb: "0011ff"}, bold: true},
    alignment: { vertical: 'center', horizontal: 'right', wrapText: true },
    border: {
        top: { style: 'medium', color: '#000000' },
        bottom: { style: 'medium', color: '#000000' },
        right: { style: 'medium', color: '#000000' },
        left: { style: 'medium', color: '#000000' }
    },
    fill: { fgColor: { rgb: "ededed" } },
};
let markupLeftBorder = {
    font: { name: "Calibri", sz: 10, color: {rgb: "0011ff"}, bold: true},
    alignment: { vertical: 'center', horizontal: 'right', wrapText: true },
    border: {
        top: { style: 'medium', color: '#000000' },
        bottom: { style: 'medium', color: '#000000' },
        left: { style: 'medium', color: '#000000' }
    },
    fill: { fgColor: { rgb: "ededed" } },
};
let markupRightBorder = {
    font: { name: "Calibri", sz: 10, color: {rgb: "0011ff"}, bold: true},
    alignment: { vertical: 'center', horizontal: 'right', wrapText: true },
    border: {
        top: { style: 'medium', color: '#000000' },
        bottom: { style: 'medium', color: '#000000' },
        right: { style: 'medium', color: '#000000' },
    },
    fill: { fgColor: { rgb: "ededed" } },
};
let markupTBBorder = {
    font: { name: "Calibri", sz: 10, color: {rgb: "0011ff"}, bold: true},
    alignment: { vertical: 'center', horizontal: 'right', wrapText: true },
    border: {
        top: { style: 'medium', color: '#000000' },
        bottom: { style: 'medium', color: '#000000' },
    },
    fill: { fgColor: { rgb: "ededed" } },
};
let markupAllBorder = {
    font: { name: "Calibri", sz: 10, color: {rgb: "0011ff"}, bold: true},
    alignment: { vertical: 'center', horizontal: 'right', wrapText: true },
    border: {
        top: { style: 'medium', color: '#000000' },
        bottom: { style: 'medium', color: '#000000' },
        right: { style: 'medium', color: '#000000' },
        left: { style: 'medium', color: '#000000' }
    },
    fill: { fgColor: { rgb: "ededed" } },
};

let markupNoBoarder = {
    font: { name: "Calibri", sz: 11},
    alignment: { vertical: 'center', horizontal: 'left', wrapText: true },
};
let proposalInfoLabel = {
    font: { name: "Calibri", sz: 11},
    alignment: {horizontal: 'right'},
};
let proposalInfoBottomBorder = {
    font: { name: "Calibri", sz: 11},
    alignment: {horizontal: 'left'},
    border: {
        bottom: { style: 'thin', color: '#000000' },
    }
};

let topMarkups: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "WELD", t: "s", s: markupStyle },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "SALES TAX", t: "s", s: markupStyle },
    { v: "", t: "s" }
];

let topMarkupLabels: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "RIG", t: "s", s: markupLabelStyle },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "USE TAX", t: "s", s: markupLabelStyle },
    { v: "", t: "s" }
];

let bottomMarkups: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "WELD", t: "s", s: markupLeftBorder }, //17
    { v: "", t: "s", s: markupTBBorder },
    { v: "", t: "s", s: markupTBBorder },
    { v: "BASE", t: "s", s: markupTBBorder }, //20
    { v: "BURDEN", t: "s", s: markupTBBorder }, //21
    { v: "OVERHEAD", t: "s", s: markupTBBorder }, //22
    { v: "LABOR PROFIT", t: "s", s: markupTBBorder }, //23
    { v: "FUEL", t: "s", s: markupTBBorder }, //24
    { v: "CONSUMABLES", t: "s", s: markupTBBorder }, //25
    { v: "SUBSIST", t: "s", s: markupRightBorder}, //26
    { v: "", t: "s" },
    { v: "RIGS", t: "s", s: markupLeftBorder }, //28
    { v: "MATERIAL", t: "s", s: markupTBBorder }, //29
    { v: "EQUIP", t: "s", s: markupTBBorder }, //30
    { v: "SUBS", t: "s", s: markupRightBorder }, //31
    { v: "(no tax or mu)", t: "s", s: markupNoBoarder }, //32
    { v: "", t: "s" },
    { v: "SALES TAX", t: "s", s: markupAllBorder }, //34
    { v: "", t: "s" }
];

let proposalInfo1: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "Proposal #:", t: "s", s: proposalInfoLabel },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
];
let proposalInfo2: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "Job #:", t: "s", s: proposalInfoLabel },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
];
let proposalInfo3: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "Change #:", t: "s", s: proposalInfoLabel },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
];
let proposalInfo4: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "Description:", t: "s", s: proposalInfoLabel },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
];
let proposalInfo5: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "Owner:", t: "s", s: proposalInfoLabel },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
];
let proposalInfo6: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "Location:", t: "s", s: proposalInfoLabel },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
];
let proposalInfo7: Cell[] = [
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "Date:", t: "s", s: proposalInfoLabel },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
    { v: "", t: "s", s: proposalInfoBottomBorder },
];


let doNotInclude = [
    'phaseId',
    'wbsId',
    'proposalId',
    'phases',
    'activities'
];
let rightBorderedCells = [
    'status',
    'ownership',
    'totalMH',
    'subsistence',
    'subcontractorCost',
    'costOnlyCost',
    'salesTax'
];
let dollarFormatCells = [
    'baseCost',
    'burden',
    'overhead',
    'laborProfit',
    'fuel',
    'consumables',
    'subsistence',
    'laborCost',
    'rigCost',
    'materialCost',
    'equipmentCost',
    'subcontractorCost',
    'costOnlyCost',
    'profitTotal',
    'salesTax',
    'total',
];















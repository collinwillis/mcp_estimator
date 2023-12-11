import {addDoc, collection, doc, getDoc, updateDoc} from "firebase/firestore";
import {FirestoreWbs} from "../models/firestore models/wbs_firestore";
import {Wbs} from "../models/wbs";
import {firestore} from "../setup/config/firebase";
import {WbsEnum} from "../utils/enums";
import {Phase} from "../models/phase";

export const insertAllBaseWbs = async (proposalId: string) => {
    const wbsArray: WbsEnum[] = [
        WbsEnum.AG_PIPING,
        WbsEnum.BG_PIPING,
        WbsEnum.BUILDINGS,
        WbsEnum.CONCRETE,
        WbsEnum.DEMOBILIZE,
        WbsEnum.DISMANTLING,
        WbsEnum.ELECTRICAL,
        WbsEnum.INSULATION,
        WbsEnum.INSTRUMENTS,
        WbsEnum.MOBILIZE,
        WbsEnum.PAINTING,
        WbsEnum.PUMPS_AND_DRIVERS,
        WbsEnum.REFRATORY,
        WbsEnum.SITE_PREPARATION,
        WbsEnum.SPECIALTY_SERVICES,
        WbsEnum.STRUCTURAL,
        WbsEnum.SUPPORT,
        WbsEnum.TOWERS_VESSELS_EQUIPMENT,
    ];
    wbsArray.forEach(async (wbs) => {
        const wbsToInsert = new FirestoreWbs({
            name: wbs.name,
            wbsDatabaseId: wbs.wbsDatabaseId,
            proposalId: proposalId,
        });
        await insertBaseWbs(proposalId, wbsToInsert);
        console.log("inserted wbs: ", wbsToInsert);
        return;
    });
};

export const insertBaseWbs = async (proposalId: string, wbs: FirestoreWbs) => {
    await addDoc(collection(firestore, "wbs"), {
        ...wbs,
    });
};

export const getSingleWbs = async ({wbsId}: { wbsId: string }) => {
    const wbsRef = doc(firestore, "wbs", wbsId);
    const wbsSnapshot = await getDoc(wbsRef);
    if (wbsSnapshot.exists()) {
        const proposal = wbsSnapshot.data() as Wbs;
        proposal.id = wbsSnapshot.id;
        return proposal;
    } else {
        console.log("No such document!");
    }
};

export const updateWbs = async (id: string, field: string, value: string) => {
    let newValue;
    if (isNumber(value) == true) {
        newValue = parseFloat(value);
    } else {
        newValue = value;
    }
    const data = {
        [field]: newValue,
    };
    await updateDoc(doc(firestore, "wbs", id), data)
        .then((docRef) => {
            console.log("Value of an Existing Document Field has been updated");
        })
        .catch((error) => {
            console.log(error);
        });
};

function isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
}


export function getQuantityAndUnitForWbs(phases: Phase[], wbsDatabaseId: number) {
    let quantity = 0;
    let unit = '';

    const unitMap = new Map<number, string>([
        [20000, "CY"],
        [30000, "CY"],
        [40000, "TON"],
        [50000, "EA"],
        [60000, "TON"],
        [70000, "LF"],
        [130000, "LF"],
    ]);

    unit = unitMap.get(wbsDatabaseId) || '';

    phases.forEach((phase) => {
        if (phase.unit != '' && phase.unit === unit) {
            quantity += phase.quantity ?? 0;
        }
    });

    return {quantity, unit};
}

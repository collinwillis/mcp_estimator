export class Equipment {
    id: number;
    description: string;
    hourRate: number;
    dayRate: number;
    weekRate: number;
    monthRate: number;

    constructor(
        id: number,
        description: string,
        hourRate: number,
        dayRate: number,
        weekRate: number,
        monthRate: number
    ) {
        this.id = id;
        this.description = description;
        this.dayRate = dayRate;
        (this.hourRate = hourRate), (this.weekRate = weekRate);
        this.monthRate = monthRate;
    }
}

export enum EquipmentUnit {
    hours = "Hours",
    days = "Days",
    weeks = "Weeks",
    months = "Months",
    each = "EA"
}

export enum EquipmentOwnership {
    rental = "Rental",
    owned = "Owned",
    purchase = "Purchase"
}

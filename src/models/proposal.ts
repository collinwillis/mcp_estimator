export class Proposal {
  id?: string;
  proposalNumber?: number;
  job?: string;
  coNumber?: number;
  proposalDescription?: string;
  proposalOwner?: string;
  projectCity?: string;
  projectState?: string;
  proposalEstimators?: string;
  proposalDateReceived?: string;
  proposalDateDue?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  bidType?: string;
  proposalStatus?: string;
  contactName?: string;
  contactAddress?: string;
  contactCity?: string;
  contactState?: string;
  contactZip?: number;
  contactPhone?: string;
  contactEmail?: string;
  quantity?: number;
  customQuantity?: number;
  unit?: string;
  customUnit?: string;
  craftManHours?: number;
  craftCost?: number;
  welderManHours?: number;
  welderCost?: number;
  materialCost?: number;
  equipmentCost?: number;
  subContractorCost?: number;
  costOnlyCost?: number;
  totalCost?: number;
  craftBaseRate?: number;
  weldBaseRate?: number;
  subsistenceRate?: number;
  useTaxRate?: number;
  salesTaxRate?: number;
  overheadRate?: number;
  consumablesRate?: number;
  burdenRate?: number;
  fuelRate?: number;
  rigRate?: number;
  laborProfitRate?: number;
  materialProfitRate?: number;
  equipmentProfitRate?: number;
  subContractorProfitRate?: number;
  rigProfitRate?: number;

  constructor(data: Partial<Proposal>) {
    Object.assign(this, data);
  }
}

export enum BidType {
  None = "None",
  LumpSum = "Lump Sum",
  TimeAndMaterials = "Time and Materials",
  Budgetary = "Budgetary",
  Rates = "Rates",
  CostPlus = "Cost Plus",
}

export enum ProposalStatus {
  None = "None",
  Bidding = "Bidding",
  Submitted = "Submitted",
  Awarded = "Awarded",
  Rejected = "Rejected",
  Declined = "Declined",
  Open = "Open",
  Closed = "Closed",
}

export enum UnitedStatesStates {
  None = "None",
  Alabama = "Alabama",
  Alaska = "Alaska",
  Arizona = "Arizona",
  Arkansas = "Arkansas",
  California = "California",
  Colorado = "Colorado",
  Connecticut = "Connecticut",
  Delaware = "Delaware",
  Florida = "Florida",
  Georgia = "Georgia",
  Hawaii = "Hawaii",
  Idaho = "Idaho",
  Illinois = "Illinois",
  Indiana = "Indiana",
  Iowa = "Iowa",
  Kansas = "Kansas",
  Kentucky = "Kentucky",
  Louisiana = "Louisiana",
  Maine = "Maine",
  Maryland = "Maryland",
  Massachusetts = "Massachusetts",
  Michigan = "Michigan",
  Minnesota = "Minnesota",
  Mississippi = "Mississippi",
  Missouri = "Missouri",
  Montana = "Montana",
  Nebraska = "Nebraska",
  Nevada = "Nevada",
  NewHampshire = "New Hampshire",
  NewJersey = "New Jersey",
  NewMexico = "New Mexico",
  NewYork = "New York",
  NorthCarolina = "North Carolina",
  NorthDakota = "North Dakota",
  Ohio = "Ohio",
  Oklahoma = "Oklahoma",
  Oregon = "Oregon",
  Pennsylvania = "Pennsylvania",
  RhodeIsland = "Rhode Island",
  SouthCarolina = "South Carolina",
  SouthDakota = "South Dakota",
  Tennessee = "Tennessee",
  Texas = "Texas",
  Utah = "Utah",
  Vermont = "Vermont",
  Virginia = "Virginia",
  Washington = "Washington",
  WestVirginia = "West Virginia",
  Wisconsin = "Wisconsin",
  Wyoming = "Wyoming",
}

export enum EState {
  MARRIED = "Married",
  SINGLE = "Single",
  DIVORCED = "Divorced"
}

export enum EStatus {
  RENT = "Rent",
  OWN = "Own"
}

export interface IConsumer {
  age: number;
  state: EState;
  noOfChildren: number;
  noOfCars: number;
  householdIncome: number;
  phoneNo: string;
  objectStatus: EStatus;
}

import { EState, EStatus } from "../consumer/consumer.interface";

export enum IAgentState {
  IDLE = 1,
  OFFLINE = 2,
  BUSY = 3
}

export interface IAgent {
  name: string;
  minAgeInterval: number;
  maxAgeInterval: number;
  stateHandle: Array<EState>;
  minNumberOfKids: number;
  maxNumberOfKids: number;
  minNumberOfCars: number;
  maxNumberOfCars: number;
  statusHandle: Array<EStatus>;
  minHouseholdIncome: number;
  maxHouseholdIncome: number;
  state: IAgentState;
}

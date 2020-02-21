import { IAgent, IAgentState } from "./agent.interface";
import { EState, EStatus } from "../consumer/consumer.interface";
import * as utils from "../../utils/utils";

export default class Agent {
  public details: IAgent;
  constructor() {
    this.details = this.generateRandomAgentData();
  }

  private generateRandomAgentData(): IAgent {
    let stateHandle = [];
    let statusHandle = [];
    for (let i = 0; i < utils.randomNumberInterval(0, 3); i++) {
      let state = utils.randomObjFromArray([
        EState.MARRIED,
        EState.SINGLE,
        EState.DIVORCED
      ]);
      stateHandle.push(state);
    }

    for (let i = 0; i < utils.randomNumberInterval(0, 2); i++) {
      let status = utils.randomObjFromArray([EStatus.OWN, EStatus.RENT]);
      statusHandle.push(status);
    }
    let minAgeValue = utils.randomNumber(1, 40);
    let minNoKidsValue = utils.randomNumber(0, 2);
    let minNoCarsValue = utils.randomNumber(0, 4);
    let minHouseholdIncomeValue = utils.randomNumber(0, 40000);

    return {
      name: utils.randomString(),
      minAgeInterval: minAgeValue,
      maxAgeInterval: utils.randomNumber(minAgeValue + 1, 80),
      stateHandle,
      statusHandle,
      minNumberOfKids: minNoKidsValue,
      maxNumberOfKids:
        minNoKidsValue == 0 ? 0 : utils.randomNumber(minNoKidsValue + 1, 10),
      minNumberOfCars: minNoCarsValue,
      maxNumberOfCars:
        minNoCarsValue == 0 ? 0 : utils.randomNumber(minNoCarsValue + 1, 20),
      minHouseholdIncome: minHouseholdIncomeValue,
      maxHouseholdIncome:
        minHouseholdIncomeValue == 0
          ? 0
          : utils.randomNumber(minHouseholdIncomeValue + 1, 150000),
      state: IAgentState.IDLE
    };
  }
}

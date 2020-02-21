import { IConsumer, EStatus, EState } from "./consumer.interface";
import * as utils from "../../utils/utils";

export default class Consumer {
  public consumerData: IConsumer;

  constructor() {
    this.consumerData = this.generateRandomConsumerData();
  }

  public generateRandomConsumerData(): IConsumer {
    return {
      age: utils.randomNumberInterval(0, 80),
      householdIncome: utils.randomNumberInterval(0, 150000),
      noOfCars: utils.randomNumberInterval(0, 20),
      noOfChildren: utils.randomNumberInterval(0, 10),
      objectStatus: utils.randomObjFromArray([EStatus.OWN, EStatus.RENT]),
      state: utils.randomObjFromArray([
        EState.SINGLE,
        EState.MARRIED,
        EState.DIVORCED
      ]),
      phoneNo: utils.randomNumber(1000000000, 1000000000).toString()
    };
  }
}

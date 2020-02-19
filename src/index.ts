import InsuranceCallCenter from "./insurance-call-center";
import { EStatus, EState } from "./models/consumer/consumer.interface";
import Consumer from "./models/consumer/consumer";

import * as utils from "./utils/utils";

class App {
  public consumers: Array<Consumer> = [];
  public callCenter: InsuranceCallCenter;

  constructor() {
    /** Generate 100 consumers */
    this.generateConsumers(100);
    /** New InsuranceCallCenter */
    this.callCenter = new InsuranceCallCenter({
      noAgents: 20,
      minCallSleep: 100,
      maxCallSleep: 300
    });

    /** Each consumer makes a call */
    this.consumers.forEach((consumer: Consumer) => {
      this.callCenter.newCall(consumer);
    });
  }

  public generateConsumers(number: number) {
    for (let index = 0; index < number; index++) {
      this.consumers.push(
        new Consumer({
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
        })
      );
    }
  }
}

console.log("--------------------------");
new App();
console.log("--------------------------");

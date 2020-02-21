import InsuranceCallCenter from "./insurance-call-center";
import { EStatus, EState } from "./models/consumer/consumer.interface";
import Consumer from "./models/consumer/consumer";

import * as utils from "./utils/utils";
import { writeHeapSnapshot } from "v8";

class App {
  public consumers: Array<Consumer> = [];
  public callCenter: InsuranceCallCenter;

  constructor() {
    let noConsumers = 1000;
    /** Generate 100 consumers */
    this.generateConsumers(noConsumers);

    /** New InsuranceCallCenter */
    this.callCenter = new InsuranceCallCenter({
      /** How many agents to generate */
      noAgents: 20,
      /** interval of in call time */
      minCallSleep: 1000,
      maxCallSleep: 3000,
      /** interval of in call from voicemail time */
      minVoiceMailCallSleep: 100,
      maxVoiceMailCallSleep: 200,
      /** close call center after all calls have been consumed */
      noOfCalls: noConsumers
    });

    /** Each consumer makes a call */
    this.consumers.forEach((consumer: Consumer) => {
      setTimeout(() => {
        this.callCenter.newCall(consumer);
      }, utils.randomNumberInterval(100, 3000));
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

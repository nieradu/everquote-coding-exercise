import InsuranceCallCenter from "./insurance-call-center";
import Consumer from "./models/consumer/consumer";

import * as utils from "./utils/utils";

class App {
  public consumers: Array<Consumer> = [];
  public callCenter: InsuranceCallCenter;

  constructor() {
    let noConsumers = 1000;
    /** Generate X consumers */
    this.generateConsumers(noConsumers);

    /** New InsuranceCallCenter */
    this.callCenter = new InsuranceCallCenter({
      /** How many agents to generate */
      noAgents: 20,
      /** interval of in call time */
      minCallSleep: 100,
      maxCallSleep: 300,
      /** interval of in call from voicemail time */
      minVoiceMailCallSleep: 1000,
      maxVoiceMailCallSleep: 2000,
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
      this.consumers.push(new Consumer());
    }
  }
}

console.log("------START APP -------");
new App();

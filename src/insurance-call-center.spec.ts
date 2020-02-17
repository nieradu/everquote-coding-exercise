import InsuranceCallCenter from "./insurance-call-center";
import Consumer from "./models/consumer/consumer.model";
import * as IConsumerAttributes from "./models/consumer/consumer.interface";
/**
 * Tasks
 *    Represents a consumer trying to contact an agent
 *
 * MatchAgents
 *    Responsible for handling Tasks
 *
 * Task Queues
 *    Holds Tasks to be consumed by a set of Agents
 *
 * Workflows
 *    Responsible for placing Tasks into Task Queues
 *
 * Activities
 *    Possible states of an Agent. Eg: idle, offline, busy
 *
 */

describe("Insurance Call Center", () => {
  var icc = new InsuranceCallCenter({ noAgents: 20 });
  var consumer = new Consumer({
    age: 30,
    householdIncome: 0,
    noOfCars: 1,
    noOfChildren: 0,
    objectStatus: IConsumerAttributes.EStatus.OWN,
    state: IConsumerAttributes.EState.SINGLE,
    phoneNo: "0799999999"
  });

  it("Should be true", () => {
    expect(true).toBeTruthy();
  });
  // it("Should Generate agent", () => {});
  it("Should be able to generate a new task", () => {
    icc.newTask(consumer.consumerData);
  });
  it("Should generate an Insurance Call Center with 20 random agents", () => {
    expect(icc).toBeDefined();
  });
});

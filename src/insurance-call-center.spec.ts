import InsuranceCallCenter from "./insurance-call-center";
import Consumer from "./models/consumer/consumer";
import Agent from "./models/agent/agent.model";
import * as IConsumerAttributes from "./models/consumer/consumer.interface";
import { VoiceMail } from "./models/voiceMail/voiceMail";
import { IAgentState } from "./models/agent/agent.interface";
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
  var agent: any = new Agent({
    name: "Test",
    minAgeInterval: 18,
    maxAgeInterval: 49,
    stateHandle: [
      IConsumerAttributes.EState.MARRIED,
      IConsumerAttributes.EState.DIVORCED
    ],
    statusHandle: [
      IConsumerAttributes.EStatus.OWN,
      IConsumerAttributes.EStatus.RENT
    ],
    minNumberOfKids: 0,
    maxNumberOfKids: 5,
    minNumberOfCars: 0,
    maxNumberOfCars: 5,
    minHouseholdIncome: 0,
    maxHouseholdIncome: 5000,
    state: IAgentState.OFFLINE
  });

  it("Should be true", () => {
    expect(true).toBeTruthy();
  });
  // it("Should Generate agent", () => {});
  it("Should be able to generate a new task", () => {
    icc.newTask(consumer);
  });
  it("Should generate an Insurance Call Center with 20 random agents", () => {
    expect(icc).toBeDefined();
  });
  it("Should push a task in queue", () => {
    let task = new VoiceMail([agent], consumer);
    icc.workflow(task);
    expect(icc.taskQueues).toHaveProperty("length", 1);
  });
});

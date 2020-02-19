import InsuranceCallCenter from "./insurance-call-center";
import Consumer from "./models/consumer/consumer";
import Agent from "./models/agent/agent";
import * as IConsumerAttributes from "./models/consumer/consumer.interface";
import { VoiceMail } from "./models/voiceMail/voiceMail";
import { IAgentState } from "./models/agent/agent.interface";
/**
 * VoiceMails
 *    Represents a consumer trying to contact an agent
 *
 * MatchAgents
 *    Responsible for handling VoiceMails
 *
 * VoiceMail Queues
 *    Holds VoiceMails to be consumed by a set of Agents
 *
 * Workflows
 *    Responsible for placing VoiceMails into VoiceMail Queues
 *
 * Activities
 *    Possible states of an Agent. Eg: idle, offline, busy
 *
 */

describe("Insurance Call Center", () => {
  var icc = new InsuranceCallCenter({
    noAgents: 20,
    minCallSleep: 1,
    maxCallSleep: 2
  });
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
  var agents: Array<Agent> = [agent, agent, agent];

  it("Should be able to generate 2 agents", () => {
    var icc = new InsuranceCallCenter({
      noAgents: 2,
      minCallSleep: 1,
      maxCallSleep: 2
    });
    expect(icc.inMemory.agents.length).toEqual(2);
  });
  it("Should be able to make a call", () => {
    var icc = new InsuranceCallCenter({
      noAgents: 20,
      minCallSleep: 1,
      maxCallSleep: 2
    });
    expect(icc.newCall).toBeDefined();
  });
  // it("Should Generate agent", () => {});
  it("Should be able to generate a new task", () => {
    icc.newCall(consumer);
  });
  it("Should generate an Insurance Call Center with 20 random agents", () => {
    expect(icc).toBeDefined();
  });
  it("Should push a task in queue", () => {
    let task = new VoiceMail([agent], consumer);
    icc.addVoiceMail(task);
    expect(icc.voiceMailQueues.length).toBeGreaterThan(0);
  });
  it("Should test a consumer can make a call", () => {});
  it("Should test voiceMail is created after consumer calls and agent is busy", () => {
    icc.inMemory.agents.forEach((agent: Agent) => {
      agent.details.state = IAgentState.BUSY;
    });
    let beforeCall = icc.voiceMailQueues.length;

    icc.newCall(consumer);

    expect(icc.voiceMailQueues.length).toBeGreaterThan(beforeCall);
  });

  it("Given 20 Agents when 1000 calls happen then schedule & consume all", () => {
    icc.inMemory.agents = [];
    for (let index = 1; index <= 1000; index++) {
      //icc.workflow(consumer);
      //(1 + Math.floor((3 - 1) * Math.random())) * 100
    }
  });
});

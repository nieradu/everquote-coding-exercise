import {
  IConsumer,
  EState,
  EStatus
} from "./models/consumer/consumer.interface";
import Agent from "./models/agent/agent.model";
import { IAgent, IAgentState } from "./models/agent/agent.interface";
import Consumer from "./models/consumer/consumer";
import * as IConsumerAttributes from "./models/consumer/consumer.interface";
import { VoiceMail } from "./models/voiceMail/voiceMail";
import { IVoiceMailStatus } from "./models/voiceMail/voiceMail.interface";
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
export interface ICallCenterParams {
  noAgents: number;
}

export default class InsuranceCallCenter {
  public CACHE: any = {
    agents: [
      new Agent({
        name: "Test",
        minAgeInterval: 18,
        maxAgeInterval: 49,
        stateHandle: [EState.MARRIED, EState.DIVORCED],
        statusHandle: [EStatus.OWN, EStatus.RENT],
        minNumberOfKids: 0,
        maxNumberOfKids: 5,
        minNumberOfCars: 0,
        maxNumberOfCars: 5,
        minHouseholdIncome: 0,
        maxHouseholdIncome: 5000,
        state: IAgentState.IDLE
      }),
      new Agent({
        name: "All you",
        minAgeInterval: 49,
        maxAgeInterval: 75,
        stateHandle: [EState.SINGLE],
        statusHandle: [EStatus.OWN],
        minNumberOfKids: 0,
        maxNumberOfKids: 5,
        minNumberOfCars: 0,
        maxNumberOfCars: 5,
        minHouseholdIncome: 5001,
        maxHouseholdIncome: 20000,
        state: IAgentState.BUSY
      })
    ],
    consumers: [
      new Consumer({
        age: 30,
        householdIncome: 0,
        noOfCars: 1,
        noOfChildren: 0,
        objectStatus: IConsumerAttributes.EStatus.OWN,
        state: IConsumerAttributes.EState.SINGLE,
        phoneNo: "0799999999"
      })
    ]
  };
  public taskQueues: Array<VoiceMail> = [];

  constructor(public params: ICallCenterParams) {
    //this.generateRandomAgents(params.noAgents)

    let consumer = this.CACHE.consumers[0];
    this.newTask(consumer);
  }

  public newTask(consumer: Consumer): void {
    /** search for agents matching attributes
     * if all agents found are != idle
     * taskQueues will be called
     * else assign to agent or random agent if agentFound.length > 1
     */
    let matchedAgents: Array<Agent>;
    let availableAgents: Array<Agent>;
    let randomAgent: Agent;

    /** match agents with consumer */
    matchedAgents = this.matchAgents(this.CACHE.agents, consumer.consumerData);

    /** there are matched agents */
    if (matchedAgents && matchedAgents.length > 0) {
      /** Look for agents that have state: IDLE */
      availableAgents = matchedAgents.filter(
        (x: any) => x.details.state == IAgentState.IDLE
      );
      /** Specs 4.C - chose random agent if multiple match consumer's attributes */
      randomAgent =
        availableAgents[Math.floor(Math.random() * availableAgents.length)];

      if (availableAgents && availableAgents.length > 0) {
        /** It can have the call with the agent */
        let task = new VoiceMail([randomAgent], consumer);

        /** Consumer connected to Agent - close task */
        task.setStatus(IVoiceMailStatus.DONE);

        return;
      } else {
        /** NO available agents, leave voice mail */
        let task = new VoiceMail(matchedAgents, consumer);
        this.workflow(task);
        return;
      }
    } else {
      /** there are no matched agents.
       * chose a random one */
      randomAgent = this.CACHE.agents[
        Math.floor(Math.random() * this.CACHE.agents.length)
      ];
      let task = new VoiceMail([randomAgent], consumer);
      this.workflow(task);
      return;
    }
  }

  public matchAgents(agents: Array<Agent>, consumer: IConsumer): Array<Agent> {
    /** Specs 2 line 3 - retrieve all agents that match a certain range or value from consumer attributes */
    return agents.filter((obj: any) => {
      /** filter variables */
      let agent: IAgent = obj.details;
      let isInAgeInterval =
        consumer.age >= agent.minAgeInterval &&
        consumer.age <= agent.maxAgeInterval;
      let isInHouseHoldInterval =
        consumer.householdIncome >= agent.minHouseholdIncome &&
        consumer.householdIncome <= agent.maxHouseholdIncome;
      let isInNoCarsInterval =
        consumer.noOfCars >= agent.minNumberOfCars &&
        consumer.noOfCars <= agent.maxNumberOfCars;
      let isInNoOfKidsInterval =
        consumer.noOfChildren >= agent.minNumberOfKids &&
        consumer.noOfChildren <= agent.maxNumberOfKids;
      let agentState = agent.stateHandle.some(x => x == consumer.state);
      let agentStatus = agent.statusHandle.some(
        x => x == consumer.objectStatus
      );

      /** return if matched at least one attribute */
      return (
        isInAgeInterval ||
        isInHouseHoldInterval ||
        isInNoCarsInterval ||
        isInNoOfKidsInterval ||
        agentState ||
        agentStatus
      );
    });
  }

  public workflow(task: VoiceMail) {
    /** places tasks in taskQueues for agents to call back*/
    this.taskQueues.push(task);
  }

  generateRandomAgents(howMany: number) {}
}

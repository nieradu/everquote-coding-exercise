import {
  IConsumer,
  EState,
  EStatus
} from "./models/consumer/consumer.interface";
import Agent from "./models/agent/agent.model";
import { IAgent, IAgentState } from "./models/agent/agent.interface";
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
    ]
  };

  constructor(public params: ICallCenterParams) {
    //this.generateRandomAgents(params.noAgents)
    let consumer = new Consumer({
      age: 30,
      householdIncome: 0,
      noOfCars: 1,
      noOfChildren: 0,
      objectStatus: IConsumerAttributes.EStatus.OWN,
      state: IConsumerAttributes.EState.SINGLE,
      phoneNo: "0799999999"
    });
    this.newTask(consumer.consumerData);
  }

  /** --Small logic--
   * consumer call
   * new Task
   * if available and match
   *      chat
   * if not avaialble
   *      register in workflow
   *
   */

  public newTask(consumer: IConsumer) {
    let possibleAgents: IAgent[];
    let availableAgents: IAgent[];
    let chosenAgent: IAgent;
    /** search for agents matching attributes
     * if all agents found are != idle
     * taskQueues will be called
     * else assign to agent or random agent if agentFound.length > 1
     */

    // for (let index = 0; index < this.CACHE.agents.length; index++) {
    //   var agent: IAgent = this.CACHE.agents[index];

    // }

    possibleAgents = this.CACHE.agents.filter((obj: any) => {
      let agent: IAgent = obj.details;
      /** Specs 2 line 3 -  */
      return (
        (agent.minAgeInterval <= consumer.age &&
          agent.maxAgeInterval >= consumer.age) ||
        (agent.minHouseholdIncome <= consumer.householdIncome &&
          agent.maxHouseholdIncome >= consumer.householdIncome) ||
        (agent.minNumberOfCars <= consumer.noOfCars &&
          agent.maxNumberOfCars >= consumer.noOfCars) ||
        (agent.minNumberOfKids <= consumer.noOfChildren &&
          agent.maxNumberOfKids >= consumer.noOfChildren) ||
        agent.stateHandle.some(state => state == consumer.state) ||
        agent.statusHandle.some(status => status == consumer.objectStatus)
      );
    });

    /** Look for agents that have state: IDLE */
    availableAgents = possibleAgents.filter(
      (x: any) => x.details.state == IAgentState.IDLE
    );
    /** If agents are avaiable */
    if (availableAgents && availableAgents.length > 0) {
      /** Specs 4.C - chose random agent if multiple match consumer's attributes */
      chosenAgent =
        availableAgents[Math.floor(Math.random() * availableAgents.length)];
      /** It can have the call with the agent
       *
       * return with a task
       * with status ok
       */
      /** Consumer connected to Agent - close task */
      return chosenAgent;
    }
    /**
     * generate task
     * */

    // return {
    //   date: "",
    //   agents: [],
    //   consumer: consumer,
    //   status: true
    // }
  }

  public matchAgents() {
    /** retrieve all agents that match a certain range or value from consumer attributes */
  }

  public taskQueues(agents: any[], consumer: IConsumer) {
    /** stack tasks that matched when task was created to a set of agents but they were busy */
    //this.taskQueuesStack.push()
  }

  public workflow() {
    /** places tasks in taskQueues for agents to call back*/
  }
}

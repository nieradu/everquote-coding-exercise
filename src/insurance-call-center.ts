import {
  IConsumer,
  EState,
  EStatus
} from "./models/consumer/consumer.interface";
import Agent from "./models/agent/agent";
import { IAgent, IAgentState } from "./models/agent/agent.interface";
import Consumer from "./models/consumer/consumer";
import * as IConsumerAttributes from "./models/consumer/consumer.interface";
import { VoiceMail } from "./models/voiceMail/voiceMail";
import { IVoiceMailStatus } from "./models/voiceMail/voiceMail.interface";
import * as utils from "./utils/utils";
import * as async from "async";
import { Excel } from "./excell/excell";
import { OpenCall } from "./models/openCall/openCall";

/**
 * VoiceMails
 *    Represents a consumer trying to contact an agent
 *
 * MatchAgents ------
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
 * Agents Outbound Calls
 *    Responsible for handling VoiceMails for Agents
 */
export interface ICallCenterParams {
  noAgents: number;
}

export default class InsuranceCallCenter {
  public inMemory: any = {
    agents: [],
    consumers: []
  };
  public voiceMailQueues: Array<VoiceMail> = [];
  public historyVoiceMailQueue: Array<VoiceMail> = [];
  public callRouter: async.AsyncQueue<Consumer>;
  public voiceCallsWorker: async.AsyncQueue<any>;
  public excel: Excel;

  constructor(private params: ICallCenterParams) {
    this.excel = new Excel(100);

    /** generate Agemts */
    this.genereateAgents(this.params.noAgents);

    this.initCallRouter();
    //this.initVoiceCallsWorker();

    this.createCallFromVoicemailWorker();
    this.workerForVoiceMailQueue();
  }

  public initCallRouter() {
    this.callRouter = async.queue((consumer: Consumer, callback) => {
      this.workFlow(consumer);

      /** Consumers waiting to pe processed */
      //console.log("Wait list: ", this.callRouter.length());
      //console.log("----------------");
      callback();
      // setTimeout(() => {
      //   callback();
      // }, (1 + Math.floor((3 - 1) * Math.random())) * 1000);
    }, 20);
  }

  public initVoiceCallsWorker() {
    this.voiceCallsWorker = async.queue((task: VoiceMail, callback) => {
      // console.log("VoiceMail date: ", task.date);
      // console.log("Voicemail list left: ", this.voiceCallsWorker.length());
      // console.log("----------------");

      /**  */

      callback();
    }, 1);

    async.parallel([], (err, result) => {
      console.log(result);
    });
  }

  public workFlow(consumer: Consumer) {
    let matchedAgents: Array<Agent>;
    let availableAgents: Array<Agent>;
    let selectedAgent: Agent;

    /** Spec 4.a, 4.b - match agents with consumer */
    matchedAgents = this.matchAgents(
      this.inMemory.agents,
      consumer.consumerData
    );

    /** Write to excell */
    //this.excel.consumerSheetData(this.taskQueue.length(), consumer);

    //console.log("Redirecting Call from: " + consumer.consumerData.phoneNo);

    /** there are matched agents */
    if (matchedAgents && matchedAgents.length > 0) {
      /** Look for agents that have state: IDLE */
      availableAgents = this.availableAgents(matchedAgents);

      if (availableAgents && availableAgents.length > 0) {
        /** It can have the call with the agent */

        /** Specs 4.C - chose random agent if multiple match consumer's attributes */
        selectedAgent = utils.randomObjFromArray(availableAgents);

        selectedAgent.details.state = IAgentState.BUSY;
        this.openCall(selectedAgent, consumer).then((data: any) => {
          this.endCall(data.agent, data.consumer);

          /** logic handle for consumer */
        });

        //console.log("To agent: ", selectedAgent.details.name);

        //let voiceMail = new VoiceMail([selectedAgent], consumer);
        //voiceMail.updateVoiceMail({ asignedAgent: selectedAgent });

        return;
      } else {
        /** NO available agents, leave voice mail */
        let voiceMail = new VoiceMail(matchedAgents, consumer);
        this.addVoiceMail(voiceMail);
        return;
      }
    } else {
      /** there are no matched agents.
       * chose a random one */
      selectedAgent = utils.randomObjFromArray(this.inMemory.agents);

      let voiceMail = new VoiceMail([selectedAgent], consumer);
      this.addVoiceMail(voiceMail);
      return;
    }
  }

  public newCall(consumer: Consumer) {
    this.callRouter.push(consumer, (err: any) => {
      //Done
      /** Save excel file */
      //this.excel.saveExcel('IIC');
      //console.log(this.voiceMailQueues);
      if (err) {
        console.log(err);
      }
    });
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

  public async openCall(
    agent: Agent,
    consumer: Consumer
  ): Promise<{ agent: Agent; consumer: Consumer }> {
    var newOpenCall = new Promise<{ agent: Agent; consumer: Consumer }>(
      resolve => {
        setTimeout(() => {
          resolve({ agent, consumer });
        }, utils.randomNumberInterval(1, 3));
      }
    );
    return newOpenCall;
  }

  public availableAgents(
    matchedAgents: Array<Agent> = this.inMemory.agents,
    status: IAgentState = IAgentState.IDLE
  ): Array<Agent> {
    let availableAgents = matchedAgents.filter(
      (x: any) => x.details.state == status
    );
    return availableAgents;
  }

  public addVoiceMail(voiceMail: VoiceMail) {
    /** Spec 3 - Places voiceMails in voiceMailQueues for agents to call back*/
    this.voiceMailQueues.push(voiceMail);
    // this.voiceCallsWorker.push(voiceMail, (err: any) => {
    //   //Done

    //   if (err) {
    //     console.log(err);
    //   }
    // });
  }

  public getVoiceMailFor(name: string): Array<VoiceMail> {
    return this.voiceMailQueues.filter((voiceMailQueue: VoiceMail) => {
      return voiceMailQueue.agents.find((ag: Agent) => ag.details.name == name);
    });
  }

  public workerForVoiceMailQueue() {
    setInterval(() => {
      let idleAgents = this.availableAgents(
        this.inMemory.agents,
        IAgentState.IDLE
      );

      idleAgents.forEach((agent: Agent) => {
        let voiceMailList = this.getVoiceMailFor(agent.details.name);
        if (voiceMailList && voiceMailList.length > 0) {
          voiceMailList[0].status = IVoiceMailStatus.CALL_BACK;
          //voiceMailList[0].asignedAgent = agent;
        }
      });
    }, 100);
  }

  public createCallFromVoicemailWorker() {
    setInterval(() => {
      console.log(
        `Voicemails left: ${
          this.voiceMailQueues.filter(
            x =>
              x.status == IVoiceMailStatus.NEW ||
              x.status == IVoiceMailStatus.CALL_BACK
          ).length
        }`
      );

      if (this.voiceMailQueues && this.voiceMailQueues.length > 0) {
        let voiceMailToCall = this.voiceMailQueues.find(x => {
          return (
            (x.status == IVoiceMailStatus.NEW ||
              x.status == IVoiceMailStatus.CALL_BACK) &&
            this.availableAgents(x.agents, IAgentState.IDLE).length > 0
          );
        });

        if (voiceMailToCall) {
          let agents = this.availableAgents(
            voiceMailToCall.agents,
            IAgentState.IDLE
          );
          if (agents && agents.length > 0) {
            let agent = utils.randomObjFromArray(agents);
            agent.details.state = IAgentState.BUSY;

            console.log(`${agent.details.name} is now busy`);

            this.newOutboundCall(voiceMailToCall).then(voiceMail => {
              this.endCall(agent, voiceMail.consumer, voiceMail);
            });
          }
        }
      }
    }, 100);
  }

  public newOutboundCall(voiceMailToCall: VoiceMail): Promise<VoiceMail> {
    var newOpenCall = new Promise<VoiceMail>(resolve => {
      setTimeout(() => {
        resolve(voiceMailToCall);
      }, utils.randomNumberInterval(1, 3));
    });
    return newOpenCall;
  }

  public endCall(agent: Agent, consumer: Consumer, voiceMail?: VoiceMail) {
    // 1. update call status
    //this.callLog.push()
    // 2. update agent status
    agent.details.state = IAgentState.IDLE;

    if (voiceMail) {
      voiceMail.updateVoiceMail({
        status: IVoiceMailStatus.DONE,
        asignedAgent: agent
      });
      this.historyVoiceMailQueue.push(voiceMail);
      this.voiceMailQueues = this.voiceMailQueues.filter(
        x => x.id != voiceMail.id
      );
    }

    // /** Consumer connected to Agent - close voiceMail */
    // voiceMail.updateVoiceMail({ status: IVoiceMailStatus.DONE });

    // voiceMail.asignedAgent.details.state = IAgentState.IDLE;

    // /** Add VoiceMail to history */
    // this.historyVoiceMailQueue.push(voiceMail);
    // this.voiceMailQueues = this.voiceMailQueues.filter(x => {
    //   x !== voiceMail;
    // });
  }

  public logger() {
    /**
     * how many times each consumer was called
     * how many voicemails were left for each agent
     * how many cals did each agent recieve
     */
  }

  public genereateAgents(number: number): void {
    for (let indx = 0; indx < number; indx++) {
      let stateHandle = [];
      let statusHandle = [];
      for (let i = 0; i < utils.randomNumberInterval(0, 3); i++) {
        let state = utils.randomObjFromArray([
          IConsumerAttributes.EState.MARRIED,
          IConsumerAttributes.EState.SINGLE,
          IConsumerAttributes.EState.DIVORCED
        ]);
        stateHandle.push(state);
      }

      for (let i = 0; i < utils.randomNumberInterval(0, 2); i++) {
        let status = utils.randomObjFromArray([
          IConsumerAttributes.EStatus.OWN,
          IConsumerAttributes.EStatus.RENT
        ]);
        statusHandle.push(status);
      }
      let minAgeValue = utils.randomNumber(1, 40);
      let minNoKidsValue = utils.randomNumber(0, 2);
      let minNoCarsValue = utils.randomNumber(0, 4);
      let minHouseholdIncomeValue = utils.randomNumber(0, 40000);

      this.inMemory.agents.push(
        new Agent({
          name: utils.randomString(),
          minAgeInterval: minAgeValue,
          maxAgeInterval: utils.randomNumber(minAgeValue + 1, 80),
          stateHandle,
          statusHandle,
          minNumberOfKids: minNoKidsValue,
          maxNumberOfKids:
            minNoKidsValue == 0
              ? 0
              : utils.randomNumber(minNoKidsValue + 1, 10),
          minNumberOfCars: minNoCarsValue,
          maxNumberOfCars:
            minNoCarsValue == 0
              ? 0
              : utils.randomNumber(minNoCarsValue + 1, 20),
          minHouseholdIncome: minHouseholdIncomeValue,
          maxHouseholdIncome:
            minHouseholdIncomeValue == 0
              ? 0
              : utils.randomNumber(minHouseholdIncomeValue + 1, 150000),
          state: IAgentState.IDLE
        })
      );
    }
  }
}

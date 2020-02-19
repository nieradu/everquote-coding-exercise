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
import { Excel } from "./excel/excel";
import { OpenCall } from "./models/openCall/openCall";

export interface ICallCenterParams {
  noAgents: number;
}

export interface ILogger {
  consumers: Array<Consumer>;
  agents: Array<Agent>;
  callLogs: any;
  voiceMails: Array<VoiceMail>;
}

export default class InsuranceCallCenter {
  public inMemory: any = {
    agents: [],
    consumers: []
  };
  public voiceMailQueues: Array<VoiceMail> = [];
  public historyVoiceMailQueue: Array<VoiceMail> = [];
  public callRouter: async.AsyncQueue<Consumer>;
  public excel: Excel;
  public logger: ILogger = {
    consumers: [],
    agents: [],
    callLogs: null,
    voiceMails: []
  };

  constructor(private params: ICallCenterParams) {
    this.excel = new Excel(100);

    /** generate Agemts */
    this.genereateAgents(this.params.noAgents);

    this.initCallRouter();

    this.createCallFromVoicemailWorker();
    this.workerForVoiceMailQueue();
  }

  public initCallRouter() {
    this.callRouter = async.queue((consumer: Consumer, callback) => {
      /** Start workflow for new consumer */
      this.workFlow(consumer);
      /** Free task from queue */

      callback();
    }, 1 /* this represents the concurency for handling calls we asume there are 20 calls at a time*/);

    this.callRouter.drain(() => {
      this.logger.consumers.forEach((consumer: Consumer, index: number) => {
        const firstRowIndex = 1;
        const headerRowIndex = 1;
        this.excel.consumerSheetData(
          index + firstRowIndex + headerRowIndex,
          consumer
        );
      });
      this.logger.agents.forEach((agent: Agent, index: number) => {
        const firstRowIndex = 1;
        const headerRowIndex = 1;
        this.excel.agentSheetData(
          index + firstRowIndex + headerRowIndex,
          agent
        );
      });
      /** All calls have been executed */
      /** Save excel file */
      this.excel.saveExcel("IIC");
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
      availableAgents = this.getAvailableAgents(matchedAgents);

      if (availableAgents && availableAgents.length > 0) {
        /** It can have the call with the agent */

        /** Specs 4.C - chose random agent if multiple match consumer's attributes */
        selectedAgent = utils.randomObjFromArray(availableAgents);
        /** Mark agent as busy */
        selectedAgent.details.state = IAgentState.BUSY;
        /** Open call with consumer */

        this.openCall(selectedAgent, consumer).then((data: any) => {
          /** Trigger after call has ended */
          this.endCall(data.agent, data.consumer);
        });
        return;
      } else {
        /** NO available agents, leave voice mail */
        let voiceMail = new VoiceMail(matchedAgents, consumer);
        this.addVoiceMail(voiceMail);
        return;
      }
    } else {
      /** there are no matched agents so chose a random one */
      selectedAgent = utils.randomObjFromArray(this.inMemory.agents);
      /** leave voice mail to selected agent */
      let voiceMail = new VoiceMail([selectedAgent], consumer);
      this.addVoiceMail(voiceMail);
      return;
    }
  }

  public newCall(consumer: Consumer) {
    /** Adds new call to callRouter queue */
    this.callRouter.push(consumer, (err: any) => {
      /** log consumers */
      this.logger.consumers.push(consumer);

      //Done
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
    /** Simulates a call connection that ends on resolve after a random time */
    var newOpenCall = new Promise<{ agent: Agent; consumer: Consumer }>(
      resolve => {
        setTimeout(() => {
          resolve({ agent, consumer });
        }, utils.randomNumberInterval(1, 3));
      }
    );
    return newOpenCall;
  }

  public getAvailableAgents(
    matchedAgents: Array<Agent> = this.inMemory.agents,
    status: IAgentState = IAgentState.IDLE
  ): Array<Agent> {
    /** Gets agents from defined array with requested status */
    let availableAgents = matchedAgents.filter(
      (x: any) => x.details.state == status
    );
    return availableAgents;
  }

  public addVoiceMail(voiceMail: VoiceMail) {
    /** Spec 3 - Places voiceMails in voiceMailQueues for agents to call back*/
    this.voiceMailQueues.push(voiceMail);
  }

  public getVoiceMailFor(name: string): Array<VoiceMail> {
    /** Returns voicemails by filtering voicemail attribute (agents).
     * TODO: use an uniqueidentifier for agent
     */
    return this.voiceMailQueues.filter((voiceMailQueue: VoiceMail) => {
      return voiceMailQueue.agents.find((ag: Agent) => ag.details.name == name);
    });
  }

  public workerForVoiceMailQueue() {
    /** Searches for idle agents
     *  Sets first voicemail found to status (CALL_BACK) for each idle agent
     */
    setInterval(() => {
      let idleAgents = this.getAvailableAgents(
        this.inMemory.agents,
        IAgentState.IDLE
      );

      idleAgents.forEach((agent: Agent) => {
        let voiceMailList = this.getVoiceMailFor(agent.details.name);
        if (voiceMailList && voiceMailList.length > 0) {
          voiceMailList[0].status = IVoiceMailStatus.CALL_BACK;
        }
      });
    }, 100);
  }

  public createCallFromVoicemailWorker() {
    var _this = this;
    setInterval(() => {
      console.log(
        `Voicemails left: ${
          _this.voiceMailQueues.filter(
            x =>
              x.status == IVoiceMailStatus.NEW ||
              x.status == IVoiceMailStatus.CALL_BACK
          ).length
        }`
      );

      if (_this.voiceMailQueues && _this.voiceMailQueues.length > 0) {
        let voiceMailToCall = _this.voiceMailQueues.find(x => {
          return (
            (x.status == IVoiceMailStatus.NEW ||
              x.status == IVoiceMailStatus.CALL_BACK) &&
            _this.getAvailableAgents(x.agents, IAgentState.IDLE).length > 0
          );
        });

        if (voiceMailToCall) {
          let agents = _this.getAvailableAgents(
            voiceMailToCall.agents,
            IAgentState.IDLE
          );
          if (agents && agents.length > 0) {
            let agent = utils.randomObjFromArray(agents);
            agent.details.state = IAgentState.BUSY;

            console.log(`${agent.details.name} is now busy`);

            _this.newOutboundCall(voiceMailToCall).then(voiceMail => {
              _this.endCall(agent, voiceMail.consumer, voiceMail);
            });
          }
        }
      }
    }, 10);
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

    /** 3. For voicemail handling if the call ended came from a voiceMail */
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

      let newAgent = new Agent({
        name: utils.randomString(),
        minAgeInterval: minAgeValue,
        maxAgeInterval: utils.randomNumber(minAgeValue + 1, 80),
        stateHandle,
        statusHandle,
        minNumberOfKids: minNoKidsValue,
        maxNumberOfKids:
          minNoKidsValue == 0 ? 0 : utils.randomNumber(minNoKidsValue + 1, 10),
        minNumberOfCars: minNoCarsValue,
        maxNumberOfCars:
          minNoCarsValue == 0 ? 0 : utils.randomNumber(minNoCarsValue + 1, 20),
        minHouseholdIncome: minHouseholdIncomeValue,
        maxHouseholdIncome:
          minHouseholdIncomeValue == 0
            ? 0
            : utils.randomNumber(minHouseholdIncomeValue + 1, 150000),
        state: IAgentState.IDLE
      });

      this.inMemory.agents.push(newAgent);
      this.logger.agents.push(newAgent);
    }
  }
}

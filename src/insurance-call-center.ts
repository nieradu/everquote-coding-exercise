import { IConsumer } from "./models/consumer/consumer.interface";
import Agent from "./models/agent/agent";
import { IAgent, IAgentState } from "./models/agent/agent.interface";
import Consumer from "./models/consumer/consumer";
import { VoiceMail } from "./models/voiceMail/voiceMail";
import { IVoiceMailStatus } from "./models/voiceMail/voiceMail.interface";
import * as utils from "./utils/utils";
import * as async from "async";
import { Excel } from "./excel/excel";

export interface ICallCenterParams {
  noAgents: number;
  minCallSleep: number;
  maxCallSleep: number;
  minVoiceMailCallSleep: number;
  maxVoiceMailCallSleep: number;
  noOfCalls: number;
}

export interface ILogger {
  consumers: async.AsyncQueue<Consumer>;
  agents: async.AsyncQueue<Agent>;
}
export interface ICallLog {
  agent: Agent;
  consumer: Consumer;
  directCall: boolean;
  timeStart: Date;
  timeEnd: Date;
}
export default class InsuranceCallCenter {
  private consumerCounter: number = 2;
  private agentsCounter: number = 2;

  public inMemory: any = {
    agents: [],
    consumers: []
  };
  public voiceMailQueues: Array<VoiceMail> = [];
  public historyVoiceMailQueue: Array<VoiceMail> = [];
  public historyCallLog: Array<ICallLog> = [];
  public callRouter: async.AsyncQueue<Consumer>;
  public excel: Excel;
  private intervalsAwake: number = 0;

  public loggerQueue: ILogger = {
    consumers: async.queue((consumer: Consumer, callback) => {
      this.excel.consumerSheetData(this.consumerCounter++, consumer);
      callback();
    }, 100),
    agents: async.queue((agent: Agent, callback) => {
      this.excel.agentSheetData(this.agentsCounter++, agent);
      callback();
    }, 100)
  };

  constructor(private params: ICallCenterParams) {
    this.excel = new Excel("InsuranceCallCenterReport");

    /** generate Agemts */
    this.genereateAgents(this.params.noAgents);
    /** queue with concurency of number of agents */
    this.initCallRouter();
    /** Start workers to watch voiceMails */
    this.createCallFromVoicemailWorker();
    this.workerForVoiceMailQueue();
  }

  public initCallRouter() {
    this.callRouter = async.queue((consumer: Consumer, callback) => {
      /** Start workflow for new consumer */
      this.workFlow(consumer);
      /** Free task from queue */
      callback();
    }, this.params.noAgents);
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
          this.endCall(data.agent, data.consumer, data.timeStart);
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
      this.loggerQueue.consumers.push(consumer);
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

    var newOpenCall = new Promise<{
      agent: Agent;
      consumer: Consumer;
      timeStart: Date;
    }>(resolve => {
      /** Start moment to log for call */
      let timeStart = new Date();
      setTimeout(() => {
        /** End call after X time */
        resolve({ agent, consumer, timeStart });
      }, utils.randomNumberInterval(this.params.minCallSleep, this.params.maxCallSleep));
    });

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
    /** Returns voicemails by filtering voicemail attribute (agents).*/
    return this.voiceMailQueues.filter((voiceMailQueue: VoiceMail) => {
      /** return first */
      return voiceMailQueue.agents.find((ag: Agent) => ag.details.name == name);
    });
  }

  public workerForVoiceMailQueue() {
    /** Searches for idle agents
     *  Sets first voicemail found to status (CALL_BACK) for each idle agent
     */
    this.intervalsAwake += 1;
    let workInterval = setInterval(() => {
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

      this.endAndReport(workInterval);
    }, 100);
  }

  public createCallFromVoicemailWorker() {
    var _this = this;
    /** Counter for active intervals */
    this.intervalsAwake += 1;
    /** Set Interval for  worker */
    let workerInterval = setInterval(() => {
      /** Check for voicemail queues */
      if (_this.voiceMailQueues && _this.voiceMailQueues.length > 0) {
        /** Find available voicemails for agents */
        let voiceMailToCall = _this.voiceMailQueues.find(x => {
          return (
            (x.status == IVoiceMailStatus.NEW ||
              x.status == IVoiceMailStatus.CALL_BACK) &&
            x.asignedAgent == null &&
            _this.getAvailableAgents(x.agents, IAgentState.IDLE).length > 0
          );
        });

        if (voiceMailToCall) {
          /** Get available agents */
          let agents = _this.getAvailableAgents(
            voiceMailToCall.agents,
            IAgentState.IDLE
          );

          if (agents && agents.length > 0) {
            /** Chose random agent from available ones */
            let agent = utils.randomObjFromArray(agents);
            /** Set agent Busy */
            agent.details.state = IAgentState.BUSY;
            /** Assign VoiceMail to Agent */
            voiceMailToCall.asignedAgent = agent;
            /** Start Time for Call*/
            let timeStart = new Date();
            /** Make call back to consumer */
            _this.newOutboundCall(voiceMailToCall).then(voiceMail => {
              /** End call */
              _this.endCall(agent, voiceMail.consumer, timeStart, voiceMail);
            });
          }
        }
      }

      this.endAndReport(workerInterval);
    }, 100);
  }

  public newOutboundCall(voiceMailToCall: VoiceMail): Promise<VoiceMail> {
    /** Call socket */
    var newOpenCall = new Promise<VoiceMail>(resolve => {
      setTimeout(() => {
        /** Handler for end call */
        resolve(voiceMailToCall);
      }, utils.randomNumberInterval(this.params.minVoiceMailCallSleep, this.params.maxVoiceMailCallSleep));
    });
    return newOpenCall;
  }

  public endCall(
    agent: Agent,
    consumer: Consumer,
    timeStart: Date,
    voiceMail?: VoiceMail
  ) {
    // 1. update call status
    this.historyCallLog.push({
      agent,
      consumer,
      directCall: voiceMail ? false : true,
      timeStart,
      timeEnd: new Date()
    });
    // 2. update agent status
    agent.details.state = IAgentState.IDLE;
    /** 3. For voicemail handling if the call ended came from a voiceMail */
    if (voiceMail) {
      /** Update voicemail status and assigned agent */
      voiceMail.updateVoiceMail({
        status: IVoiceMailStatus.DONE,
        asignedAgent: agent
      });
      /** Add to historyQueue resolved voiceMail */
      this.historyVoiceMailQueue.push(voiceMail);
      /** Remove from voiceMailQueues voiceMails resolved */
      this.voiceMailQueues = this.voiceMailQueues.filter(
        x => x.id != voiceMail.id
      );
    }
  }

  public endAndReport(intervalName: NodeJS.Timeout) {
    if (
      this.voiceMailQueues.length == 0 &&
      this.historyVoiceMailQueue.length > 0 &&
      this.historyCallLog.length == this.params.noOfCalls
    ) {
      this.intervalsAwake -= 1;
      clearInterval(intervalName);

      if (this.intervalsAwake == 0) {
        console.log("END & REPORT");
        console.log("Calls recieved", this.historyCallLog.length);
        console.log("History voicemails", this.historyVoiceMailQueue.length);

        this.inMemory.agents.forEach((agent: Agent, index: number) => {
          /** Get how many calls did agent get */
          let agentCalls = this.historyCallLog.filter((x: ICallLog) => {
            return (
              x.agent.details.name == agent.details.name && x.directCall == true
            );
          });
          /** Get number of voiceMails calls for agent */
          let voiceMailCalls = this.historyVoiceMailQueue.filter(x => {
            return x.asignedAgent.details.name == agent.details.name;
          });
          /** Write Report sheet data */
          this.excel.reportSheetData(index + 2, {
            name: agent.details.name,
            noCalls: agentCalls.length,
            voiceMailsCalls: voiceMailCalls.length
          });
        });

        this.historyCallLog.forEach((call: ICallLog, index) => {
          /** Write CallLog sheet data */
          this.excel.callLogSheetData(index + 2, {
            agentName: call.agent.details.name,
            consumerPhoneNo: call.consumer.consumerData.phoneNo,
            wasDirectCall: call.directCall,
            timeStart: call.timeStart,
            timeEnd: call.timeEnd
          });
        });
        /** Save Excel */
        this.excel.saveExcel();
      }
    }
  }

  public genereateAgents(number: number): void {
    /** Generate x agents */
    for (let index = 0; index < number; index++) {
      this.inMemory.agents.push(new Agent());
      this.loggerQueue.agents.push(new Agent());
    }
  }
}

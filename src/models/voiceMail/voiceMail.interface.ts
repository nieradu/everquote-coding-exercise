import Agent from "../agent/agent";
import Consumer from "../consumer/consumer";

export interface IVoiceMail {
  id: string;
  date: Date;
  agents: Array<Agent>;
  asignedAgent: Agent;
  consumer: Consumer;
  status: IVoiceMailStatus;
  lastTimeCalled: Date;
  consumerAnswered: Boolean;
}

export interface IUpdateVoiceMail {
  status?: IVoiceMailStatus;
  lastTimeCalled?: Date;
  consumerAnswered?: Boolean;
  asignedAgent?: Agent;
}

export enum IVoiceMailStatus {
  DONE = 1,
  CALL_BACK = 2,
  NEW = 3
}

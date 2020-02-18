import Agent from "../agent/agent.model";
import Consumer from "../consumer/consumer";

export interface IVoiceMail {
  date: Date;
  agents: Array<Agent>;
  consumer: Consumer;
  status: IVoiceMailStatus;
  lastTimeCalled: Date;
  consumerAnswered: Boolean;
}

export enum IVoiceMailStatus {
  DONE = 1,
  CALL_BACK = 2,
  NEW = 3
}

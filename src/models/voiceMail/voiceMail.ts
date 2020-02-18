import Agent from "../agent/agent.model";
import Consumer from "../consumer/consumer";
import { IVoiceMail, IVoiceMailStatus } from "./voiceMail.interface";

export class VoiceMail implements IVoiceMail {
  public date: Date;
  public agents: Array<Agent>;
  public consumer: Consumer;
  public status: IVoiceMailStatus;
  public lastTimeCalled: Date;
  public consumerAnswered: Boolean;

  constructor(private agentsArray: Agent[], private consumerData: Consumer) {
    this.date = new Date();
    this.agents = this.agentsArray;
    this.consumer = this.consumerData;
    this.status = IVoiceMailStatus.NEW;
    this.lastTimeCalled = null;
    this.consumerAnswered = null;
  }

  private matchAgentToConsumer() {}

  public setStatus(status: IVoiceMailStatus) {
    this.status = status;
  }
}

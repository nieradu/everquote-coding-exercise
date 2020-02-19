import Agent from "../agent/agent";
import Consumer from "../consumer/consumer";
import {
  IVoiceMail,
  IVoiceMailStatus,
  IUpdateVoiceMail
} from "./voiceMail.interface";
import * as utils from "../../utils/utils";

export class VoiceMail implements IVoiceMail {
  public id: string;
  public date: Date;
  public agents: Array<Agent>;
  public asignedAgent: Agent;
  public consumer: Consumer;
  public status: IVoiceMailStatus;
  public lastTimeCalled: Date;
  public consumerAnswered: Boolean;

  constructor(private agentsArray: Agent[], private consumerData: Consumer) {
    this.id = utils.randomString();
    this.date = new Date();
    this.agents = this.agentsArray;
    this.asignedAgent = null;
    this.consumer = this.consumerData;
    this.status = IVoiceMailStatus.NEW;
    this.lastTimeCalled = null;
    this.consumerAnswered = null;
  }

  public updateVoiceMail(obj: IUpdateVoiceMail) {
    if (obj.status) this.status = obj.status;

    if (obj.lastTimeCalled) this.lastTimeCalled = obj.lastTimeCalled;

    if (obj.consumerAnswered) this.consumerAnswered = obj.consumerAnswered;

    if (obj.asignedAgent) this.asignedAgent = obj.asignedAgent;
  }
}

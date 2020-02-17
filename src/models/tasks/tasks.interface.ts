import { IConsumer } from "../consumer/consumer.interface";
import { IAgent } from "../agent/agent.interface";

export interface ITask {
  date: Date;
  agents: Array<IAgent>;
  consumer: IConsumer;
  status: Boolean;
  lastTimeCalled: Date;
  answered: Boolean;
}

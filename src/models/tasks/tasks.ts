import { IAgent } from "../agent/agent.interface";
import { IConsumer } from "../consumer/consumer.interface";
import { ITask } from "./tasks.interface";

export class Tasks {
  constructor(public agents: IAgent[], public consumer: IConsumer) {}

  private matchAgentToConsumer() {}
}

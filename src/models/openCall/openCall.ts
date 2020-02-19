import Agent from "../agent/agent";
import Consumer from "../consumer/consumer";

export class OpenCall {
  constructor(private agent: Agent, private consumer: Consumer) {}
}

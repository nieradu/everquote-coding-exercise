import { IAgent } from "./agent.interface";
import { EState, EStatus } from "../consumer/consumer.interface";

export default class Agent {
  constructor(public details: IAgent) {}
}

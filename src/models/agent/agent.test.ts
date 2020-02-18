import Agent from "./agent.model";
import { EState, EStatus } from "../consumer/consumer.interface";
import { IAgentState, IAgent } from "./agent.interface";

describe("Agent tests", () => {
  var agent: any = new Agent({
    name: "Test",
    minAgeInterval: 18,
    maxAgeInterval: 49,
    stateHandle: [EState.MARRIED, EState.DIVORCED],
    statusHandle: [EStatus.OWN, EStatus.RENT],
    minNumberOfKids: 0,
    maxNumberOfKids: 5,
    minNumberOfCars: 0,
    maxNumberOfCars: 5,
    minHouseholdIncome: 0,
    maxHouseholdIncome: 5000,
    state: IAgentState.OFFLINE
  });

  it("Should be able to create an Agent", () => {
    expect(agent).toBeDefined();
  });
  it("Should be offline", () => {
    expect(agent.details.state).toBe(IAgentState.OFFLINE);
  });
});

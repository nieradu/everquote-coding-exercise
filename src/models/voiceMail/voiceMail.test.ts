import { VoiceMail } from "./voiceMail";
import Agent from "../agent/agent";
import { IAgentState } from "../agent/agent.interface";
import Consumer from "../consumer/consumer";
import { EState, EStatus } from "../consumer/consumer.interface";
import { IVoiceMailStatus } from "./voiceMail.interface";

describe("VoiceMail group", () => {
  let agents: Array<Agent>;
  let consumer: Consumer;

  agents = [
    new Agent({
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
      state: IAgentState.IDLE
    })
  ];

  consumer = new Consumer({
    age: 30,
    householdIncome: 0,
    noOfCars: 1,
    noOfChildren: 0,
    objectStatus: EStatus.OWN,
    state: EState.SINGLE,
    phoneNo: "0799999999"
  });
  let task = new VoiceMail(agents, consumer);

  it("Should have property status", () => {
    expect(task.status).toBeDefined();
  });

  it("Should have default property status of NEW", () => {
    expect(task.status).toBe(IVoiceMailStatus.NEW);
  });

  it("Should move task status to done", () => {
    task.updateVoiceMail({ status: IVoiceMailStatus.DONE });
    expect(task).toHaveProperty("status", IVoiceMailStatus.DONE);
  });
});

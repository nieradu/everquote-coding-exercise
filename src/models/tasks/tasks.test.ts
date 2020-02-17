import { Tasks } from "./tasks";
import { IAgent } from "../agent/agent.interface";
import { IConsumer } from "../consumer/consumer.interface";

describe("Tasks group", () => {
  let agents: IAgent[];
  let consumer: IConsumer;

  let task = new Tasks(agents, consumer);

  it("should behave...", () => {
    expect(true).toBe(true);
  });
});

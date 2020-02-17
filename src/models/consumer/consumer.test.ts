import Consumer from "./consumer.model";
import * as IConsumerAttributes from "./consumer.interface";

describe("Insurance Call Center", () => {
  var consumer = new Consumer({
    age: 30,
    householdIncome: 0,
    noOfCars: 1,
    noOfChildren: 0,
    objectStatus: IConsumerAttributes.EStatus.OWN,
    state: IConsumerAttributes.EState.SINGLE,
    phoneNo: "0799999999"
  });
  it("Should be able to create a consumer", () => {
    expect(consumer).toBeDefined();
  });
  it("Customer sould be 30 years old", () => {
    expect(consumer.consumerData.age).toBe(30);
  });
});

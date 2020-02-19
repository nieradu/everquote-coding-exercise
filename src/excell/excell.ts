import Consumer from "../models/consumer/consumer";
import Agent from "../models/agent/agent";

var excel = require("excel4node");

export class Excel {
  public workbook: any;
  public consumersSheet: any;
  public agentsSheet: any;
  public reportSheet: any;

  constructor(private reference: number) {
    // Create a new instance of a Workbook class
    this.workbook = new excel.Workbook();
    // Add Worksheets to the workbook
    this.consumersSheet = this.workbook.addWorksheet("Consumers");
    this.agentsSheet = this.workbook.addWorksheet("Agents");
    this.reportSheet = this.workbook.addWorksheet("Report");
  }

  public consumerSheetData(index: number, consumer: Consumer) {
    /** Header row */
    this.consumersSheet.cell(1, 1).string("PhoneNo");
    this.consumersSheet.cell(1, 2).string("Age");
    this.consumersSheet.cell(1, 3).string("State");
    this.consumersSheet.cell(1, 4).string("No. Kids");
    this.consumersSheet.cell(1, 5).string("No. Cars");
    this.consumersSheet.cell(1, 6).string("Household Income");
    this.consumersSheet.cell(1, 7).string("Object status");
    /** Content */
    this.consumersSheet
      .cell(-index + this.reference, 1)
      .string(consumer.consumerData.phoneNo.toString());
    this.consumersSheet
      .cell(-index + this.reference, 2)
      .string(consumer.consumerData.age.toString());
    this.consumersSheet
      .cell(-index + this.reference, 3)
      .string(consumer.consumerData.state);
    this.consumersSheet
      .cell(-index + this.reference, 4)
      .string(consumer.consumerData.noOfChildren.toString());
    this.consumersSheet
      .cell(-index + this.reference, 5)
      .string(consumer.consumerData.noOfCars.toString());
    this.consumersSheet
      .cell(-index + this.reference, 6)
      .string(consumer.consumerData.householdIncome.toString());
    this.consumersSheet
      .cell(-index + this.reference, 7)
      .string(consumer.consumerData.objectStatus);
  }

  public agentSheetData(index: number, agent: Agent) {
    /** Header row */
    this.agentsSheet.cell(1, 1).string("name");
    this.agentsSheet.cell(1, 2).string("minAgeInterval");
    this.agentsSheet.cell(1, 3).string("maxAgeInterval");
    this.agentsSheet.cell(1, 4).string("stateHandle");
    this.agentsSheet.cell(1, 5).string("minNumberOfKids");
    this.agentsSheet.cell(1, 6).string("maxNumberOfKids");
    this.agentsSheet.cell(1, 7).string("minNumberOfCars");
    this.agentsSheet.cell(1, 8).string("maxNumberOfCars");
    this.agentsSheet.cell(1, 9).string("statusHandle");
    this.agentsSheet.cell(1, 10).string("minHouseholdIncome");
    this.agentsSheet.cell(1, 11).string("maxHouseholdIncome");
    this.agentsSheet.cell(1, 12).string("state");
    /** Content */
    this.agentsSheet.cell(index, 1).string(agent.details.name.toString());
    this.agentsSheet
      .cell(index, 2)
      .string(agent.details.minAgeInterval.toString());
    this.agentsSheet
      .cell(index, 3)
      .string(agent.details.maxAgeInterval.toString());
    this.agentsSheet.cell(index, 4).string(agent.details.stateHandle);
    this.agentsSheet
      .cell(index, 5)
      .string(agent.details.minNumberOfKids.toString());
    this.agentsSheet
      .cell(index, 6)
      .string(agent.details.maxNumberOfKids.toString());
    this.agentsSheet
      .cell(index, 7)
      .string(agent.details.minNumberOfCars.toString());
    this.agentsSheet
      .cell(index, 8)
      .string(agent.details.maxNumberOfCars.toString());
    this.agentsSheet.cell(index, 9).string(agent.details.statusHandle);
    this.agentsSheet
      .cell(index, 10)
      .string(agent.details.minHouseholdIncome.toString());
    this.agentsSheet
      .cell(index, 11)
      .string(agent.details.maxHouseholdIncome.toString());
    this.agentsSheet.cell(index, 12).string(agent.details.state);
  }

  public saveExcel(name: string) {
    this.workbook.write(`${name}.xlsx`);
  }
}

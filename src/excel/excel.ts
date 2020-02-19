import Consumer from "../models/consumer/consumer";
import Agent from "../models/agent/agent";
import { VoiceMail } from "../models/voiceMail/voiceMail";

var excel = require("excel4node");

export interface Report {
  agent: Agent;
  noVoiceMail: number;
  noCalls: number;
}

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

    this.consumerSheetHeader();
    this.agentSheetHeader();
    this.reportSheetHeader();
  }

  public consumerSheetHeader() {
    /** Header row */
    this.consumersSheet.cell(1, 1).string("PhoneNo");
    this.consumersSheet.cell(1, 2).string("Age");
    this.consumersSheet.cell(1, 3).string("State");
    this.consumersSheet.cell(1, 4).string("No. Kids");
    this.consumersSheet.cell(1, 5).string("No. Cars");
    this.consumersSheet.cell(1, 6).string("Household Income");
    this.consumersSheet.cell(1, 7).string("Object status");
  }

  public agentSheetHeader() {
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
  }

  public reportSheetHeader() {
    /** Header row */
    this.agentsSheet.cell(1, 1).string("Agent Name");
    this.agentsSheet.cell(1, 2).string("No. Voicemails");
    this.agentsSheet.cell(1, 3).string("No. Calls");
  }

  public reportSheetData(rowNo: number, report: Report) {
    this.agentsSheet.cell(rowNo, 1).string(report.agent.details.name);
    this.agentsSheet.cell(rowNo, 2).string(report.noVoiceMail.toString());
    this.agentsSheet.cell(rowNo, 3).string(report.noCalls.toString());
  }

  public consumerSheetData(rowNo: number, consumer: Consumer) {
    /** Content */
    this.consumersSheet
      .cell(rowNo, 1)
      .string(consumer.consumerData.phoneNo.toString());
    this.consumersSheet
      .cell(rowNo, 2)
      .string(consumer.consumerData.age.toString());
    this.consumersSheet.cell(rowNo, 3).string(consumer.consumerData.state);
    this.consumersSheet
      .cell(rowNo, 4)
      .string(consumer.consumerData.noOfChildren.toString());
    this.consumersSheet
      .cell(rowNo, 5)
      .string(consumer.consumerData.noOfCars.toString());
    this.consumersSheet
      .cell(rowNo, 6)
      .string(consumer.consumerData.householdIncome.toString());
    this.consumersSheet
      .cell(rowNo, 7)
      .string(consumer.consumerData.objectStatus);
  }

  public agentSheetData(rowNo: number, agent: Agent) {
    /** Content */
    this.agentsSheet.cell(rowNo, 1).string(agent.details.name.toString());
    this.agentsSheet
      .cell(rowNo, 2)
      .string(agent.details.minAgeInterval.toString());
    this.agentsSheet
      .cell(rowNo, 3)
      .string(agent.details.maxAgeInterval.toString());
    this.agentsSheet.cell(rowNo, 4).string(agent.details.stateHandle);
    this.agentsSheet
      .cell(rowNo, 5)
      .string(agent.details.minNumberOfKids.toString());
    this.agentsSheet
      .cell(rowNo, 6)
      .string(agent.details.maxNumberOfKids.toString());
    this.agentsSheet
      .cell(rowNo, 7)
      .string(agent.details.minNumberOfCars.toString());
    this.agentsSheet
      .cell(rowNo, 8)
      .string(agent.details.maxNumberOfCars.toString());
    this.agentsSheet.cell(rowNo, 9).string(agent.details.statusHandle);
    this.agentsSheet
      .cell(rowNo, 10)
      .string(agent.details.minHouseholdIncome.toString());
    this.agentsSheet
      .cell(rowNo, 11)
      .string(agent.details.maxHouseholdIncome.toString());
    this.agentsSheet.cell(rowNo, 12).string(agent.details.state.toString());
  }

  public saveExcel(name: string) {
    this.workbook.write(`${name}.xlsx`);
  }
}

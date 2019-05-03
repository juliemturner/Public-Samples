import * as React from 'react';
import styles from './ExcelGraph.module.scss';

import * as lodash from "lodash";
import { Item, Worksheet, Tables, HelpDeskRequest } from '../Models';
import { MSGraphClient } from '@microsoft/sp-http';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { sp } from "@pnp/sp";

export interface IExcelGraphProps {
  httpGraph: MSGraphClient;
  siteId: string;
  libraryId: string;
  itRequestsId: string;
}

export interface IExcelGraphState {
  persistant: boolean;
  sessionId: string;
  driveItems: Item[];
  currentItem: Item;
  worksheets: Worksheet[];
  currentSheet: Worksheet;
  renameValue: string;
  renameSheet: boolean;
  addSheetValue: string;
  addSheet: boolean;
  itData: HelpDeskRequest[];
  addData: boolean;
  dateFormat: string;
  formatDates: boolean;
  createTable: boolean;
  getTables: boolean;
  tables: Tables[];
  addColumn: boolean;
  newRowValue: HelpDeskRequest;
  addRow: boolean;
  chartTypeValue: string;
  createChart: boolean;
  grandTotal: number;
  redQty: number;
  blueQty: number;
  yellowQty: number;
}

export class ExcelGraphState implements IExcelGraphState {
  constructor(
    public driveItems: Item[] = [],
    public currentItem: Item = null,
    public persistant: boolean = false,
    public sessionId: string = "",
    public worksheets: Worksheet[] = [],
    public currentSheet: Worksheet = null,
    public renameValue: string = "",
    public renameSheet: boolean = false,
    public addSheetValue: string = "",
    public addSheet: boolean = false,
    public itData: HelpDeskRequest[] = [],
    public addData: boolean = false,
    public dateFormat: string = "",
    public formatDates: boolean = false,
    public createTable: boolean = false,
    public getTables: boolean = false,
    public tables: Tables[] = [],
    public addColumn: boolean = false,
    public newRowValue: HelpDeskRequest = new HelpDeskRequest(),
    public addRow: boolean = false,
    public chartTypeValue: string = "",
    public createChart: boolean = false,
    public grandTotal: number = null,
    public redQty: number = 0,
    public blueQty: number = 0,
    public yellowQty: number = 0
  ) { }
}

export default class ExcelGraph extends React.Component<IExcelGraphProps, IExcelGraphState> {
  private timer;

  constructor(props) {
    super(props);
    this.state = new ExcelGraphState();
    this.timer = setInterval(this.refreshSession, 300000);
  }

  public shouldComponentUpdate(nextProps: Readonly<IExcelGraphProps>, nextState: Readonly<IExcelGraphState>) {
    if ((lodash.isEqual(nextState, this.state) && lodash.isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public componentDidMount() {
    this.getDriveItems();
  }

  private getDriveItems = async (): Promise<void> => {
    try {
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items`)
        .get();
      let items: Item[] = [];
      let data = result.value;
      for (let i: number = 0; i < data.length; i++) {
        let item: Item = new Item();
        item.id = data[i].id;
        item.webUrl = data[i].webUrl;
        let tmp = data[i].webUrl.split("/");
        item.name = tmp[tmp.length - 1];
        items.push(item);
      }
      this.setState({ driveItems: items });
    } catch (err) {
      console.log(err);
    }
    return;
  }

  private selectDriveItem = async (item: Item): Promise<void> => {
    this.setState({ currentItem: item },
      async () => {
        await this.getSession();
        await this.getWorksheets();
      });
    return;
  }

  private getSession = async (persistChanges: string = "true"): Promise<boolean> => {
    let retVal: boolean = false;
    try {
      let data: any = {
        "persistChanges": persistChanges
      };

      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/createSession`)
        .post(data);

      this.setState({ sessionId: result.id });
      retVal = true;
    } catch (err) {
      console.log(err);
    }
    return retVal;
  }

  private refreshSession = async (): Promise<void> => {
    try {
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/refreshSession`)
        .header("workbook-session-id", this.state.sessionId)
        .post({});
      console.log("REFRESHED SESSION: " + this.state.sessionId);
    } catch (err) {
      console.log(err);
    }
    return;
  }

  private closeSession = async (): Promise<boolean> => {
    let retVal: boolean = false;
    try {
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/closeSession`)
        .header("workbook-session-id", this.state.sessionId)
        .post({});

    } catch (err) {
      console.log(err);
    }
    return retVal;
  }

  private getWorksheets = async () => {
    try {
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/worksheets`)
        .header("workbook-session-id", this.state.sessionId)
        .get();
      let items: Worksheet[] = [];
      let data = result.value;
      for (let i: number = 0; i < data.length; i++) {
        let item: Worksheet = new Worksheet();
        item.id = data[i].id;
        item.name = data[i].name;
        item.position = data[i].position;
        item.visibility = data[i].visibility;
        items.push(item);
      }
      this.setState({ worksheets: items });
    } catch (err) {
      console.log(err);
    }
    return;
  }

  private renameSheet = async (): Promise<void> => {
    let retVal: boolean = false;
    try {
      let renameSheetValue = document.getElementById("RenameSheetValue");

      let data: any = {
        "name": this.state.renameValue
      };

      //Get the original sheet... could obviously get a particular worksheet.
      let worksheetId: string = this.state.worksheets[0].id;

      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/worksheets/${worksheetId}`)
        .header("workbook-session-id", this.state.sessionId)
        .header("method", "PATCH")
        .patch(data);

      await this.getWorksheets();

    } catch (err) {
      console.log(err);
    }
    this.setState({ renameSheet: retVal });
    return;
  }

  private addSheet = async (): Promise<void> => {
    let retVal: boolean = false;
    try {
      let data: any = {
        "name": this.state.addSheetValue
      };


      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/worksheets/add`)
        .header("workbook-session-id", this.state.sessionId)
        .post(data);

      await this.getWorksheets();
      retVal = true;
    } catch (err) {
      console.log(err);
    }
    this.setState({ addSheet: retVal });
    return;
  }

  private getHelpDeskRequests = async (): Promise<boolean> => {
    let retVal: boolean = false;
    try {
      let data = await sp.web
        .lists.getByTitle("IT Requests")
        .items.select("ID,Title,BusinessUnit,Category,Status,DueDate,AssignedTo/Title")
        .expand("AssignedTo")
        .top(5000)
        .get<[{ Id: string, Title: string, BusinessUnit: string, Category: string, Status: string, DueDate: string, AssignedTo: { Title: string } }]>();

      let itData: HelpDeskRequest[] = [];
      for (let i: number = 0; i < data.length; i++) {
        let item: HelpDeskRequest = new HelpDeskRequest();
        item.id = data[i].Id;
        item.title = data[i].Title;
        item.status = data[i].Status;
        item.businessUnit = data[i].BusinessUnit;
        item.category = data[i].Category;
        if (data[i].DueDate != undefined)
          item.dueDate = new Date(data[i].DueDate);
        if (data[i].AssignedTo != undefined)
          item.assignedTo = data[i].AssignedTo.Title;
        itData.push(item);
      }
      this.setState({ itData: itData });
      retVal = true;
    } catch (err) {
      console.log(err);
    }
    return retVal;
  }

  private addDataSheet = async () => {
    let retVal: boolean = false;
    try {
      let itDataRetrieved = await this.getHelpDeskRequests();
      if (itDataRetrieved) {
        let data: any = {
          "values": [["Id", "Title", "Status", "Business Unit", "Category", "Due Date", "Assigned To"]]
        };
        let items = this.state.itData;
        for (let i: number = 0; i < items.length; i++) {
          var dateValue: string = null;
          if (items[i].dueDate) {
            dateValue = (items[i].dueDate.getMonth() + 1) + "/" + (items[i].dueDate.getDate()) + "/" + (items[i].dueDate.getFullYear());
          }
          data.values.push([items[i].id, items[i].title, items[i].status, items[i].businessUnit, items[i].category, dateValue, items[i].assignedTo]);
        }

        let range: string = "A1:G" + data.values.length.toString();
        //Hard coded to 2nd worksheet
        let worksheetId: string = this.state.worksheets[1].id;
        //worksheetId = worksheetId.replace('{','').replace('}','');
        let result = await this.props.httpGraph
          .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/worksheets('${worksheetId}')/range(address='${range}')`)
          .header("workbook-session-id", this.state.sessionId)
          .patch(data);

        retVal = true;
      }
    } catch (err) {
      console.log(err);
    }
    this.setState({ addData: retVal });
    return;
  }

  private formatDates = async () => {
    let retVal: boolean = false;
    try {
      let range: string = "A2:G" + (this.state.itData.length + 1).toString();

      let data: any = {
        "numberFormat": []
      };

      for (let i: number = 0; i < this.state.itData.length; i++) {
        data.numberFormat.push([null, null, null, null, null, this.state.dateFormat, null]);
      }
      //Hard coded to 2nd worksheet
      let worksheetId: string = this.state.worksheets[1].id;
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/worksheets('${worksheetId}')/range(address='${range}')`)
        .header("workbook-session-id", this.state.sessionId)
        .patch(data);

      retVal = true;
    } catch (err) {
      console.log(err);
    }
    this.setState({ formatDates: retVal });
    return;
  }

  private createTable = async () => {
    let retVal: boolean = false;
    try {
      let range: string = "A1:G" + (this.state.itData.length + 1).toString();

      //Hard coded to 2nd worksheet
      let worksheetId: string = this.state.worksheets[1].name;

      let data: any = {
        "address": worksheetId + "!" + range,
        "hasHeaders": true
      };

      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/tables/add`)
        .header("workbook-session-id", this.state.sessionId)
        .post(data);

      retVal = true;
    } catch (err) {
      console.log(err);
    }
    this.setState({ createTable: retVal });
    return;
  }

  private getTables = async () => {
    try {
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/tables`)
        .header("workbook-session-id", this.state.sessionId)
        .get();

      let retVal: Tables[] = [];
      let data = result.value;
      for (let i: number = 0; i < data.length; i++) {
        let item: Tables = new Tables();
        item.highlightFirstColumn = data[i].highlightFirstColumn;
        item.highlightLastColumn = data[i].highlightLastColumn;
        item.id = data[i].id;
        item.name = data[i].name;
        item.showBandedColumns = data[i].showBandedColumns;
        item.showBandedRows = data[i].showBandedRows;
        item.showFilterButton = data[i].showFilterButton;
        item.showHeaders = data[i].showHeaders;
        item.showTotals = data[i].showTotals;
        item.style = data[i].style;
        retVal.push(item);
      }
      this.setState({ tables: retVal });
    } catch (err) {
      console.log(err);
    }
    return;
  }

  private addColumn = async () => {
    let retVal: boolean = false;
    try {
      let range: string = "H1:H" + (this.state.itData.length + 1).toString();

      let data: any = {
        "values": [["Weekday"]],
        "formulas": [[null]]
      };

      for (let i: number = 0; i < this.state.itData.length; i++) {
        data.values.push([null]);
        data.formulas.push(["=CHOOSE(WEEKDAY(F" + (i + 2) + "),\"Sunday\",\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\",\"Saturday\")"]);
      }

      //Hard coded to 2nd worksheet
      let worksheetId: string = this.state.worksheets[1].id;
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/worksheets('${worksheetId}')/range(address='${range}')`)
        .header("workbook-session-id", this.state.sessionId)
        .patch(data);

      retVal = true;
    } catch (err) {
      console.log(err);
    }
    this.setState({ addColumn: retVal });
    return;
  }

  private addRow = async () => {
    let retVal: boolean = false;
    try {
      let newRow = this.state.newRowValue;
      let data: any = {
        "index": 0,
        "values": [[newRow.id, newRow.title, newRow.status, newRow.businessUnit, newRow.category, (newRow.dueDate.getMonth() + 1) + "/" + (newRow.dueDate.getDate()) + "/" + (newRow.dueDate.getFullYear()), newRow.assignedTo, null]],
        "formulas": []
      };

      //Hard coded to 2nd worksheet
      let tableId: string = this.state.tables[0].id;
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/tables/${tableId}/rows/add`)
        .header("workbook-session-id", this.state.sessionId)
        .post(data);

      retVal = true;
    } catch (err) {
      console.log(err);
    }
    this.setState({ addRow: retVal });
    return;
  }

  private createChartTable = async (): Promise<string> => {
    let retVal: string = "";
    try {
      let data: any = {
        "values": [["Business Unit", "Incident Count"]]
      };

      let items = this.state.itData;
      var buRequests: any = [];

      for (let i: number = 0; i < items.length; i++) {
        let found: number = -1;
        var bu = items[i].businessUnit;
        for (let j: number = 0; j < buRequests.length; j++) {
          if (buRequests[j].businessunit == bu) {
            found = j;
            break;
          }
        }
        if (found === -1)
          buRequests.push({ businessunit: bu, count: 1 });
        else
          buRequests[found].count++;
      }

      let range: string = "J1:K" + (buRequests.length + 1).toString();

      for (let i: number = 0; i < buRequests.length; i++) {
        data.values.push([buRequests[i].businessunit, buRequests[i].count]);
      }

      //Hard coded to 2nd worksheet
      let worksheetId: string = this.state.worksheets[1].id;
      let worksheetAddress: string = `${this.state.worksheets[1].name}!${range}`;
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/worksheets('${worksheetId}')/range(address='${range}')`)
        .header("workbook-session-id", this.state.sessionId)
        .patch(data);

      //Add range as table
      let dataTable: any = {
        "address": worksheetAddress,
        "hasHeaders": true
      };
      let resultTable = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/tables/add`)
        .header("workbook-session-id", this.state.sessionId)
        .post(dataTable);

      retVal = worksheetAddress;
    } catch (err) {
      console.log(err);
    }
    return retVal;
  }

  private createChart = async () => {

    let retVal: boolean = false;
    try {

      let sourceData = await this.createChartTable();
      if (sourceData !== "") {
        let data: any = {
          "type": this.state.chartTypeValue,
          "sourceData": sourceData,
          "seriesBy": "Auto"
        };

        //Hard coded to first worksheet
        let worksheetId: string = this.state.worksheets[0].id;
        let result = await this.props.httpGraph
          .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/worksheets('${worksheetId}')/charts/add`)
          .header("workbook-session-id", this.state.sessionId)
          .post(data);

        retVal = true;
      }
    } catch (err) {
      console.log(err);
    }
    this.setState({ createChart: retVal });
    return;
  }

  private updateNamedItemValue = async (namedItem: string, value: string): Promise<boolean> => {
    try {
      let data: any = {
        "values": [[value]]
      };

      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/names('${namedItem}')/range`)
        .header("workbook-session-id", this.state.sessionId)
        .patch(data);

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  private getNamedItemValue = async (namedItem: string): Promise<any> => {
    try {
      let result = await this.props.httpGraph
        .api(`sites/${this.props.siteId}/lists/${this.props.libraryId}/items/${this.state.currentItem.id}/driveItem/workbook/names('${namedItem}')/range`)
        .header("workbook-session-id", this.state.sessionId)
        .get();

      return result.values[0];
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  private getGrandTotal = async () => {
    let result: boolean = false;
    result = await this.getSession("false");
    result = await this.updateNamedItemValue("RedQty", this.state.redQty.toString());
    result = await this.updateNamedItemValue("BlueQty", this.state.blueQty.toString());
    result = await this.updateNamedItemValue("YellowQty", this.state.yellowQty.toString());
    let grandTotal = await this.getNamedItemValue("GrandTotal");
    this.setState({
      grandTotal: grandTotal
    });
  }

  private setValue = (property: string, value: any): void => {
    let state = {};
    state[property] = value;
    this.setState(state);
  }

  private setRow = (property: string, value: any): void => {
    let newRowValue = lodash.clone(this.state.newRowValue);
    newRowValue[property] = value;
    this.setState({ newRowValue: newRowValue });
  }

  public render(): React.ReactElement<IExcelGraphProps> {
    return (
      <div className={styles.excelGraph}>
        <h1>Working with Excel using Microsoft Graph</h1>
        <div>Persistant Session:
        <input type="checkbox" checked={this.state.persistant} onChange={() => { this.setState({ persistant: !this.state.persistant }); }} />
        </div>
        <div className="sectionTitle">Select a file:</div>
        <ul className="fileList">
          {this.state.driveItems && this.state.driveItems.length > 0 && this.state.driveItems.map((di: Item) => {
            return (
              <li className={styles.driveItem} onClick={() => this.selectDriveItem(di)}>
                {this.state.currentItem && (this.state.currentItem.id === di.id) &&
                  <Icon iconName="CompletedSolid" className={styles.success} />
                }
                <span> {di.name}</span>
              </li>
            );
          })
          }
        </ul>
        {!this.state.persistant &&
          <div>
            <div className="sectionTitle">
              <span>Get Worksheets: </span>
              {this.state.worksheets && this.state.worksheets.length < 1 &&
                <Icon iconName="Completed" />
              }
              {this.state.worksheets && this.state.worksheets.length > 0 &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            {this.state.worksheets && this.state.worksheets.length > 0 &&
              <table>
                <thead>
                  <tr>
                    <th colSpan={4}>Worksheets Currently in Workbook</th>
                  </tr>
                  <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Visibility</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.worksheets.map((ws) => {
                    return (
                      <tr>
                        <td>{ws.id}</td>
                        <td>{ws.name}</td>
                        <td>{ws.position}</td>
                        <td>{ws.visibility}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            }
            <div className="sectionTitle">
              <span>Rename Sheet: </span>
              {!this.state.renameSheet && [
                <input type="text" placeholder="New name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setValue("renameValue", e.currentTarget.value)} />,
                <button onClick={this.renameSheet}>Rename Sheet</button>
              ]}
              {this.state.renameSheet &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            <div className="sectionTitle">
              <span>Add New Sheet: </span>
              {!this.state.addSheet && [
                <input type="text" placeholder="New sheet" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setValue("addSheetValue", e.currentTarget.value)} />,
                <button onClick={this.addSheet}>Add Sheet</button>
              ]}
              {this.state.addSheet &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            <div className="sectionTitle">
              <span>Add Data to Worksheet (uses second sheet): </span>
              {!this.state.addData &&
                <button onClick={this.addDataSheet}>Add Data</button>
              }
              {this.state.addData &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            <div className="sectionTitle">
              <span>Format Dates (uses second sheet): </span>
              {!this.state.formatDates && [
                <input type="text" placeholder="Date Format" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setValue("dateFormat", e.currentTarget.value)} />,
                <button onClick={this.formatDates}>Format</button>
              ]}
              {this.state.formatDates &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            <div className="sectionTitle">
              <span>Create Table: </span>
              {!this.state.createTable &&
                <button onClick={this.createTable}>Create</button>
              }
              {this.state.createTable &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            <div className="sectionTitle">
              <span>Get/Refresh Tables: </span>
              {!this.state.getTables &&
                <button onClick={this.getTables}>Get</button>
              }
              {this.state.getTables &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            {this.state.tables && this.state.tables.length > 0 &&
              <table>
                <thead>
                  <tr>
                    <th colSpan={2}>Tables Currently in 'Workbook'</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.tables.map((t) => {
                    return (
                      [
                        <tr>
                          <td>highlightFirstColumn: </td>
                          <td>{t.highlightFirstColumn.toString()}</td>
                        </tr>,
                        <tr>
                          <td>highlightLastColumn: </td>
                          <td>{t.highlightLastColumn.toString()}</td>
                        </tr>,
                        <tr>
                          <td>Id: </td>
                          <td>{t.id}</td>
                        </tr>,
                        <tr>
                          <td>Name: </td>
                          <td>{t.name}</td>
                        </tr>,
                        <tr>
                          <td>showBandedColumns: </td>
                          <td>{t.showBandedColumns.toString()}</td>
                        </tr>,
                        <tr>
                          <td>showBandedRows: </td>
                          <td>{t.showBandedRows.toString()}</td>
                        </tr>,
                        <tr>
                          <td>showFilterButton: </td>
                          <td>{t.showFilterButton.toString()}</td>
                        </tr>,
                        <tr>
                          <td>showHeaders: </td>
                          <td>{t.showHeaders.toString()}</td>
                        </tr>,
                        <tr>
                          <td>showTotals: </td>
                          <td>{t.showTotals.toString()}</td>
                        </tr>,
                        <tr>
                          <td>style: </td>
                          <td>{t.style}</td>
                        </tr>
                      ]
                    );
                  })
                  }
                </tbody>
              </table>
            }
            <div className="sectionTitle">
              <span>Create Day of Week Column: </span>
              {!this.state.addColumn &&
                <button onClick={this.addColumn}>Get</button>
              }
              {this.state.addColumn &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            <div className="sectionTitle">
              <span>Create New Row in Table: </span>
              {!this.state.addRow &&
                <button onClick={this.addRow}>Add</button>
              }
              {this.state.addRow &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>

            <table>
              <tr>
                <td style={{ width: "90px" }}>Id:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setRow("id", e.currentTarget.value)} /></td>
              </tr>
              <tr>
                <td>Title:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setRow("title", e.currentTarget.value)} /></td>
              </tr>
              <tr>
                <td>Status:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setRow("status", e.currentTarget.value)} /></td>
              </tr>
              <tr>
                <td>Due Date:</td>
                <td><input type="date" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setRow("dueDate", new Date(e.currentTarget.value))} /></td>
              </tr>
              <tr>
                <td>Category:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setRow("category", e.currentTarget.value)} /></td>
              </tr>
              <tr>
                <td>Business Unit:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setRow("businessUnit", e.currentTarget.value)} /></td>
              </tr>
              <tr>
                <td>Assigned To:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setRow("assignedTo", e.currentTarget.value)} /></td>
              </tr>
            </table>

            <div className="sectionTitle">
              <span>Create Chart: </span>
              {!this.state.createChart && [
                <input type="text" placeholder="ColumnClustered" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setValue("chartTypeValue", e.currentTarget.value)} />,
                <button onClick={this.createChart}>Create</button>
              ]}
              {this.state.createChart &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
          </div>
        }
        {this.state.persistant &&
          <div>
            <div className="sectionTitle">
              <span>Calculate Cost for Widgets: </span>
              {!this.state.grandTotal && [
                <button onClick={this.getGrandTotal}>Get Grand Total</button>
              ]}
              {this.state.grandTotal &&
                <Icon iconName="CompletedSolid" className={styles.success} />
              }
            </div>
            <table className={styles.persistantTable}>
              <tr>
                <td>Red:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setValue("redQty", e.currentTarget.value)} /></td>
              </tr>
              <tr>
                <td>Blue:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setValue("blueQty", e.currentTarget.value)} /></td>
              </tr>
              <tr>
                <td>Yellow:</td>
                <td><input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setValue("yellowQty", e.currentTarget.value)} /></td>
              </tr>
              <tr>
                <td>Total Cost:</td>
                <td>{this.state.grandTotal}</td>
              </tr>
            </table>
          </div>
        }
      </div>
    );
  }
}

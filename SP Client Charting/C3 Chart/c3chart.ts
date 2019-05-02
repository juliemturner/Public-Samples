import * as lodash from "lodash";
import * as c3 from "c3";
import './node_modules/c3/c3.css';

export interface IDataObj {
  ID: string;
  BusinessUnit: string;
  Category: string;
  Status: string;
  DueDate: Date;
  Assigned: string;
}


export class DataObj implements IDataObj {
  constructor(
    public ID: string = null,
    public BusinessUnit: string = null,
    public Category: string = null,
    public Status: string = null,
    public DueDate: Date = null,
    public Assigned: string = null
  ) { }
}

export interface IAssignedBusinessUnits {
  BusinessUnit: string;
  Assigned: string;
  Assignments: number;
}

export class AssignedBusinessUnits implements IAssignedBusinessUnits {
  constructor(
    public BusinessUnit: string = null,
    public Assigned: string = null,
    public Assignments: number = 1
  ) { }
}

export class Init {
  private REQUESTS_LIST: string = "IT Requests";

  private _currentSite = window.location.protocol + "//" + window.location.host + window["_spPageContextInfo"]["webServerRelativeUrl"];
  private _requests: Array<DataObj> = [];

  constructor() {
    this.loadRequests();
  }

  private loadRequests = async (): Promise<void> => {
    //What Data Do We Want
    let url: string = `${this._currentSite}/_api/web/lists/getbytitle('${this.REQUESTS_LIST}')/items?$top=5000&$select=ID,BusinessUnit,Category,Status,DueDate,AssignedTo/Title&$expand=AssignedTo/Title&$filter=(Status eq 'New') or (Status eq 'Active')`;
    let request: RequestInit = {
      method: "GET",
      headers: { "Accept": "application/json; odata=verbose" }
    };

    //Request the data, and await the response
    let data = await fetch(url, request);
    let dataJson = await data.json();
    let it = dataJson["d"]["results"];
    for (let i = 0; i < it.length; i++) {
      let item = new DataObj();
      item.ID = it[i].ID;
      item.BusinessUnit = it[i].BusinessUnit;
      item.Category = it[i].Category;
      item.Status = it[i].Status;
      if (it[i].DueDate != undefined)
        item.DueDate = new Date(it[i].DueDate);
      if (it[i].AssignedTo != undefined)
        item.Assigned = it[i].AssignedTo.Title.split(" ")[0];
      this._requests.push(item);
    }
    //Data retrieved, in a model, now process
    this.chartRequestsByAssignee();
  }

  private chartRequestsByAssignee = (): void => {
    let abus: Array<AssignedBusinessUnits> = [];

    //Create an array of business units, by assignee, and number of assignments
    lodash.forEach(this._requests, (request: DataObj) => {
      if (request.Assigned != null) {
        let i = -1;
        let assigned = request.Assigned;
        let bu = request.BusinessUnit;

        lodash.forEach(abus, (a, index) => {
          if (a.Assigned == assigned && a.BusinessUnit == bu) {
            i = index;
            return false;
          }
        });
        if (i == -1)
          abus.push(new AssignedBusinessUnits(bu, assigned));
        else
          abus[i].Assignments++;
      }
    });
    console.log(abus);

    let businessUnits: Array<string> = [];
    let assigned: Array<string> = [];

    //Generate a unique list of business units and assignees
    lodash.forEach(abus, (abu) => {
      let itemBU = abu.BusinessUnit;
      if (lodash.indexOf(businessUnits, itemBU) == -1)
        businessUnits.push(itemBU);
      let itemA = abu.Assigned;
      if (lodash.indexOf(assigned, itemA) == -1)
        assigned.push(itemA);
    });

    let val = [];

    //For each assignee -> business unit, get the number of assignments
    lodash.forEach(assigned, (a) => {
      let dataArray = [];
      dataArray.push(a);
      lodash.forEach(businessUnits, (b) => {
        let value = lodash.find(abus, { "BusinessUnit": b, "Assigned": a });
        dataArray.push(value.Assignments);
      });
      val.push(dataArray);
    });

    //Tell the chart renderer that the business units are the x axis
    businessUnits.splice(0, 0, 'x');
    //Add the x axis labels to the data payload
    val.splice(0, 0, businessUnits);

    let Title = "Requests by Assignee";
    //Generate chart
    let reqByAssignee = c3.generate({
      bindto: '#chart',
      data: {
        x: 'x',
        columns: val,
        type: 'area'
      },
      axis: {
        x: {
          type: 'category'
        }
      }
    });
  };
}

let i = new Init();
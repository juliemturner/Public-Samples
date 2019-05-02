import { IITRequest, ITRequest, IAssignedRequests, AssignedRequests, ICategoryRequests, CategoryRequests, StatusRequests, IStatusRequests } from "../DashboardModels";

import { Logger, LogLevel } from "@pnp/logging";
import { sp, Web } from "@pnp/sp";
import "@pnp/polyfill-ie11";

import * as lodash from 'lodash';
import * as c3 from 'c3';

export interface IDBService {
  businessUnits: string[];
  selectedBusinessUnit: string;
  init: () => Promise<void>;
  renderData: () => void;
}

export class DBService {
  public selectedBusinessUnit: string = "All";
  public businessUnits: string[] = [];

  private itRequests: IITRequest[] = null;

  constructor(
    private listName: string
  ) { }

  public init = async () => {
    let response = await sp.web.lists.getByTitle(this.listName).items.select("Id", "BusinessUnit", "Category", "Status", "DueDate", "AssignedTo/Title").expand("AssignedTo").top(5000).get<[{ Id: string, BusinessUnit: string, Category: string, Status: string, DueDate: string, AssignedTo: { Title: string } }]>();

    this.itRequests = [];
    for (let i = 0; i < response.length; i++) {
      let item = new ITRequest();
      item.Id = response[i].Id;
      item.BusinessUnit = response[i].BusinessUnit;
      item.Category = response[i].Category;
      item.Status = response[i].Status;
      if (response[i].DueDate != undefined)
        item.DueDate = new Date(response[i].DueDate);
      if (response[i].AssignedTo != undefined)
        item.Assigned = response[i].AssignedTo.Title.split(" ")[0];
      this.itRequests.push(item);
    }
    this.loadBusinessUnits();
    return;
  }

  public renderData = () => {
    this.chartRequestsByAssignee();
    this.chartAvgRequestWeekday();
    this.chartRequestByBusinessUnit();
    this.chartRequestStatusCount();
    return;
  }

  private loadBusinessUnits = (): void => {
    this.businessUnits = [];
    this.businessUnits = lodash.uniq(lodash.flatMap(this.itRequests, (o) => { return o.BusinessUnit; }));
  }

  private chartRequestsByAssignee = () => {
    let assignedrequests: IAssignedRequests[] = [];
    lodash.map(this.itRequests, (request: IITRequest) => {
      if (request.Assigned != null && (request.BusinessUnit == this.selectedBusinessUnit || this.selectedBusinessUnit == "All")) {
        let i = -1;
        let assigned = request.Assigned;
        let bu = request.BusinessUnit;
        lodash.map(assignedrequests, (item, index) => {
          if (item.Assigned == assigned && item.BusinessUnit == bu) {
            i = index;
            return false;
          }
        });
        if (i == -1)
          assignedrequests.push(new AssignedRequests(bu, assigned));
        else
          assignedrequests[i].Assignments++;
      }
    });

    let val = [];
    let cat = lodash.uniq(lodash.flatMap(assignedrequests, (o) => { return o.BusinessUnit; }));
    let a = lodash.uniq(lodash.flatMap(assignedrequests, (o) => { return o.Assigned; }));

    lodash.map(a, (_a) => {
      let assigned = _a.toString();
      let dataArray = [];
      lodash.map(cat, (_c) => {
        let value = lodash.find(assignedrequests, { BusinessUnit: _c, Assigned: _a });
        dataArray.push((value == undefined) ? 0 : value.Assignments);
      });
      dataArray.splice(0, 0, assigned);
      val.push(dataArray);
    });
    cat.splice(0, 0, 'x');
    val.splice(0, 0, cat);

    let Title = this.selectedBusinessUnit == "All" ? "Requests by Assignee" : "Requests by Assignee for (" + this.selectedBusinessUnit + ")";
    let titleElement = document.getElementById("RequestsByAssigneeTitle");
    titleElement.innerText = Title;
    //groups: [a]
    let config =
    {
      bindto: '#RequestsByAssignee',
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
    };

    let reqByAssignee = c3.generate(config);
  }

  private chartAvgRequestWeekday = () => {
    let weeks: string = ((this.itRequests[this.itRequests.length - 1].DueDate.getTime() - this.itRequests[0].DueDate.getTime()) / (1000 * 60 * 60 * 24 * 7)).toFixed(0);
    let dailyRequests = [];

    lodash.map(this.itRequests, (item: ITRequest) => {
      if (item.BusinessUnit == this.selectedBusinessUnit || this.selectedBusinessUnit == "All") {
        let category = item.Category;
        let i = lodash.findIndex(dailyRequests, (o) => o.Category === category);
        if (i == -1) {
          dailyRequests.push({ Category: category, Data: [{ Day: 'Sunday', ReqCount: 0 }, { Day: 'Monday', ReqCount: 0 }, { Day: 'Tuesday', ReqCount: 0 }, { Day: 'Wednesday', ReqCount: 0 }, { Day: 'Thursday', ReqCount: 0 }, { Day: 'Friday', ReqCount: 0 }, { Day: 'Saturday', ReqCount: 0 }] });
          dailyRequests[dailyRequests.length - 1].Data[item.DueDate.getDay()].ReqCount++;
        }
        else
          dailyRequests[i].Data[item.DueDate.getDay()].ReqCount++;
      }
    });

    let cat = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let val = [];
    lodash.map(dailyRequests, (item) => {
      let dataArray = [];
      lodash.map(item.Data, (i) => {
        dataArray.push(Math.round((i.ReqCount / +weeks) * 10) / 10);
      });
      dataArray.splice(0, 0, item.Category);
      val.push(dataArray);
    });

    let cat2 = lodash.clone(cat);
    cat2.splice(0, 0, 'x');
    val.splice(0, 0, cat2);

    let Title = this.selectedBusinessUnit == "All" ? "Avg Requests per Day" : "Avg Requests per Day for (" + this.selectedBusinessUnit + ")";
    let titleElement = document.getElementById("AvgRequestWeekdayTitle");
    titleElement.innerText = Title;

    let config =
    {
      bindto: '#AvgRequestWeekday',
      data: {
        x: 'x',
        columns: val,
        type: 'area-spline',
        groups: [cat]
      },
      axis: {
        x: {
          type: 'category'
        }
      }
    };

    let reqAvgByWeekday = c3.generate(config);
  }

  private chartRequestByBusinessUnit = () => {
    let catrequests: ICategoryRequests[] = [];
    lodash.map(this.itRequests, (item) => {
      if (item.BusinessUnit == this.selectedBusinessUnit || this.selectedBusinessUnit == "All") {
        let i = lodash.findIndex(catrequests, { Category: item.Category, BusinessUnit: item.BusinessUnit });
        if (i == -1)
          catrequests.push(new CategoryRequests(item.Category, item.BusinessUnit));
        else
          catrequests[i].Requests++;
      }
    });

    let cat = lodash.uniq(lodash.flatMap(catrequests, (o) => { return o.BusinessUnit; }));
    let c = lodash.uniq(lodash.flatMap(catrequests, (o) => { return o.Category; }));

    let val = [];
    lodash.map(c, (_c) => {
      let category = _c.toString();
      let dataArray = [];
      lodash.map(cat, (_cat) => {
        let value = lodash.find(catrequests, { BusinessUnit: _cat, Category: _c });
        dataArray.push((value == undefined) ? 0 : value.Requests);
      });
      dataArray.splice(0, 0, category);
      val.push(dataArray);
    });

    cat.splice(0, 0, 'x');
    val.splice(0, 0, cat);

    let Title = this.selectedBusinessUnit == "All" ? "Requests by Business Unit" : "Requests by Business Unit for (" + this.selectedBusinessUnit + ")";
    let titleElement = document.getElementById("RequestByBusinessUnitTitle");
    titleElement.innerText = Title;

    let config =
    {
      bindto: '#RequestByBusinessUnit',
      data: {
        x: 'x',
        columns: val,
        type: 'bar',
        groups: [c]
      },
      axis: {
        x: {
          type: 'category'
        }
      }
    };

    let reqByBusinessUnit = c3.generate(config);
  }

  private chartRequestStatusCount = () => {
    let statusCount: IStatusRequests[] = [];
    lodash.map(this.itRequests, (item) => {
      if (item.BusinessUnit == this.selectedBusinessUnit || this.selectedBusinessUnit == "All") {
        let status = item.Status;
        let i = lodash.findIndex(statusCount, { Status: item.Status });
        if (i == -1) {
          statusCount.push(new StatusRequests(item.Status));
        }
        else
          statusCount[i].Requests++;
      }
    });
    let val = [];
    for (let i = (statusCount.length - 1); i >= 0; i--) {
      let dataArray = [statusCount[i].Status, statusCount[i].Requests];
      val.push(dataArray);
    }

    let Title = this.selectedBusinessUnit == "All" ? "Request Status" : "Request Status for (" + this.selectedBusinessUnit + ")";
    let titleElement = document.getElementById("RequestStatusCountTitle");
    titleElement.innerText = Title;

    let config =
    {
      bindto: '#RequestStatusCount',
      data: {
        columns: val,
        type: 'pie'
      }
    };

    let reqStatusCount = c3.generate(config);
  }
}
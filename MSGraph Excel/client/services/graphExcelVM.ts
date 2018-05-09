import * as angular from "angular";
import { IGraphWorksheests, IRangeData, DashboardData, HelpDeskRequest } from "../models/graphExcelModels";
import { IGraphExcelData } from "./graphExcelData";

import { isNullOrUndefined } from "util";

export interface IGraphExcelVM {
  data: DashboardData;

  adalHandler(adalAuthContext: any, hash: string): angular.IPromise<any>;
  initDashboard(): angular.IPromise<any>;
  loadDriveItem(): angular.IPromise<any>;
  getTables(): angular.IPromise<any>;
  renameSheet(sheetId: string, newName: string): angular.IPromise<any>;
  addSheet(newName: string): angular.IPromise<any>;
  addData(sheetId: string): angular.IPromise<any>;
  formatDates(sheetId: string, format: string): angular.IPromise<any>;
  createTable(sheetId: string): angular.IPromise<any>;
  createCalcColumn(sheetId: string): angular.IPromise<any>;
  addRow(newRow: HelpDeskRequest): angular.IPromise<any>;
  addChart(chartType: string, chartRange: string): angular.IPromise<any>;
  calculateGrandTotal(redWidget: number, blueWidget: number, yellowWidget: number): angular.IPromise<any>;
}

export class GraphExcelVM implements IGraphExcelVM {
  static $inject = ["$q", "$http", "$timeout", "_CONFIG", "GraphExcelData"];

  public data: DashboardData = new DashboardData();

  constructor(private $q: angular.IQService,
    private $http: angular.IHttpService,
    private $timeout: angular.ITimeoutService,
    private _CONFIG: any,
    private graphExcelData: IGraphExcelData) {

  }

  public adalHandler(adalAuthContext: any, hash: string): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();

    let isCallback: boolean = adalAuthContext.isCallback(hash);

    if (isCallback && !adalAuthContext.getLoginError()) {
      adalAuthContext.handleWindowCallback();
      d.resolve(false);
    } else {
      let user: any = adalAuthContext.getCachedUser();
      if (!user) {
        // log in user
        adalAuthContext.login();
        d.resolve(false);
      } else {
        d.resolve(true);
      }
    }

    return d.promise;
  }

  public initDashboard(): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();

    if (this.data.driveItems.length === 0) {
      this.graphExcelData.getFiles().then((result) => {
        this.data.driveItems = result;
        d.resolve(true);
      });
    } else {
      d.resolve(true);
    }

    return d.promise;
  }

  public loadDriveItem(): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.getWorksheets(this.data.driveItem).then((result) => {
      this.data.worksheets = result;
      this.data.getWorksheets = true;
      d.resolve(true);
    });
    return d.promise;
  }

  public getTables(): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.getTables(this.data.driveItem).then((result) => {
      this.data.tables = result;
      this.data.getTables = true;
      d.resolve(true);
    });
    return d.promise;
  }

  public renameSheet(sheetId: string, newName: string): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.renameWorksheet(this.data.driveItem, sheetId, newName).then((result) => {
      this.$timeout(() => {
        this.graphExcelData.getWorksheets(this.data.driveItem).then((result) => {
          this.data.worksheets = result;
          this.data.renameSheet = true;
          d.resolve(true);
        });
      }, 1000);
    });
    return d.promise;
  }

  public addSheet(newName: string): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.addWorksheet(this.data.driveItem, newName).then((result) => {
      this.$timeout(() => {
        this.graphExcelData.getWorksheets(this.data.driveItem).then((result) => {
          this.data.worksheets = result;
          this.data.addSheet = true;
          d.resolve(true);
        });
      }, 1000);
    });
    return d.promise;
  }

  public addData(sheetId: string): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.getHelpDeskRequests().then((result) => {
      this.data.helpDeskItems = result;
      return this.graphExcelData.addWorksheetRange(this.data.driveItem, sheetId, result);
    }).then((result) => {
      this.data.addData = result;
      d.resolve(result);
    });
    return d.promise;
  }

  public formatDates(sheetId: string, format: string): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.formatWorksheetRange(this.data.driveItem, sheetId, this.data.helpDeskItems, format).then((result) => {
      this.data.formatDates = result;
      d.resolve(result);
    });
    return d.promise;
  }

  public createTable(sheetId: string): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.createTable(this.data.driveItem, sheetId, this.data.helpDeskItems, "G").then((result) => {
      this.data.createTable = result;
      d.resolve(result);
    });
    return d.promise;
  }

  public createCalcColumn(sheetId: string): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.createCalcColumn(this.data.driveItem, sheetId, this.data.helpDeskItems).then((result) => {
      this.data.addColumn = result;
      d.resolve(result);
    });
    return d.promise;
  }

  public addRow(newRow: HelpDeskRequest): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.addRow(this.data.driveItem, this.data.tables[0].id, newRow).then((result) => {
      this.data.addRow = result;
      d.resolve(result);
    });
    return d.promise;
  }

  public addChart(chartType: string): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.getHelpDeskRequests().then((result) => {
      this.data.helpDeskItems = result;
      return this.graphExcelData.addChartTable(this.data.driveItem, this.data.worksheets[1].name, this.data.helpDeskItems);
    }).then((result) => {
      return this.graphExcelData.addChart(this.data.driveItem, this.data.worksheets[0].name, result, chartType);
    }).then((result) => {
      this.data.createChart = result;
      d.resolve(result);
    });
    return d.promise;
  }

  public calculateGrandTotal(redWidget: number, blueWidget: number, yellowWidget: number): angular.IPromise<any> {
    let d: angular.IDeferred<{}> = this.$q.defer();
    this.graphExcelData.getPersistantSession(this.data.driveItem).then((result) => {
      this.data.sessionId = result;
      return this.graphExcelData.updateNamedItemValue(this.data.driveItem, "RedQty", redWidget.toString(), this.data.sessionId);
    }).then((result) => {
      return this.graphExcelData.updateNamedItemValue(this.data.driveItem, "BlueQty", blueWidget.toString(), this.data.sessionId);
    }).then((result) => {
      return this.graphExcelData.updateNamedItemValue(this.data.driveItem, "YellowQty", yellowWidget.toString(), this.data.sessionId);
    }).then((result) => {
      return this.graphExcelData.getNamedItemValue(this.data.driveItem, "GrandTotal", this.data.sessionId);
    }).then((result) => {
      this.data.grandTotal = result[0][0];
      return this.graphExcelData.closePersistantSession(this.data.driveItem, this.data.sessionId);
    }).then((result) => {
      d.resolve(result);
    });
    return d.promise;
  }
}

angular.module("GraphExcelVM", []).service("GraphExcelVM", GraphExcelVM);
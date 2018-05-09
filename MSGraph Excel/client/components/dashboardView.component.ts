"use strict";
import * as angular from "angular";
import {isNullOrUndefined} from "util";
declare let AuthenticationContext: any;
import * as Sympraxis from 'Sympraxis';
import {DashboardData, HelpDeskRequest} from "../models/graphExcelModels";
import { IGraphExcelVM } from "../services/graphExcelVM";
import {IMessageService, Message, messageTypes} from "../message/message.service";


interface IDashboardViewControllerBindings {
}

interface IDashboardViewController extends IDashboardViewControllerBindings {
    data: DashboardData;
    persistantDemo: any;
    renameSheetValue: string;
    addSheetValue: string;
    addDataSheetValue: string;
    dateFormatValue: string;
    newRow: HelpDeskRequest;
    chartType: string;
    chartRange: string;
    redQty: number;
    blueQty: number;
    yellowQty: number; 

    trustAsHtml(html: string): any;
    checked(): void
    selectDriveItem(id: string): void;
    renameSheet(): void;
    addSheet(): void;
    addDataSheet(): void;
    formatDates(): void;
    createTable(): void;
    addColumn(): void;
    getTables(): void;
    addRow(): void;
    addChart(): void;
    getGrandTotal(): void;
}

class dashboardViewController implements IDashboardViewController {
    static $inject = ["$timeout", "$sce", "$state", "_CONFIG", "GraphExcelVM", "MessageService"];

    public data: DashboardData;
    private adalAuthContext: adal.AuthenticationContext;

    public persistantDemo = false;
    public renameSheetValue: string = "";
    public addSheetValue: string = "";
    public addDataSheetValue: string = "";
    public dateFormatValue: string = "";
    public newRow: HelpDeskRequest = new HelpDeskRequest();
    public chartType: string = "";
    public chartRange: string = "";
    public redQty: number = 0
    public blueQty: number = 0;
    public yellowQty: number = 0;
    
    constructor(private $timeout: angular.ITimeoutService, private $sce: angular.ISCEService, private $state: angular.ui.IStateService, private _CONFIG: any, private graphExcelVM: IGraphExcelVM, private msgSvc: IMessageService) {
        this.data = graphExcelVM.data;
        this.adalAuthContext = new AuthenticationContext(_CONFIG.adal);
    }

    public trustAsHtml(html): any {
        return this.$sce.trustAsHtml(html);
    }

    public checked(): void {
        // tslint:disable-next-line:no-empty
        //this.$timeout(() => { }, 0);
    }

    public selectDriveItem(id: string): void {
        this.data.driveItem = id;
        this.graphExcelVM.loadDriveItem().then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public renameSheet(): void {
        this.graphExcelVM.renameSheet(this.data.worksheets[0].name, this.renameSheetValue).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public addSheet(): void {
        this.graphExcelVM.addSheet(this.addSheetValue).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public addDataSheet(): void {
        this.graphExcelVM.addData(this.addDataSheetValue).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public formatDates(): void {
        this.graphExcelVM.formatDates(this.addDataSheetValue, this.dateFormatValue).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public createTable(): void {
        this.graphExcelVM.createTable(this.addDataSheetValue).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public addColumn(): void {
        this.graphExcelVM.createCalcColumn(this.addDataSheetValue).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public getTables(): void {
        this.graphExcelVM.getTables().then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public addRow(): void {
        this.graphExcelVM.addRow(this.newRow).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public addChart(): void {
        this.graphExcelVM.addChart(this.chartType, this.chartRange).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }

    public getGrandTotal(): void {
        this.graphExcelVM.calculateGrandTotal(this.redQty, this.blueQty, this.yellowQty).then((result) => {
            if(!(result)) {
                console.log("Error loading dashboard");
            }
            // tslint:disable-next-line:no-empty
            this.$timeout(() => { }, 0);
        });
    }
    
    $onInit(): void {
        this.graphExcelVM.adalHandler(this.adalAuthContext, window.location.hash).then((result) => {
            if(result) {
                this.graphExcelVM.initDashboard().then((result) => {
                    if(!(result)) {
                        console.log("Error loading dashboard");
                    }
                    // tslint:disable-next-line:no-empty
                    this.$timeout(() => { }, 0);
                });
            }
        });
    }
}

class DashboardViewComponent implements angular.IComponentOptions {
    public bindings: any;
    public controller: any;
    public template: string;
    public controllerAs: string;

    constructor() {
        this.bindings = {};
        this.controller = dashboardViewController;
        this.controllerAs = "vm";
        this.template = require("./dashboardView.tmpl.html");
    }
}

angular.module("GraphExcel").component("dashboardView", new DashboardViewComponent());




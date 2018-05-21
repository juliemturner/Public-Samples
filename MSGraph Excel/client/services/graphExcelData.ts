import * as angular from "angular";
declare let AuthenticationContext: any;
import * as Sympraxis from "Sympraxis";
import { isNullOrUndefined } from "util";
import { Worksheet, IRangeData, DashboardData, Item, HelpDeskRequest, Tables } from "../models/graphExcelModels";

export interface IGraphExcelData {
    getFiles(): angular.IPromise<Item[]>;
    getWorksheets(graphFileId: string, sessionId: string): angular.IPromise<Worksheet[]>;
    getTables(graphFileId: string, sessionId: string): angular.IPromise<Tables[]>;
    renameWorksheet(graphFileId: string, worksheetId: string, newName: string, sessionId: string): angular.IPromise<boolean>;
    addWorksheet(graphFileId: string, newName: string, sessionId: string): angular.IPromise<boolean>;
    getHelpDeskRequests(): angular.IPromise<HelpDeskRequest[]>;
    addWorksheetRange(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], sessionId: string): angular.IPromise<boolean>;
    formatWorksheetRange(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], format: string, sessionId: string): angular.IPromise<boolean>;
    createTable(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], endColumn: string, sessionId: string): angular.IPromise<boolean>;
    createCalcColumn(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], sessionId: string): angular.IPromise<boolean>;
    addRow(graphFileId: string, worksheetId: string, newRow: HelpDeskRequest, sessionId: string): angular.IPromise<boolean>;
    addChartTable(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], sessionId: string): angular.IPromise<string>;
    addChart(graphFileId: string, worksheetId: string, range: string, chartType: string, sessionId: string): angular.IPromise<boolean>;
    getPersistantSession(graphFileId: string, persistChanges: string): angular.IPromise<string>;
    closePersistantSession(graphFileId: string, sessionId: string): angular.IPromise<boolean>;
    updateNamedItemValue(graphFileId: string, namedItem: string, value: string, sessionId: string): angular.IPromise<boolean>;
    getNamedItemValue(graphFileId: string, namedItem: string, sessionId: string): angular.IPromise<any>;
}

export class GraphExcelData implements IGraphExcelData {
    static $inject = ["$q", "$http", "_CONFIG"];

    private adalAuthContext: adal.AuthenticationContext;
    private requestDigest: string;
    private requestDigestTimeout: number;

    constructor(private $q: angular.IQService, private $http: angular.IHttpService, private _CONFIG: any) {
        this.adalAuthContext = new AuthenticationContext(_CONFIG.adal);
        this.refreshRequestDigest(null);
    }

    private getRequestDigest(subsite: string): angular.IPromise<any> {
        let d = this.$q.defer();
        let site: string = Sympraxis.getCurrentSite();
        if (!isNullOrUndefined(subsite))
            site = Sympraxis.getCurrentSiteCollection() + "/" + subsite;

        this.$http.post(site + "/_api/contextinfo", {
            data: '',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json;odata=nometadata"
            },
        }).then((response: any) => {
            d.resolve(response.data);
        }, (error) => {
            console.error("Error retrieving request digest.", { Error: JSON.stringify(error.data) });
        });

        return d.promise;
    }

    private refreshRequestDigest(subsite: string): void {
        //Set the Form Digest Value every 24 min
        this.getRequestDigest(subsite).then((digest: any) => {
            this.requestDigest = digest.FormDigestValue;
            this.requestDigestTimeout = digest.FormDigestTimeoutSeconds * 1000;
            setTimeout(() => { this.refreshRequestDigest(subsite); }, this.requestDigestTimeout);
        }, (error) => {
            this.requestDigest = document.getElementById("__REQUESTDIGEST")['value'];
            console.error("Error retrieving form digest value: ", error);
        });
    }

    private getAuthToken(endpoint: string): angular.IPromise<any> {
        let d: angular.IDeferred<{}> = this.$q.defer();

        // read the token from the cache
        let tokenCache: string = this.adalAuthContext.getCachedToken(endpoint);

        // tslint:disable-next-line:triple-equals
        if (tokenCache == undefined) {
            // if token is undefined, then call AAD to get a new token
            this.adalAuthContext.acquireToken(endpoint, (error, token) => {
                if (error || !token) {
                    d.reject(error);
                } else {
                    d.resolve(token);
                }
            });
        } else {
            d.resolve(tokenCache);
        }
        // return a promise for acquiring token
        return d.promise;
    }

    private getAdal(url: string, endpoint: string, blob: boolean = false, sessionId: string = null): angular.IPromise<any> {
        let d: angular.IDeferred<{}> = this.$q.defer();

        // must pass the endpoint, not the full url
        this.getAuthToken(endpoint).then((token) => {
            let httpConfig: any = {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                },
                url: url
            };
            if (blob) {
                httpConfig.responseType = "blob";
            }
            if (sessionId){
                httpConfig.headers["workbook-session-id"] = sessionId;
            }
            d.resolve(this.$http(httpConfig));
        });

        return d.promise;
    }

    private putAdal(url: string, endpoint: string, stream: any, sessionId: string = null): angular.IPromise<any> {
        let d: angular.IDeferred<{}> = this.$q.defer();

        // must pass the endpoint, not the full url
        this.getAuthToken(endpoint).then((token) => {
            let httpConfig: any = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                },
                url: url,
                data: stream
            };
            if (sessionId){
                httpConfig.headers["workbook-session-id"] = sessionId;
            }
            d.resolve(this.$http(httpConfig));
        });

        return d.promise;
    }

    private patchAdal(url: string, endpoint: string, stream: any, sessionId: string = null): angular.IPromise<any> {
        let d: angular.IDeferred<{}> = this.$q.defer();

        // must pass the endpoint, not the full url
        this.getAuthToken(endpoint).then((token) => {
            let httpConfig: any = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                },
                url: url,
                data: JSON.stringify(stream)
            };
            if (sessionId){
                httpConfig.headers["workbook-session-id"] = sessionId;
            }
            d.resolve(this.$http(httpConfig));
        });

        return d.promise;
    }

    private postAdal(url: string, endpoint: string, stream: any, sessionId: string = null): angular.IPromise<any> {
        let d: angular.IDeferred<{}> = this.$q.defer();

        // must pass the endpoint, not the full url
        this.getAuthToken(endpoint).then((token) => {
            let httpConfig: any = {
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                },
                url: url,
                data: JSON.stringify(stream)
            };
            if (sessionId){
                httpConfig.headers["workbook-session-id"] = sessionId;
            }
            d.resolve(this.$http(httpConfig));
        });

        return d.promise;
    }

    private get(list, query, site, subsite): angular.IPromise<any> {
        if (isNullOrUndefined(site)) {
            site = Sympraxis.getCurrentSite();
            if (isNullOrUndefined(subsite))
                site = Sympraxis.getCurrentSiteCollection() + "/" + subsite;
        }

        return this.$http({
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json;odata=minimalmetadata'
            },
            url: site + "/_api/web/lists/getbytitle('" + list + "')/items" + query
        });
    }

    public getFiles(): angular.IPromise<Item[]> {
        let d: angular.IDeferred<Item[]> = this.$q.defer();

        let fileUrl: string = this._CONFIG.urlLibrary + "items";
        this.getAdal(fileUrl, this._CONFIG.adal.endpoints.graphUri, false).then((result) => {
            let retVal: Item[] = [];
            let data = result.data.value;
            for (let i: number = 0; i < data.length; i++) {
                let item: Item = new Item();
                item.id = data[i].id;
                item.webUrl = data[i].webUrl
                let tmp = data[i].webUrl.split("/");
                item.name = tmp[tmp.length - 1];
                retVal.push(item);
            }
            d.resolve(retVal);
        });

        return d.promise;
    }

    public getWorksheets(graphFileId: string, sessionId: string): angular.IPromise<Worksheet[]> {
        let d: angular.IDeferred<Worksheet[]> = this.$q.defer();

        let fileUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/worksheets";
        this.getAdal(fileUrl, this._CONFIG.adal.endpoints.graphUri, false, sessionId).then((result) => {
            let retVal: Worksheet[] = [];
            let data = result.data.value;
            for (let i: number = 0; i < data.length; i++) {
                let item: Worksheet = new Worksheet();
                item.id = data[i].id;
                item.name = data[i].name;
                item.position = data[i].position;
                item.visibility = data[i].visibility;
                retVal.push(item);
            }
            d.resolve(retVal);
        });

        return d.promise;
    }

    public getTables(graphFileId: string, sessionId: string): angular.IPromise<Tables[]> {
        let d: angular.IDeferred<Tables[]> = this.$q.defer();

        let fileUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/tables";
        this.getAdal(fileUrl, this._CONFIG.adal.endpoints.graphUri, false, sessionId).then((result) => {
            let retVal: Tables[] = [];
            let data = result.data.value;
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
            d.resolve(retVal);
        });

        return d.promise;
    }

    public renameWorksheet(graphFileId: string, worksheetId: string, newName: string, sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let data: any = {
            "name": newName
        }

        let worksheetUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/worksheets/" + worksheetId;
        this.patchAdal(worksheetUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data = result.data.value;
            d.resolve(true);
        });

        return d.promise;
    }

    public addWorksheet(graphFileId: string, newName: string, sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let data: any = {
            "name": newName
        }

        let worksheetUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/worksheets/add";
        this.postAdal(worksheetUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data = result.data.value;
            d.resolve(true);
        });

        return d.promise;
    }

    public getHelpDeskRequests(): angular.IPromise<HelpDeskRequest[]> {
        let d: angular.IDeferred<HelpDeskRequest[]> = this.$q.defer();

        this.get("IT Requests", "?$top=5000&$select=ID,BusinessUnit,Category,Status,DueDate,AssignedTo/Title&$expand=AssignedTo/Title", null, "").then((result) => {
            let retVal: HelpDeskRequest[] = [];
            let data = result.data.value;
            for (let i: number = 0; i < data.length; i++) {
                let item: HelpDeskRequest = new HelpDeskRequest();
                item.id = data[i].ID;
                item.title = data[i].Title;
                item.status = data[i].Status;
                item.businessUnit = data[i].BusinessUnit;
                item.category = data[i].Category;
                if (data[i].DueDate != undefined)
                    item.dueDate = new Date(data[i].DueDate);
                if (data[i].AssignedTo != undefined)
                    item.assignedTo = data[i].AssignedTo.Title;
                retVal.push(item);
            }
            d.resolve(retVal);
        });

        return d.promise;
    }

    public addWorksheetRange(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let data: any = {
            "values": [["Id", "Title", "Status", "Business Unit", "Category", "Due Date", "Assigned To"]]
        };

        for (let i: number = 0; i < items.length; i++) {
            var dateValue: string = null;
            if(items[i].dueDate){
                dateValue = (items[i].dueDate.getMonth() + 1) + "/" + (items[i].dueDate.getDate()) + "/" + (items[i].dueDate.getFullYear());
            }
            data.values.push([items[i].id, items[i].title, items[i].status, items[i].businessUnit, items[i].category, dateValue, items[i].assignedTo]);
        }

        let range: string = "A1:G" + data.values.length.toString();

        let worksheetUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/worksheets('" + worksheetId + "')/range(address='" + range + "')";
        this.patchAdal(worksheetUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data = result.data;
            d.resolve(true);
        });

        return d.promise;
    }

    public formatWorksheetRange(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], format: string, sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let range: string = "A2:G" + (items.length + 1).toString();

        let data: any = {
            "numberFormat": []
        };

        for (let i: number = 0; i < items.length; i++) {
            data.numberFormat.push([null, null, null, null, null, format, null]);
        }

        let worksheetUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/worksheets('" + worksheetId + "')/range(address='" + range + "')";
        this.patchAdal(worksheetUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data = result.data;
            d.resolve(true);
        });

        return d.promise;
    }

    public createTable(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], endColumn: string, sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let range: string = "A1:" + endColumn + (items.length + 1).toString();

        let data: any = {
            "address": worksheetId + "!" + range,
            "hasHeaders": true
        };

        let tableUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/tables/add";
        this.postAdal(tableUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data = result.data;
            d.resolve(true);
        });

        return d.promise;
    }

    public createCalcColumn(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let range: string = "H1:H" + (items.length + 1).toString();

        let data: any = {
            "values": [["Weekday"]],
            "formulas": [[null]]
        };

        for (let i: number = 0; i < items.length; i++) {
            data.values.push([null]);
            data.formulas.push(["=CHOOSE(WEEKDAY(F" + (i + 2) + "),\"Sunday\",\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\",\"Saturday\")"]);
        }

        let worksheetUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/worksheets('" + worksheetId + "')/range(address='" + range + "')";
        this.patchAdal(worksheetUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data = result.data;
            d.resolve(true);
        });

        return d.promise;
    }

    public addRow(graphFileId: string, tableId: string, newRow: HelpDeskRequest, sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let data: any = {
            "index": 0,
            "values": [[newRow.id, newRow.title, newRow.status, newRow.businessUnit, newRow.category, (newRow.dueDate.getMonth() + 1) + "/" + (newRow.dueDate.getDate()) + "/" + (newRow.dueDate.getFullYear()), newRow.assignedTo, null]]
        };

        let tableUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/tables/" + tableId + "/rows/add";
        this.postAdal(tableUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data = result.data;
            d.resolve(true);
        });

        return d.promise;
    }

    public addChartTable(graphFileId: string, worksheetId: string, items: HelpDeskRequest[], sessionId: string): angular.IPromise<string> {
        let d: angular.IDeferred<string> = this.$q.defer();

        let data: any = {
            "values": [["Business Unit", "Incident Count"]]
        };

        var buRequests: any = [];

        for (let i: number = 0; i < items.length; i++) {
            let found: number = -1;
            var bu = items[i].businessUnit;
            for(let j: number = 0; j < buRequests.length; j++) {
                if (buRequests[j].businessunit == bu) { 
                    found = j;
                    break;
                }
            }
            if (found === -1)
                buRequests.push({businessunit: bu, count: 1 });  
            else
                buRequests[found].count++;
        }

        var range: string = "J1:K" + (buRequests.length + 1).toString();

        for(let i:number = 0; i < buRequests.length; i++){
            data.values.push([buRequests[i].businessunit, buRequests[i].count]);
        }

        let worksheetUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/worksheets('" + worksheetId + "')/range(address='" + range + "')";
        this.patchAdal(worksheetUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data: any = {
                "address": worksheetId + "!" + range,
                "hasHeaders": true
            };
            
            let tableUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/tables/add";
            return this.postAdal(tableUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId);
        }).then((result) => {
            d.resolve(worksheetId + "!" + range);
        });

        return d.promise;
    }

    public addChart(graphFileId: string, worksheetId: string, range: string, chartType: string, sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let data: any = {
            "type": chartType,
            "sourceData": range,
            "seriesBy": "Auto"
        };

        let chartUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/worksheets('" + worksheetId + "')/charts/add"
        this.postAdal(chartUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            let data = result.data;
            d.resolve(true);
        });

        return d.promise;
    }

    public getPersistantSession(graphFileId: string, persistChanges: string = "true"): angular.IPromise<string> {
        let d: angular.IDeferred<string> = this.$q.defer();

        let data: any = {
            "persistChanges": persistChanges
        };

        let chartUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/createSession"
        this.postAdal(chartUrl, this._CONFIG.adal.endpoints.graphUri, data).then((result) => {
            d.resolve(result.data.id);
        });

        return d.promise;
    }

    public closePersistantSession(graphFileId: string, sessionId: string): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let data: any = { };

        let chartUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/closeSession"
        this.postAdal(chartUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            d.resolve(true);
        });

        return d.promise;
    }

    public updateNamedItemValue(graphFileId: string, namedItem: string, value: string, sessionId: string = null): angular.IPromise<boolean> {
        let d: angular.IDeferred<boolean> = this.$q.defer();

        let data: any = {
            "values": [[value]]
        };

        let chartUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/names('" + namedItem + "')/range"
        this.patchAdal(chartUrl, this._CONFIG.adal.endpoints.graphUri, data, sessionId).then((result) => {
            d.resolve(true);
        });

        return d.promise;
    }

    public getNamedItemValue(graphFileId: string, namedItem: string, sessionId: string = null): angular.IPromise<any> {
        let d: angular.IDeferred<any> = this.$q.defer();

        let chartUrl: string = this._CONFIG.urlLibrary + "items/" + graphFileId + "/driveItem/workbook/names('" + namedItem + "')/range"
        this.getAdal(chartUrl, this._CONFIG.adal.endpoints.graphUri, false, sessionId).then((result) => {
            d.resolve(result.data.values);
        });

        return d.promise;
    }
}

angular.module("GraphExcelData", []).service("GraphExcelData", GraphExcelData);

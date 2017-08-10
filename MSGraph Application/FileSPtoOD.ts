let angular: any;  //import * as angular from 'angular';
let Sympraxis: any; //import * as Sympraxis from 'Sympraxis'; -- Helper utility
let isNullOrUndefined: any; //import {isNullOrUndefined} from "util"; -- Helper utility

//MODELS
//Included here in bevity and reduced fidelity to help code clarity
export class DashboardData{
    User: any = null;
    UserReview: PerformanceReview = null;
    RelatedUsers: Array<RelatedUser> = [];
    ReviewRequests: Array<ReviewRequest> = [];
} //import {DashboardData} from "../models/reviewModel.model";  -- Dashboard data model
export class PerformanceReview {} //import {PerformanceReview} from "../models/reviewModel.model"; -- Performance Review model
export class PRMetadata {
    SelfAppraisalUrl: string = null;
    SelfAppraisalStatus: string = null;
    Peer1Url: string = null;
    Peer1Status: string = null;
    Peer2Url: string = null;
    Peer2Status: string = null;
    DirectReportUrl: string = null;
    DirectReportStatus: string = null;
} //Here to show structure -- not imported
export class PerformanceReviewItem {
    Id: string = null;
    eTag: string = null;
    Title: string = null;
    ManagerId: string = null;
    RevieweeId: string = null;
    Peer1Id: string = null;
    Peer2Id: string = null;
    DirectReportId: string = null;
    ReviewStatus: string = null;
    ManagerReviewDate: Date = null;
    Metadata: PRMetadata = new PRMetadata();
} //import {PerformanceReviewItem} from "../models/reviewModel.model";
export class RelatedUser {
    Relation: string = null;
    User: People = null;
} //import {RelatedUser} from "../models/reviewModel.model";
export enum requestStatus {} //import {requestStatus} from "../models/reviewModel.model";
export class ReviewRequest {} //import {ReviewRequest} from "../models/reviewModel.model";
export enum reviewStatus {New} //import {reviewStatus} from "../models/reviewModel.model";
export class People{
    initials: string = null;
    primaryText: string = null;
    secondaryText: string = null;
    presence: string = null;
    group: any = null;
    color: string = null;
    icon: string = null;
    id: string = null;
} //import {People} from "../models/reviewModel.model";

//Dummy class to remove errors
export class Dummy { 

    //Dummy declarations to remove errors
    private $q:any; //injected into module -- private $q: angular.IQService 
    private reviewData: any; //injected into module -- private reviewData: IReviewDataService
    private dataDashboard: any; //public dataDashboard: DashboardData = new DashboardData();
    private newPerformanceReview(item: any): any {}; //function to create the item in the SharePoint list.
 
    /* View Model */

    //function to copy template file from SiteAssets library to the current users OneDrive
    public createSelfAppraisal(): angular.IPromise<boolean>{
        let d = this.$q.defer();
        //Get the file from SharePoint SiteAssets library
        this.reviewData.getFile("SelfAppraisalTemplate.docx").then((result) => {
            if(!isNullOrUndefined(result)){
                let fileName: string = this.dataDashboard.UserReview.Reviewee + " Self Appraisal " + (new Date()).getFullYear() + ".docx";
                //Create new filename and save item in the users OneDrive
                return this.reviewData.saveFile(result, fileName);
            }else{
                d.resolve(false);
            }
        }).then((result) => {
            //If successful, update performance review item with URL to file in OneDrive and set the status.
            if(!isNullOrUndefined(result)) {
                this.dataDashboard.UserReview.Metadata.SelfAppraisalUrl = result;
                this.dataDashboard.UserReview.Metadata.SelfAppraisalStatus = reviewStatus[reviewStatus.New];
                let item: PerformanceReviewItem = new PerformanceReviewItem();
                for (let key in item) {
                    item[key] = this.dataDashboard.UserReview[key];
                }
                return this.reviewData.updatePerformanceReview(item);
            }else {
                d.resolve(false);
            }
        }).then((result) => {
            if (!isNullOrUndefined(result)) {
                d.resolve(true);
            } else {
                d.resolve(false);
            }
        });
        return d.promise;
    }

    /** Data Layer **/

    //Dummy declarations to remove errors
    private $http: any; //injected into mmodule -- private $http: angular.IHttpService
    private _CONFIG:any; //injected into module -- private _CONFIG: any
    private getAuthToken(endpoint: string): any {}; //function to retrieve current ADAL auth token
    private getAdal(url: string, endpoint: string, blob: boolean = false): any {}; //function to make call to MSGraph.
    private logService: any; //injected into module -- private logService: ISympLogService -- custom function to log to console/opt log file/list
    
    //Retrieve file from SharePoint as a MSGraph download url
    public getFile(fileName: string): angular.IPromise<any> {
        let d = this.$q.defer();

        let url = this._CONFIG.urlSiteAssets + ":/" + fileName; //+ ":/content";
        this.getAdal(url, this._CONFIG.adal.endpoints.graphUri).then((result) => {
            if(!isNullOrUndefined(result.data)) {
                d.resolve(result.data['@microsoft.graph.downloadUrl']);
            }else{
                d.resolve(null);
            }
        },(error) => {
            this.logService.log("Error retrieving template file", {Error: JSON.stringify(error.data)});
            d.resolve(null);
        });

        return d.promise;
    }

    //Function to save a blob to a MSGraph endpoint
    private putAdal(url: string, endpoint: string, stream: any): angular.IPromise<any> {
        let d = this.$q.defer();

        //Must pass the endpoint, not the full url
        this.getAuthToken(endpoint).then((token) => {
            let httpConfig: any = {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/octet-stream",
                    'Accept': 'application/json',
                    'Authorization': "Bearer " + token
                },
                url: url,
                data: stream
            };
            d.resolve(this.$http(httpConfig));
        });

        return d.promise;
    }

    public saveFile(file: string, fileName: string): angular.IPromise<string>{
        let d = this.$q.defer();
        //use download url to retrieve an arraybuffer of the selected file
        this.$http({
            method: 'GET',
            headers: {
                'accept': 'application/json'
            },
            responseType: "arraybuffer",
            url: file
        }).then((response) => {
            //Create a blob out of the arraybuffer
            let dataBlob = new Blob([response.data]);
            let url = this._CONFIG.urlOneDrive + "/" + fileName + ":/content";
            //Save it to the onedrive url
            return this.putAdal(url, this._CONFIG.adal.endpoints.graphUri, dataBlob);
        },(error) => {
            this.logService.log("Error downloading file", {Error: JSON.stringify(error.data)});
            d.resolve(null);
        }).then((result) => {
            //Upon success return the webUrl to the file so that it can be saved to the item
            if(!isNullOrUndefined(result)){
                d.resolve(result.data.webUrl);
            }else{
                d.resolve(null);
            }
        },(error) => {
            this.logService.log("Error uploading file", {Error: JSON.stringify(error.data)});
            d.resolve(null);
        });

        return d.promise;
    }
   
}
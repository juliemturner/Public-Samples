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
export enum reviewStatus {} //import {reviewStatus} from "../models/reviewModel.model";
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
    //This function lives in VM layer and is called by the view to initialze data on the page.
    public initPerformanceReview(): angular.IPromise<boolean> {
        let d = this.$q.defer();

        //If any of the selection fields is empty, load the data for the lists/value
        if(isNullOrUndefined(this.dataDashboard.UserReview) || 
            isNullOrUndefined(this.dataDashboard.UserReview.Peer1Id) || 
            isNullOrUndefined(this.dataDashboard.UserReview.Peer2Id) || 
            isNullOrUndefined(this.dataDashboard.UserReview.DirectReportId)) {
            
                //Call function to load related employees from MSGraph
            this.reviewData.getEmployeeOrg(this.dataDashboard.User.userPrincipalName).then((result) => {
                this.dataDashboard.RelatedUsers = result;
                //If no item in the PerformanceReview list exists for the employee then create it.
                if(isNullOrUndefined(this.dataDashboard.UserReview)) {
                    let item: PerformanceReviewItem = new PerformanceReviewItem();
                    //populate UserReview
                    this.dataDashboard.UserReview = new PerformanceReview();
                    this.dataDashboard.UserReview.Title = this.dataDashboard.User.displayName + " Performance Review " + (new Date()).getFullYear();
                    this.dataDashboard.UserReview.RevieweeId = this.dataDashboard.User.SPId;
                    this.dataDashboard.UserReview.Reviewee = this.dataDashboard.User.displayName;
                    this.dataDashboard.UserReview.RevieweePhotoUrl = this.dataDashboard.User.photo;
                    //Get the manager from the returned MSGraph results
                    let manager = Sympraxis.getListIdxByAttr(this.dataDashboard.RelatedUsers, "Relation", "Manager");
                    if (!isNullOrUndefined(manager)) {
                        //If manager exists, set the value for the user in the list item.
                        this.dataDashboard.UserReview.Manager = this.dataDashboard.RelatedUsers[manager].User.primaryText;
                        this.dataDashboard.UserReview.ManagerId = this.dataDashboard.RelatedUsers[manager].User.id;
                        this.dataDashboard.UserReview.ManagerPhotoUrl = this.dataDashboard.RelatedUsers[manager].User.icon;
                        //Just becasue MSGraph has employee, doesn't mean the user exists in site collection -- call ensureUser
                        this.reviewData.ensureUser(this.dataDashboard.UserReview.ManagerId).then((result) => {
                            if (!isNullOrUndefined(result)) {
                                this.dataDashboard.UserReview.ManagerId = result;
                            }
                            return this.newPerformanceReview(item);
                        }).then((result) => {
                            d.resolve(result);
                        });
                    }else{
                        this.newPerformanceReview(item).then((result) => {
                            d.resolve(result);
                        });
                    }
                }else{
                    d.resolve(true);
                }
            });
        }else{
            //Data already exists for all the items so just resolve
            d.resolve(true);
        }

        return d.promise;
    }


    /** Data Layer **/

    //Dummy declarations to remove errors
    private _CONFIG:any; //injected into module -- private _CONFIG: any
    private getAdal(url: string, endpoint: string, blob: boolean = false): any {}; //function to make call to MSGraph.
    private logService: any; //injected into module -- private logService: ISympLogService -- custom function to log to console/opt log file/list
    
    //Function to create Person
    public getPerson(id: string, name: string, accountName: string, department: string, pictureUrl: string): People {
        let newPerson: People = new People();
        let resultsGroup = {name: "Results", order: 0};
        let userInitials = name.match(/\b\w/g) || [];
        newPerson.initials = ((userInitials.shift() || '') + (userInitials.pop() || '')).toUpperCase();
        newPerson.primaryText = name;
        newPerson.secondaryText = department;
        newPerson.presence = 'offline';
        newPerson.group = resultsGroup;
        newPerson.color = 'blue';
        newPerson.icon = pictureUrl;
        //When retrieved from graph, id isn't useful so accountName is used, if retrieved from SharePoint use UserId 
        newPerson.id = id || accountName;
        return newPerson;
    }
    
    //Function to retrieve users photo from MSGraph ** not the same as photo stored in SharePoint
    private getUserPhoto(url): angular.IPromise<any> {
        let d = this.$q.defer();
        //URL is from person object
        this.getAdal(url, this._CONFIG.adal.endpoints.graphUri, true).then((result) => {
            if (!isNullOrUndefined(result)) {
                //create a new window URL that contains the url for the photo
                let url = window.URL;
                d.resolve({
                    success: true,
                    imgUrl: url.createObjectURL(result.data)
                });
            } else {
                d.resolve({
                    success: false,
                    imgUrl: null
                });
            }
        }, (error) => {
            d.resolve({
                success: false,
                imgUrl: null
            });
        });
        return d.promise;
    }

    //Function to retrieve all user related in org chart returned as array
    public getEmployeeOrg(mePrincipalName: string): angular.IPromise<Array<RelatedUser>> {
        let d = this.$q.defer();

        let retArray: Array<RelatedUser> = [];
        this.getAdal(this._CONFIG.urlDR, this._CONFIG.adal.endpoints.graphUri).then((result) => {
            if (!isNullOrUndefined(result.data.value)) {
                if (result.data.value.length > 0) {
                    for (let i = 0; i < result.data.value.length; i++) {
                        let item = new RelatedUser();
                        item.Relation = "DR";
                        //ID is null, will use userPrincipalName instead
                        item.User = this.getPerson(null, 
                            result.data.value[i].displayName, 
                            result.data.value[i].userPrincipalName, 
                            result.data.value[i].officeLocation, 
                            "https://graph.microsoft.com/v1.0/users/" + result.data.value[i].id + "/photo/$value");
                        retArray.push(item);
                    }
                }
            }
            return this.getAdal(this._CONFIG.urlManager, this._CONFIG.adal.endpoints.graphUri);
        }).then((result) => {
            if (!isNullOrUndefined(result)) {
                let item = new RelatedUser();
                item.Relation = "Manager";
                item.User = this.getPerson(null, 
                    result.data.displayName, 
                    result.data.userPrincipalName, 
                    result.data.officeLocation, 
                    "https://graph.microsoft.com/v1.0/users/" + result.data.id + "/photo/$value");
                retArray.push(item);
            }
            return this.getAdal(this._CONFIG.urlPeers + result.data.userPrincipalName + '/directReports', this._CONFIG.adal.endpoints.graphUri);
        }, (error) => {
            this.logService.log("Error retrieving Manager", {Error: JSON.stringify(error.data)});
        }).then((result) => {
            if (!isNullOrUndefined(result)) {
                if (result.data.value.length > 0) {
                    for (let i = 0; i < result.data.value.length; i++) {
                        if (mePrincipalName != result.data.value[i].userPrincipalName) {
                            let item = new RelatedUser();
                            item.Relation = "Peer";
                            item.User = this.getPerson(null, 
                                result.data.value[i].displayName, 
                                result.data.value[i].userPrincipalName, 
                                result.data.value[i].officeLocation, 
                                "https://graph.microsoft.com/v1.0/users/" + result.data.value[i].id + "/photo/$value");
                            retArray.push(item);
                        }
                    }
                }
            }

            //Retrieve photo's for each user
            if (retArray.length > 0) {
                let promises: Array<ng.IPromise<{}>> = [];
                for (let j = 0; j < retArray.length; j++) {
                    promises.push(this.getUserPhoto(retArray[j].User.icon));
                }
                //Method to resolve all of the user photo's before returning array
                this.$q.all(promises).then(() => {
                    for (let k = 0; k < promises.length; k++) {
                        //becaused not typed, use [] notation to resolve image url
                        if (promises[k]['$$state']['value']['success']) {
                            retArray[k].User.icon = promises[k]['$$state']['value']['imgUrl'];
                        } else {
                            retArray[k].User.icon = null;
                        }
                    }
                    d.resolve(retArray);
                });
            } else {
                d.resolve(retArray);
            }
        });

        return d.promise;
    }
}
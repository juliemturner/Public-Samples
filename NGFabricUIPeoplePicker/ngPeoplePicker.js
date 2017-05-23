"use strict";
var NGFPP = window.NGFPP || {};
NGFPP.currentSite = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;

var ngfpp = angular.module('NGFabricUIPP', ['officeuifabric.core','officeuifabric.components']);

ngfpp.factory("ngfppService", function ($http, $q) {
    function getPerson(id, name, accountName, department, pictureUrl){
        var newPerson = {initials: null, primaryText: null, secondaryText: null, presence: null, group: null, color: null, icon: null, id: null};
        //My results group name will be called ‘Results’ for all the people found by search
        var resultsGroup = { name: "Results", order: 0 };
        //Use a regex to get an array of the first letters of the users names
        var userInitials = name.match(/\b\w/g) || [];
        //Create a string of the initials
        var userInitialsResult = ((userInitials.shift() || '') + (userInitials.pop() || '')).toUpperCase();
        newPerson.initials = userInitialsResult;
        newPerson.primaryText = name;
        //This could be whatever you want
        newPerson.secondaryText = department;
        //Since I don't have real information I felt offline was the best policy
        newPerson.presence = 'offline';
        newPerson.group = resultsGroup;
        //I just like orange, you may want to randomize the available choices
        newPerson.color = 'orange';
        if(pictureUrl != undefined && pictureUrl.length > 0)
            newPerson.icon = pictureUrl;
        //If you have the id, use it, otherwise you'll need to resolve the account name.
        newPerson.id = id || accountName;
        return newPerson;
    }

    var getPeopleSearch = function (queryString) {
        var d = $q.defer();

        $http({
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;odata=verbose',
                'accept': 'application/json;odata=verbose',
            },
            url: NGFPP.currentSite + "/_api/search/query?querytext='" + queryString + "*'&sourceid='B09A7990-05EA-4AF9-81EF-EDFAB16C4E31'"
        }).then((result) => {
                if(result.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results == undefined) {d.resolve([]);}
                var queryResults = result.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                if(queryResults.length > 0){
                    var searchResult = [];
                    var formattedPeople = [];
                    var topResultsGroup = { name: "Top Results", order: 0 };
                    //AccountName //Department //Path //PictureURL //PreferredName
                    for(var i=0; i < queryResults.length; i++){
                        // Normalize the fields so that we can easily get the values by the key name
                        for(var j=0; j < queryResults[i].Cells.results.length; j++){
                            searchResult[queryResults[i].Cells.results[j].Key] = queryResults[i].Cells.results[j].Value;
                        }
                        //Create a new person object with the resulting values
                        var newPerson = getPerson(null, searchResult.PreferredName, searchResult.AccountName, searchResult.Department, searchResult.PictureURL);
                        //Add the new person to the results array
                        formattedPeople.push(newPerson);
                    }
                    //Return the results array
                    d.resolve(formattedPeople);
                }
            },
            function (error) {
                console.log("Error retrieving user search.", {Error: JSON.stringify(error.data)});
                d.reject(error);
            });

        return d.promise;
    };

    var ensureUser = function(userName) {
        var data = {logonName: userName};
        return $http({
            method: 'POST',
            headers: {
                "Content-Type": "application/json;odata=verbose",
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": document.getElementById("__REQUESTDIGEST")['value']
            },
            data: JSON.stringify(data),
            url:  NGFPP.currentSite + "/_api/web/ensureuser"
        });
    }

    var saveIssue = function(item) {
        var list = "IT Requests";
        item["__metadata"] = {"type": "SP.Data." + list.replace('_', '_x005f_').replace(' ', '') + "ListItem"};

        return $http({
            method: 'POST',
            headers: {
                "Content-Type": "application/json;odata=verbose",
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": document.getElementById("__REQUESTDIGEST")['value']
            },
            data: JSON.stringify(item),
            url:  NGFPP.currentSite + "/_api/web/lists/getbytitle('" + list + "')/items"
        });
    }

    return {
        getPeopleSearch: getPeopleSearch,
        ensureUser: ensureUser,
        saveIssue: saveIssue
    };

});

ngfpp.component("ngfppView", {
    controllerAs: "vm",
    templateUrl: "/sites/juliedemos/Style%20Library/_demos/ngFabricUIPeoplePicker/ngfpp.tmpl.html",
    controller: function myAppCtrl($timeout, $q, ngfppService) {
        var self = this;
        //The Model
        self.Issue = {Title: null, BusinessUnit: null, Category: null, AssignedToId: null, AssignedTo: [], Status: 'New', Comment: null};
        //Function to get search results for the query value
        self.getPeopleSearchResults = function(query) {
            //If no query string then just return empty array
            if((query == undefined) || query.length < 1) return [];

            let d = $q.defer();
            
            ngfppService.getPeopleSearch(query).then(function (result){
                //resolve the search results
                d.resolve(result);
            });
            //return a promise
            return d.promise;
        };
        //Function to save the new item.
        self.save = function() {
            //Call the ensureuser REST Endpoint for the value of the people picker field 
            ngfppService.ensureUser(self.Issue.AssignedTo[0].id).then(function(result){
                //Assign the resulting Id, to the person fields internal Id field
                self.Issue.AssignedToId = result.data.d.Id;
                delete self.Issue.AssignedTo;
                //Call the save function
                return ngfppService.saveIssue(self.Issue);
            })
            .then(function(result) {
                self.Issue = {Title: null, BusinessUnit: null, Category: null, AssignedToId: null, AssignedTo: [], Status: 'New', Comment: null};
            });
        }
    }
});

"use strict";
var CKD = window.CKD || {};
CKD.ItemId = "10515";
CKD.List = "IT Requests";
CKD.Item = {};
CKD.EDIT = document.forms[MSOWebPartPageFormName]._wikiPageMode.value;
CKD.currentSite = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;

CKD.update = function() {
    var item = {Comment: CKEDITOR.instances.ckDescription.getData()}
    item["__metadata"] = {"type": "SP.Data." + CKD.List.replace('_', '_x005f_').replace(' ', '') + "ListItem"};
    $.ajax({
        url: CKD.currentSite + "/_api/web/lists/getbytitle('" + CKD.List + "')/items(" + CKD.ItemId  + ")",
        method: "POST",
        headers: {
            "Content-Type": "application/json;odata=verbose",
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": document.getElementById("__REQUESTDIGEST")['value'],
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*"
        },
        data: JSON.stringify(item),
        success: function() {
            location.reload();
        },
        error: function (sender, args) {
            alert(JSON.stringify(args));
        }
    });
}

CKD.init = function () {
    var requests = [];

    var loadRequest = function() {
        $.ajax({
            url: CKD.currentSite + "/_api/web/lists/getbytitle('" + CKD.List + "')/items(" + CKD.ItemId  + ")?$select=ID,Title,BusinessUnit,Category,Status,Comment,DueDate,AssignedTo/Title&$expand=AssignedTo",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: loadRequestsSuccess,
            error: loadRequestsError
        });
    };

    var loadRequestsSuccess = function (itResponse) {
        requests = [];
        var dataElement = document.getElementById('data');

        var it = itResponse.d;
        if(it != undefined) {
            CKD.Item.ID = it.ID;
            CKD.Item.BusinessUnit = it.BusinessUnit;
            CKD.Item.Category = it.Category;
            CKD.Item.Status = it.Status;
            if(it.DueDate != undefined){
                CKD.Item.DueDate = new Date(it.DueDate);
                CKD.Item.DueDate = (CKD.Item.DueDate.getMonth() + 1)  + "/" + CKD.Item.DueDate.getDate() + "/" + CKD.Item.DueDate.getFullYear();
            }
            if(it.AssignedTo != undefined)
                CKD.Item.Assigned = it.AssignedTo.Title.split(" ")[0];
            CKD.Item.Description = it.Comment;
            $('#txtBusinessUnit').text(CKD.Item.BusinessUnit);
            $('#txtCategory').text(CKD.Item.Category);
            $('#txtStatus').text(CKD.Item.Status);
            $('#txtDueDate').text(CKD.Item.DueDate);
            $('#txtAssigned').text(CKD.Item.Assigned);
            CKEDITOR.replace('ckDescription');
            if(CKD.Item.Description != undefined)
                CKEDITOR.instances.ckDescription.setData(CKD.Item.Description, null, true);
        }
    };

    var loadRequestsError = function (sender, args) {
        alert(JSON.stringify(args));
    };

    loadRequest();
};

$(document).ready(function() {
    if(CKD.EDIT != "Edit"){
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/ckeditor/4.6.2/ckeditor.js";
        script.onload = function() {
            CKD.init();
            $("#cmdSave").click(CKD.update);
        };
        head.appendChild(script);
    }
})
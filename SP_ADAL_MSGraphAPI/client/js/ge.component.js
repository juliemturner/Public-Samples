var GraphExcel;
(function (GraphExcel) {
    var geController = (function () {
        function geController($http, $q, adalProvider, _CONFIG) {
            this.$http = $http;
            this.$q = $q;
            this.adalProvider = adalProvider;
            this._CONFIG = _CONFIG;
            this.message = "";
            this.Worksheets = [];
            this.token = null;
            this.fileName = null;
            this.tempID = null;
            this.adalAuthContext = new AuthenticationContext(adalProvider.config);
        }
        geController.prototype.sheet_from_array_of_arrays = function (data, opts) {
            var ws = {};
            var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
            for (var R = 0; R != data.length; ++R) {
                for (var C = 0; C != data[R].length; ++C) {
                    if (range.s.r > R)
                        range.s.r = R;
                    if (range.s.c > C)
                        range.s.c = C;
                    if (range.e.r < R)
                        range.e.r = R;
                    if (range.e.c < C)
                        range.e.c = C;
                    var cell = { v: data[R][C] };
                    if (cell.v == null)
                        continue;
                    var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                    cell["t"] = 's';
                    ws[cell_ref] = cell;
                }
            }
            if (range.s.c < 10000000)
                ws['!ref'] = XLSX.utils.encode_range(range);
            return ws;
        };
        geController.prototype.createXlsx = function () {
            var emptyWB = { SheetNames: [], Sheets: {} };
            var ws = this.sheet_from_array_of_arrays([[null]], null);
            var wsName = "Sheet1";
            emptyWB.SheetNames.push(wsName);
            emptyWB.Sheets[wsName] = ws;
            var wbOut = XLSX.write(emptyWB, { bookType: 'xlsx', bookSST: true, type: 'binary' });
            var buf = new ArrayBuffer(wbOut.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != wbOut.length; ++i)
                view[i] = wbOut.charCodeAt(i) & 0xFF;
            return buf;
        };
        geController.prototype.saveXlsx = function (fileArrayBuffer) {
            var dateValue = new Date();
            var dateString = dateValue.getMilliseconds().toString();
            this.fileName = 'newXlsx' + dateString + ".xlsx";
            var fileUrl = this._CONFIG.SP_EP + "root:/" + this.fileName + ":/content";
            var fileBlob = new Blob([fileArrayBuffer], { type: "application/octet-stream" });
            return this.$http({
                url: fileUrl,
                method: "PUT",
                data: fileBlob,
                headers: {
                    "Content-Type": "application/octet-stream",
                    Accept: "application/json;odata.metadata=minimal"
                }
            });
        };
        geController.prototype.getWorksheets = function () {
            var xlsFileUrl = this._CONFIG.SP_EP + "items/" + this.tempID + "/workbook/worksheets";
            return this.$http({
                url: xlsFileUrl,
                method: "GET",
                headers: {
                    Accept: "application/json;odata.metadata=minimal"
                }
            });
        };
        geController.prototype.updateCell = function (rangeData) {
            var xlsUpdateCell = this._CONFIG.SP_EP + "items/" + this.tempID + "/workbook/worksheets('Sheet1')/range(address='A1')";
            return this.$http({
                url: xlsUpdateCell,
                method: "PATCH",
                headers: {
                    Accept: "application/json;odata.metadata=minimal"
                },
                data: rangeData
            });
        };
        geController.prototype.createFile = function () {
            var _this = this;
            var xlsBuffer = this.createXlsx();
            this.saveXlsx(xlsBuffer).then(function (response) {
                _this.message = "File: " + _this.fileName + " was written succesfully.";
                _this.tempID = response.data.id;
                return _this.getWorksheets();
            }, function (error) {
                _this.$q.reject(error);
            })
                .then(function (response) {
                _this.Worksheets = response.data.value;
                var dateNow = new Date();
                var rangeVals = { values: [[(dateNow.getMonth() + 1) + "/" + (dateNow.getDate()) + "/" + (dateNow.getFullYear())]], numberFormat: [["mm-dd-yyyy"]] };
                return _this.updateCell(rangeVals);
            }, function (error) {
                _this.$q.reject(error);
            })
                .then(function (response) {
                _this.message = "File " + _this.fileName + " updated";
            }, function (error) {
                _this.$q.reject(error);
            })
                .catch(function (error) {
                console.log(JSON.stringify(error));
            });
        };
        geController.prototype.$onInit = function () {
            var isCallback = this.adalAuthContext.isCallback(window.location.hash);
            if (isCallback && !this.adalAuthContext.getLoginError()) {
                this.adalAuthContext.handleWindowCallback();
            }
            else {
                var user = this.adalAuthContext.getCachedUser();
                if (!user) {
                    //Log in user
                    this.adalAuthContext.login();
                }
            }
        };
        return geController;
    }());
    geController.$inject = ["$http", "$q", "adalAuthenticationService", "_CONFIG"];
    var geComponent = (function () {
        function geComponent() {
            this.bindings = {};
            this.controller = geController;
            this.controllerAs = "vm";
            this.templateUrl = "<your templates folder location>/graphExcel.html";
        }
        return geComponent;
    }());
    angular.module("GraphExcel").component("graphExcel", new geComponent());
})(GraphExcel || (GraphExcel = {}));

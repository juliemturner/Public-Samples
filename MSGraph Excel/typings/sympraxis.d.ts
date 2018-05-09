declare module "Sympraxis" {
    function getQueryString(): void;
    function getCurrentSite(): string;
    function getCurrentSiteCollection(): string;
    function getListItemByAttr(arr: any, attr: string, val: string): any;
    function getListIdxByAttr(arr: any, attr: string, val: string): any;
    function amendTimeString(timeVal: Date, dateVal: Date, defaultDate: Date): Date;
    function encodeXml(string: string): any;
    function decodeXml(string: string): any;
}
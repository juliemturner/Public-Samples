var SPLink = /** @class */ (function () {
    function SPLink(Url, Description) {
        if (Url === void 0) { Url = ""; }
        if (Description === void 0) { Description = ""; }
        this.Url = Url;
        this.Description = Description;
    }
    return SPLink;
}());
export { SPLink };
var Link = /** @class */ (function () {
    function Link(Title, Description, LinkLocation, BackgroundImageLocation) {
        if (Title === void 0) { Title = ""; }
        if (Description === void 0) { Description = ""; }
        if (LinkLocation === void 0) { LinkLocation = new SPLink(); }
        if (BackgroundImageLocation === void 0) { BackgroundImageLocation = new SPLink(); }
        this.Title = Title;
        this.Description = Description;
        this.LinkLocation = LinkLocation;
        this.BackgroundImageLocation = BackgroundImageLocation;
    }
    return Link;
}());
export { Link };
//# sourceMappingURL=LinkTiles.models.js.map
export interface ISPLink {
    Url: string;
    Description: string;
}
export declare class SPLink implements ISPLink {
    Url: string;
    Description: string;
    constructor(Url?: string, Description?: string);
}
export interface ILink {
    Title: string;
    Description: string;
    LinkLocation: ISPLink;
    BackgroundImageLocation: ISPLink;
}
export declare class Link implements ILink {
    Title: string;
    Description: string;
    LinkLocation: ISPLink;
    BackgroundImageLocation: ISPLink;
    constructor(Title?: string, Description?: string, LinkLocation?: ISPLink, BackgroundImageLocation?: ISPLink);
}

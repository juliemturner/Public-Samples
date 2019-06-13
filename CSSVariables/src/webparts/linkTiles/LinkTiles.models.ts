export interface ISPLink {
  Url: string;
  Description: string;
}

export class SPLink implements ISPLink {
  constructor(
    public Url: string = "",
    public Description: string = ""
  ) { }
}

export interface ILink {
  Title: string;
  Description: string;
  LinkLocation: ISPLink;
  BackgroundImageLocation: ISPLink;
}


export class Link implements ILink {
  constructor(
    public Title: string = "",
    public Description: string = "",
    public LinkLocation: ISPLink = new SPLink(),
    public BackgroundImageLocation: ISPLink = new SPLink()
  ) { }
}
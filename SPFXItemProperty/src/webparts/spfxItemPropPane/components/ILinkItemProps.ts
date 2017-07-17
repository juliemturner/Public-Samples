export interface ILinkItemProps {
  title: string;
  description: string;
  url: string;
}

export class LinksItem implements ILinkItemProps {
    constructor (
        public title: string = null, 
        public url: string = null, 
        public description: string = null) { }
}
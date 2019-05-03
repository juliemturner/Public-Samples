export interface IGraphWorksheests {
  data: {
    value: [{
      id: string,
      position: number,
      name: string,
      visibility: string
    }]
  };
}

export interface IRangeData {
  values: [[any]];
  numberFormat: [[any]];
}

export class User {
  constructor(
    public email: string = "",
    public id: string = ""
  ) { }
}

export class Item {
  constructor(
    public id: string = "",
    public webUrl: string = "",
    public name: string = ""
  ) { }
}

export class Worksheet {
  constructor(
    public id: string = "",
    public name: string = "",
    public position: number = -1,
    public visibility: string = ""
  ) { }
}

export class Tables {
  constructor(
    public highlightFirstColumn: boolean = false,
    public highlightLastColumn: boolean = false,
    public id: string = "",
    public name: string = "",
    public showBandedColumns: boolean = false,
    public showBandedRows: boolean = false,
    public showFilterButton: boolean = false,
    public showHeaders: boolean = false,
    public showTotals: boolean = false,
    public style: string = ""
  ) { }
}

export class HelpDeskRequest {
  constructor(
    public id: string = "",
    public title: string = "",
    public status: string = "",
    public dueDate: Date = new Date(),
    public category: string = "",
    public businessUnit: string = "",
    public assignedTo: string = ""
  ) { }
}

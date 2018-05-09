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
  email: string;
  id: string;
}

export class Item {
  id: string;
  webUrl: string;
  name: string;
}

export class Worksheet {
  id: string;
  name: string;
  position: number;
  visibility: string;
}

export class Tables {
  highlightFirstColumn: boolean;
  highlightLastColumn: boolean;
  id: string;
  name: string;
  showBandedColumns: boolean;
  showBandedRows: boolean;
  showFilterButton: boolean;
  showHeaders: boolean;
  showTotals:boolean;
  style: string;
}

export class HelpDeskRequest {
  id: string;
  title: string;
  status: string;
  dueDate: Date;
  category: string;
  businessUnit: string;
  assignedTo: string;
}

export class DashboardData {
  driveItems: Item[] = [];
  driveItem: string;
  getWorksheets: boolean = false;
  tables: Tables[];
  getTables: boolean = false;
  worksheets: Worksheet[];
  renameSheet: boolean = false;
  addSheet: boolean = false;
  addData: boolean = false;
  helpDeskItems: HelpDeskRequest[];
  formatDates: boolean = false;
  createTable: boolean = false;
  addColumn: boolean = false;
  addRow: boolean = false;
  createChart: boolean = false;
  sessionId: string;
  grandTotal: number;
}

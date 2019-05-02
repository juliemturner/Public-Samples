export interface IITRequest {
  Id: string;
  Title: string;
  BusinessUnit: string;
  Category: string;
  Status: string;
  DueDate: Date;
  Assigned: string;
}

export class ITRequest implements IITRequest {
  constructor(
    public Id: string = "",
    public Title: string = "",
    public BusinessUnit: string = "",
    public Category: string = "",
    public Status: string = "",
    public DueDate: Date = null,
    public Assigned: string = ""
  ) { }
}

export interface IAssignedRequests {
  BusinessUnit: string;
  Assigned: string;
  Assignments: number;
}

export class AssignedRequests implements IAssignedRequests {
  constructor(
    public BusinessUnit: string = "",
    public Assigned: string = "",
    public Assignments: number = 1
  ) { }
}


export interface ICategoryRequests {
  Category: string;
  BusinessUnit: string;
  Requests: number;
}

export class CategoryRequests implements ICategoryRequests {
  constructor(
    public Category: string = "",
    public BusinessUnit: string = "",
    public Requests: number = 1
  ) { }
}

export interface IStatusRequests {
  Status: string;
  Requests: number;
}

export class StatusRequests implements IStatusRequests {
  constructor(
    public Status: string = "",
    public Requests: number = 1
  ) { }
}
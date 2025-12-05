//https://learn.microsoft.com/en-us/previous-versions/office/sharepoint-server/ee543793(v=office.15)
export enum ChangeType {
  NoChange = 0,
  Add = 1,
  Update = 2,
  DeleteObject = 3,
  Rename = 4,
  MoveAway = 5,
  MoveInto = 6,
  Restore = 7,
  RoleAdd = 8,
  RoleDelete = 9,
  RoleUpdate = 10,
  AssignmentAdd = 11,
  AssignmentDelete	= 12,
  MemberAdd	= 13,
  MemberDelete = 14,
  SystemUpdate = 15,
  Navigation = 16,
  ScopeAdd = 17,
  ScopeDelete = 18,
  ListContentTypeAdd = 19,
  ListContentTypeDelete	= 20,
  Dirty	= 21,
  Activity = 22,
};

export interface IChangeModel {
    "odata.type": string;
    "odata.id": string;
    "odata.editLink": string;
    ChangeToken: {
      StringValue: string;
    },
    ChangeType: ChangeType;
    SiteId: string;
    Time: Date;
    Editor: string;
    EditorEmailHint: string;
    ItemId: number;
    ListId: string;
    ServerRelativeUrl: string;
    SharedByUser: string;
    SharedWithUsers: string;
    UniqueId: string;
    WebId: string;
  }